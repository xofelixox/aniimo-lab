-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE verification_status AS ENUM ('verified_in_game', 'theorycrafted', 'needs_testing', 'outdated');
CREATE TYPE synergy_type AS ENUM ('elemental_combo', 'role_complement', 'skill_chain', 'buff_synergy', 'defensive_cover');

-- 1. PATCHES TABLE
CREATE TABLE patches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_number VARCHAR(50) NOT NULL UNIQUE,
    release_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANIIMO TABLE
CREATE TABLE aniimo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    element VARCHAR(50) NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    verification_notes TEXT,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SKILLS TABLE
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aniimo_id UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(50) NOT NULL, -- e.g., Basic, Special, Ultimate, Passive
    description TEXT,
    effect_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAMS TABLE
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    gameplay_instructions TEXT,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    game_mode VARCHAR(50) NOT NULL, -- e.g., PvP, Boss Raid, Exploration
    difficulty VARCHAR(50) NOT NULL, -- e.g., Beginner, Intermediate, Expert
    patch_id UUID REFERENCES patches(id) ON DELETE SET NULL,
    verification_status verification_status DEFAULT 'theorycrafted',
    last_verified_at DATE DEFAULT CURRENT_DATE,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAM MEMBERS (Junction Table)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    aniimo_id UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    role_in_team VARCHAR(50) NOT NULL, -- e.g., Main DPS, Sub DPS, Shield Support
    slot_position INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, aniimo_id),
    UNIQUE(team_id, slot_position)
);

-- 6. TEAM ALTERNATIVES
CREATE TABLE team_alternatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    original_aniimo_id UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    substitute_aniimo_id UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    tradeoff_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SYNERGIES TABLE
CREATE TABLE synergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aniimo_id_1 UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    aniimo_id_2 UUID NOT NULL REFERENCES aniimo(id) ON DELETE CASCADE,
    synergy_type synergy_type NOT NULL,
    explanation TEXT NOT NULL,
    evidence_notes TEXT,
    verification_status verification_status DEFAULT 'theorycrafted',
    patch_id UUID REFERENCES patches(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_aniimo_pair UNIQUE (aniimo_id_1, aniimo_id_2)
);

-- 8. ADMIN USERS TABLE (Linked to Supabase Auth)
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_aniimo_slug ON aniimo(slug);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_skills_aniimo ON skills(aniimo_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_synergies_pair ON synergies(aniimo_id_1, aniimo_id_2);

-- AUTOMATIC UPDATED_AT TIMESTAMP FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_aniimo_modtime BEFORE UPDATE ON aniimo FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_teams_modtime BEFORE UPDATE ON teams FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_skills_modtime BEFORE UPDATE ON skills FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_synergies_modtime BEFORE UPDATE ON synergies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================

ALTER TABLE aniimo ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE synergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE patches ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_profiles WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Access Policies (Read-Only for Published Content)
CREATE POLICY "Public can view published Aniimo" ON aniimo FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view skills of published Aniimo" ON skills FOR SELECT USING (
    EXISTS (SELECT 1 FROM aniimo WHERE aniimo.id = skills.aniimo_id AND aniimo.status = 'published')
);
CREATE POLICY "Public can view published Teams" ON teams FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view members of published Teams" ON team_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.status = 'published')
);
CREATE POLICY "Public can view alternatives for published Teams" ON team_alternatives FOR SELECT USING (
    EXISTS (SELECT 1 FROM teams WHERE teams.id = team_alternatives.team_id AND teams.status = 'published')
);
CREATE POLICY "Public can view synergies" ON synergies FOR SELECT USING (TRUE);
CREATE POLICY "Public can view patches" ON patches FOR SELECT USING (TRUE);

-- Admin Full Access Policies (CRUD for Authenticated Admins)
CREATE POLICY "Admins have full access to aniimo" ON aniimo FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to skills" ON skills FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to teams" ON teams FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to team_members" ON team_members FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to team_alternatives" ON team_alternatives FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to synergies" ON synergies FOR ALL USING (is_admin());
CREATE POLICY "Admins have full access to patches" ON patches FOR ALL USING (is_admin());
CREATE POLICY "Admins can view admin_profiles" ON admin_profiles FOR SELECT USING (is_admin());