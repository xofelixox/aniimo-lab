import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Sparkles, Zap } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function AniimoDetail({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: aniimo } = await supabase
    .from('aniimo')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!aniimo) notFound();

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('aniimo_id', aniimo.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row gap-8 items-start bg-slate-900/60 p-8 rounded-2xl border border-slate-800">
        <div className="w-32 h-32 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
          {aniimo.image_url ? (
            <img src={aniimo.image_url} alt={aniimo.name} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-12 h-12 text-slate-600" />
          )}
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-teal-500/10 text-teal-400 text-xs font-semibold">
              {aniimo.element}
            </span>
            <span className="text-xs text-slate-400">Roles: {aniimo.roles.join(', ')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">{aniimo.name}</h1>
          <p className="text-slate-300 text-sm leading-relaxed">{aniimo.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-teal-400" /> Abilities & Skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills && skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill.id} className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-100">{skill.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {skill.skill_type}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{skill.description}</p>
                {skill.effect_tags && skill.effect_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skill.effect_tags.map((tag: string, idx: number) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              No registered skills for this character.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AniimoDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="text-slate-400 py-20 text-center">Loading character details...</div>}>
      <AniimoDetail params={params} />
    </Suspense>
  );
}