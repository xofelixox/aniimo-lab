'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Aniimo, Skill, Synergy } from '@/types/database.types';
import { calculateSynergyRecommendations } from '@/lib/synergy-engine';
import { Sparkles, Plus, X, Award } from 'lucide-react';

export default function SynergyBuilderClient() {
  const [aniimoList, setAniimoList] = useState<Aniimo[]>([]);
  const [skillsByAniimo, setSkillsByAniimo] = useState<Record<string, Skill[]>>({});
  const [synergies, setSynergies] = useState<Synergy[]>([]);
  const [squad, setSquad] = useState<(Aniimo | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      const { data: aniimoData } = await supabase.from('aniimo').select('*').eq('status', 'published');
      const { data: skillsData } = await supabase.from('skills').select('*');
      const { data: synergyData } = await supabase.from('synergies').select('*');

      if (aniimoData) setAniimoList(aniimoData);
      if (synergyData) setSynergies(synergyData);

      if (skillsData) {
        const skillMap: Record<string, Skill[]> = {};
        skillsData.forEach((skill) => {
          if (!skillMap[skill.aniimo_id]) skillMap[skill.aniimo_id] = [];
          skillMap[skill.aniimo_id].push(skill);
        });
        setSkillsByAniimo(skillMap);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const recommendations = useMemo(() => {
    const activeSquad = squad.filter((item): item is Aniimo => item !== null);
    return calculateSynergyRecommendations(activeSquad, aniimoList, skillsByAniimo, synergies);
  }, [squad, aniimoList, skillsByAniimo, synergies]);

  const addToSquad = (aniimo: Aniimo) => {
    const emptyIndex = squad.findIndex((slot) => slot === null);
    if (emptyIndex !== -1) {
      const updated = [...squad];
      updated[emptyIndex] = aniimo;
      setSquad(updated);
    }
  };

  const removeFromSquad = (index: number) => {
    const updated = [...squad];
    updated[index] = null;
    setSquad(updated);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-medium">
        Loading Synergy Engine...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-teal-400" /> Interactive Synergy Planner
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Select squad members to calculate real-time role balance, elemental resonance, and deterministic synergies.
        </p>
      </div>

      {/* Squad Slots Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Current Squad (4 Slots)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {squad.map((member, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border flex items-center justify-between transition ${
                member
                  ? 'bg-slate-900 border-teal-500/40 shadow-lg shadow-teal-500/5'
                  : 'bg-slate-900/30 border-dashed border-slate-800'
              }`}
            >
              {member ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400">{member.element}</span>
                    <h3 className="font-bold text-slate-100">{member.name}</h3>
                    <p className="text-xs text-slate-400">{member.roles[0] || 'Flex'}</p>
                  </div>
                  <button
                    onClick={() => removeFromSquad(idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-600 text-xs w-full flex flex-col items-center gap-1">
                  <Plus className="w-5 h-5 text-slate-700" />
                  Slot {idx + 1} Empty
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Candidates Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-400" /> Compatible Teammate Recommendations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.slice(0, 6).map(({ candidate, totalScore, confidenceLabel, reasons }) => (
            <div key={candidate.id} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-teal-400">{candidate.element}</span>
                  <h3 className="text-lg font-bold text-slate-100">{candidate.name}</h3>
                  <p className="text-xs text-slate-400">Roles: {candidate.roles.join(', ')}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-teal-400">{totalScore} <span className="text-xs font-normal text-slate-400">pts</span></div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-semibold uppercase">
                    {confidenceLabel}
                  </span>
                </div>
              </div>

              {/* Reasons Breakdown */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {reasons.map((reason, rIdx) => (
                  <div key={rIdx} className="text-xs flex items-start gap-2 text-slate-300">
                    <span className="font-bold text-teal-400 text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                      +{reason.score}
                    </span>
                    <span>{reason.description}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addToSquad(candidate)}
                disabled={squad.every((s) => s !== null)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-teal-500 hover:text-slate-950 font-semibold text-xs text-slate-200 transition disabled:opacity-50"
              >
                Add to Squad
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}