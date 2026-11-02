import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

async function TeamsList() {
  const supabase = await createClient();
  const { data: teamsList } = await supabase
    .from('teams')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teamsList && teamsList.length > 0 ? (
        teamsList.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.slug}`}
            className="group p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 font-medium">
                  {team.game_mode || 'General'}
                </span>
                <span className="text-slate-500 capitalize">{team.difficulty || 'Intermediate'}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 group-hover:text-teal-400 transition">
                {team.title}
              </h2>
              <p className="text-slate-400 text-sm line-clamp-2">{team.description}</p>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 mt-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span className="capitalize">{team.verification_status?.replace('_', ' ') || 'Community'}</span>
              </div>
              <span className="text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition">
                View Build <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-3 text-center py-16 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
          No published team compositions found.
        </div>
      )}
    </div>
  );
}

export default function TeamsIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Users className="w-8 h-8 text-teal-400" /> Meta Team Compositions
        </h1>
        <p className="text-slate-400 mt-1">Explore verified squad lineups, rotations, and synergy strategies.</p>
      </div>

      <Suspense fallback={<div className="text-slate-400 py-16 text-center">Loading team compositions...</div>}>
        <TeamsList />
      </Suspense>
    </div>
  );
}