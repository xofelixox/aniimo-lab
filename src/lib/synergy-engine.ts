import { Aniimo, Skill, Synergy } from '@/types/database.types';

export interface SynergyReason {
  score: number;
  category: 'Explicit Synergy' | 'Elemental Resonance' | 'Role Balance' | 'Skill Combination';
  description: string;
}

export interface RecommendationResult {
  candidate: Aniimo;
  totalScore: number;
  confidenceLabel: 'High Synergy' | 'Moderate Synergy' | 'Basic Compatibility' | 'Low Synergy';
  reasons: SynergyReason[];
}

/**
 * Calculates deterministic synergy recommendations for candidate Aniimo based on current squad.
 */
export function calculateSynergyRecommendations(
  squad: Aniimo[],
  candidates: Aniimo[],
  skillsByAniimo: Record<string, Skill[]>,
  explicitSynergies: Synergy[]
): RecommendationResult[] {
  if (squad.length === 0) {
    return candidates.map((candidate) => ({
      candidate,
      totalScore: 0,
      confidenceLabel: 'Basic Compatibility',
      reasons: [{ score: 0, category: 'Role Balance', description: 'Select at least one team member to calculate synergies.' }],
    }));
  }

  const squadIds = new Set(squad.map((a) => a.id));
  const availableCandidates = candidates.filter((c) => !squadIds.has(c.id));

  const results: RecommendationResult[] = availableCandidates.map((candidate) => {
    const reasons: SynergyReason[] = [];
    let totalScore = 0;

    // 1. Explicit Synergy Database Check (40 pts max per pairing)
    for (const member of squad) {
      const match = explicitSynergies.find(
        (s) =>
          (s.aniimo_id_1 === member.id && s.aniimo_id_2 === candidate.id) ||
          (s.aniimo_id_1 === candidate.id && s.aniimo_id_2 === member.id)
      );

      if (match) {
        const score = match.verification_status === 'verified_in_game' ? 40 : 25;
        totalScore += score;
        reasons.push({
          score,
          category: 'Explicit Synergy',
          description: `Direct synergy with ${member.name}: ${match.explanation}`,
        });
      }
    }

    // 2. Elemental Resonance Check (20 pts)
    const squadElements = squad.map((a) => a.element);
    if (squadElements.includes(candidate.element)) {
      totalScore += 20;
      reasons.push({
        score: 20,
        category: 'Elemental Resonance',
        description: `Shares ${candidate.element} element with current squad, triggering elemental affinity bonus.`,
      });
    }

    // 3. Role Complementarity Check (20 pts)
    const squadRoles = new Set(squad.flatMap((a) => a.roles));
    const candidateRoles = candidate.roles;

    const needsMainDps = !squadRoles.has('Main DPS');
    const needsSupport = !squadRoles.has('Support') && !squadRoles.has('Healer') && !squadRoles.has('Shield');

    if (needsMainDps && candidateRoles.includes('Main DPS')) {
      totalScore += 20;
      reasons.push({
        score: 20,
        category: 'Role Balance',
        description: 'Fills missing Main DPS role in squad.',
      });
    } else if (needsSupport && (candidateRoles.includes('Support') || candidateRoles.includes('Healer') || candidateRoles.includes('Shield'))) {
      totalScore += 20;
      reasons.push({
        score: 20,
        category: 'Role Balance',
        description: 'Fills essential defensive/support role in squad.',
      });
    }

    // 4. Skill Effect Tag Combinations (20 pts)
    const squadEffectTags = new Set(
      squad.flatMap((a) => (skillsByAniimo[a.id] || []).flatMap((s) => s.effect_tags || []))
    );
    const candidateEffectTags = (skillsByAniimo[candidate.id] || []).flatMap((s) => s.effect_tags || []);

    const complementaryPairs = [
      { tag1: 'Freeze', tag2: 'Shatter', desc: 'Freezes enemies for Shatter extra burst' },
      { tag1: 'Shield', tag2: 'Taunt', desc: 'Combines defensive shield with aggro control' },
      { tag1: 'Vulnerability', tag2: 'Crit Boost', desc: 'Stacks damage vulnerability with critical strikes' },
    ];

    for (const pair of complementaryPairs) {
      if (
        (squadEffectTags.has(pair.tag1) && candidateEffectTags.includes(pair.tag2)) ||
        (squadEffectTags.has(pair.tag2) && candidateEffectTags.includes(pair.tag1))
      ) {
        totalScore += 20;
        reasons.push({
          score: 20,
          category: 'Skill Combination',
          description: `Skill effect combo: ${pair.desc}`,
        });
      }
    }

    // Determine Confidence Label
    let confidenceLabel: RecommendationResult['confidenceLabel'] = 'Low Synergy';
    if (totalScore >= 60) confidenceLabel = 'High Synergy';
    else if (totalScore >= 35) confidenceLabel = 'Moderate Synergy';
    else if (totalScore >= 15) confidenceLabel = 'Basic Compatibility';

    return {
      candidate,
      totalScore,
      confidenceLabel,
      reasons,
    };
  });

  return results.sort((a, b) => b.totalScore - a.totalScore);
}