import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ShieldCheck, BookOpen } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function TeamDetail({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!team) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-semibold">
            {team.game_mode}
          </span>
          <span className="text-xs text-slate-400 capitalize">Difficulty: {team.difficulty}</span>
          <div className="flex items-center gap-1 text-xs text-emerald-400 ml-auto">
            <ShieldCheck className="w-4 h-4" />
            <span className="capitalize">{team.verification_status?.replace('_', ' ') || 'Verified'}</span>
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-100">{team.title}</h1>
        <p className="text-slate-300 text-base leading-relaxed">{team.description}</p>
      </div>

      {team.guide_content && (
        <div className="space-y-4 bg-slate-900/40 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" /> Strategy Guide & Rotations
          </h2>
          <div className="text-slate-300 text-sm whitespace-pre-line leading-relaxed">
            {team.guide_content}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-slate-400 py-20 text-center">Loading team build...</div>}>
      <TeamDetail params={params} />
    </Suspense>
  );
}