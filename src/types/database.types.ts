export type ContentStatus = 'draft' | 'published' | 'archived';
export type VerificationStatus = 'verified_in_game' | 'theorycrafted' | 'needs_testing' | 'outdated';
export type SynergyType = 'elemental_combo' | 'role_complement' | 'skill_chain' | 'buff_synergy' | 'defensive_cover';

export interface Aniimo {
  id: string;
  slug: string;
  name: string;
  element: string;
  roles: string[];
  description: string | null;
  image_url: string | null;
  verification_notes: string | null;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  aniimo_id: string;
  name: string;
  skill_type: string;
  description: string | null;
  effect_tags: string[];
}

export interface Team {
  id: string;
  slug: string;
  title: string;
  description: string;
  gameplay_instructions: string | null;
  strengths: string[];
  weaknesses: string[];
  game_mode: string;
  difficulty: string;
  verification_status: VerificationStatus;
  last_verified_at: string;
  status: ContentStatus;
  created_at: string;
}

export interface TeamMemberWithAniimo {
  id: string;
  role_in_team: string;
  slot_position: number;
  aniimo: Aniimo;
}

export interface Synergy {
  id: string;
  aniimo_id_1: string;
  aniimo_id_2: string;
  synergy_type: SynergyType;
  explanation: string;
  evidence_notes: string | null;
  verification_status: VerificationStatus;
}