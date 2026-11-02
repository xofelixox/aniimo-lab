import { Suspense } from 'react';
import Link from 'next/link';
import { Sparkles, Users, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

async function HomeContent() {
  const supabase = await createClient();

  const { data: featuredTeams } = await supabase
    .from('teams')
    .select('id, title, slug, description, game_mode, difficulty, verification_status')
    .eq('status', 'published')
    .limit(3);

  const { data: recentAniimo } = await supabase
    .from('aniimo')
    .select('id, name, slug, element, roles, image_url')
    .eq('status', 'published')
    .limit(4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 border-b border-slate-900 bg-gradient-to-b from-slate-900/50 to-slate-950">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Version 1.0 Live Synergy Engine
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100">
            Master Your Compositions with <span className="text-teal-400">Aniimo Lab</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Explore verified team builds, analyze elemental and role synergies, and optimize your lineup with our deterministic synergy recommendation engine.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/teams"
              className="px-6 py-3 rounded-lg bg-teal-500 text-slate-950 font-semibold hover:bg-teal-400 transition flex items-center gap-2 shadow-lg shadow-teal-500/10"
            >
              Browse Team Builds <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/aniimo"
              className="px-6 py-3 rounded-lg bg-slate-900 border border-slate-800 font-semibold hover:bg-slate-800 transition"
            >
              Explore Aniimo Database
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Teams */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-teal-400" /> Featured Team Compositions
            </h2>
            <p className="text-slate-400 text-sm">Top meta builds tested for current game patches.</p>
          </div>
          <Link href="/teams" className="text-sm font-medium text-teal-400 hover:underline">
            View all teams &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredTeams && featuredTeams.length > 0 ? (
            featuredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.slug}`}
                className="group p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 font-medium">
                      {team.game_mode}
                    </span>
                    <span className="text-slate-500">{team.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-400 transition">
                    {team.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{team.description}</p>
                </div>
                <div className="pt-6 flex items-center gap-2 text-xs text-slate-500 border-t border-slate-800/80 mt-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{team.verification_status.replace('_', ' ')}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              No published teams yet. Add some via the admin dashboard!
            </div>
          )}
        </div>
      </section>

      {/* Recently Updated Aniimo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-6 h-6 text-teal-400" /> Aniimo Roster
            </h2>
            <p className="text-slate-400 text-sm">Discover elemental affinities and roles.</p>
          </div>
          <Link href="/aniimo" className="text-sm font-medium text-teal-400 hover:underline">
            View full database &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentAniimo && recentAniimo.length > 0 ? (
            recentAniimo.map((aniimo) => (
              <Link
                key={aniimo.id}
                href={`/aniimo/${aniimo.slug}`}
                className="group p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                  {aniimo.image_url ? (
                    <img src={aniimo.image_url} alt={aniimo.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-slate-600" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-teal-400 font-medium">{aniimo.element}</span>
                  <h3 className="font-bold text-slate-100 group-hover:text-teal-400 transition">{aniimo.name}</h3>
                  <p className="text-xs text-slate-400">{aniimo.roles.join(', ')}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              No published Aniimo yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="text-slate-400 py-32 text-center">Loading Aniimo Lab...</div>}>
      <HomeContent />
    </Suspense>
  );
}