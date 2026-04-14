import type { TeamBuilderRequest, TeamBuilderResponse } from "@/server/intelligence/types";
import { clamp, cosineSimilarity, deterministicEmbedding, extractRequiredSkills, unique } from "@/server/intelligence/utils";

export const buildTeam = async (request: TeamBuilderRequest): Promise<TeamBuilderResponse> => {
  const requiredSkills = extractRequiredSkills(request.ideaText);
  const pool = request.collaboratorPool || [];

  const skillCoverage = new Set<string>();
  for (const profile of pool) {
    for (const skill of profile.skills || []) skillCoverage.add(skill.toUpperCase());
  }

  const skillGaps = requiredSkills.filter((skill) => !skillCoverage.has(skill.toUpperCase()));
  const ideaVec = deterministicEmbedding(request.ideaText);

  const rankedCollaborators = pool
    .map((profile) => {
      const normalizedSkills = unique((profile.skills || []).map((skill) => skill.toUpperCase()));
      const matchedSkills = requiredSkills.filter((skill) => normalizedSkills.includes(skill.toUpperCase()));

      const profileVec = deterministicEmbedding(`${profile.department} ${normalizedSkills.join(" ")}`);
      const semanticFit = cosineSimilarity(ideaVec, profileVec);

      const skillFit = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0;
      const experienceBoost = Math.min(1, (profile.experienceYears || 0) / 8) * 0.15;
      const compatibilityScore = clamp((semanticFit * 0.55 + skillFit * 0.45 + experienceBoost) * 100, 0, 100);

      return {
        collaboratorId: profile.id,
        name: profile.name,
        compatibilityScore: Number(compatibilityScore.toFixed(2)),
        matchedSkills,
        reasoning: `${matchedSkills.length} required skills matched; semantic fit ${Math.round(semanticFit * 100)}%.`,
      };
    })
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, request.topN || 5);

  return {
    requiredSkills,
    skillGaps,
    rankedCollaborators,
  };
};
