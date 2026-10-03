import { MatchInput, MatchResult, ScoringRuleSet } from './types.js';
import { normalizeSkill } from './dictionary.js';

export const DEFAULT_SCORING_RULESET_V1: ScoringRuleSet = {
  version: '1.0.0',
  weights: {
    requiredSkills: 0.30,
    preferredSkills: 0.10,
    experienceRelevance: 0.20,
    roleAlignment: 0.10,
    educationCertification: 0.10,
    keywordCoverage: 0.10,
    atsReadability: 0.10,
  },
};

/**
 * Pure deterministic calculation of match compatibility.
 * Given identical inputs and rules, this function is strictly guaranteed to return the exact same output.
 */
export function calculateMatch(input: MatchInput): MatchResult {
  const { resume, job, rules } = input;
  const matchedEvidence: MatchResult['matchedEvidence'] = [];
  const missingRequirements: MatchResult['missingRequirements'] = [];
  const recommendations: string[] = [];

  // Match required skills with alias normalization
  const resumeSkillsNormalized = new Set(resume.skills.map((s) => normalizeSkill(s)));
  let matchedRequiredSkillsCount = 0;

  for (const skill of job.requiredSkills) {
    const normalizedSkill = normalizeSkill(skill);
    if (resumeSkillsNormalized.has(normalizedSkill)) {
      matchedRequiredSkillsCount++;
      matchedEvidence.push({
        requirementId: `req-skill-${normalizedSkill}`,
        requirementTitle: skill,
        matchedText: skill,
        section: 'skills',
        confidence: 1.0,
      });
    } else {
      missingRequirements.push({
        id: `req-skill-${normalizedSkill}`,
        title: skill,
        category: 'requiredSkill',
        isOptional: false,
      });
    }
  }

  const requiredSkillScore =
    job.requiredSkills.length > 0
      ? (matchedRequiredSkillsCount / job.requiredSkills.length) * 100
      : 100;

  // Match preferred skills with alias normalization
  let matchedPreferredSkillsCount = 0;
  for (const skill of job.preferredSkills) {
    const normalizedSkill = normalizeSkill(skill);
    if (resumeSkillsNormalized.has(normalizedSkill)) {
      matchedPreferredSkillsCount++;
      matchedEvidence.push({
        requirementId: `pref-skill-${normalizedSkill}`,
        requirementTitle: skill,
        matchedText: skill,
        section: 'skills',
        confidence: 1.0,
      });
    } else {
      missingRequirements.push({
        id: `pref-skill-${normalizedSkill}`,
        title: skill,
        category: 'preferredSkill',
        isOptional: true,
      });
    }
  }

  const preferredSkillScore =
    job.preferredSkills.length > 0
      ? (matchedPreferredSkillsCount / job.preferredSkills.length) * 100
      : 100;

  // Experience calculation
  const experienceRatio =
    job.minExperienceYears > 0
      ? Math.min(resume.experienceYears / job.minExperienceYears, 1.0)
      : 1.0;
  const experienceScore = Math.round(experienceRatio * 100);

  if (job.minExperienceYears > resume.experienceYears) {
    missingRequirements.push({
      id: 'req-exp-years',
      title: `${job.minExperienceYears} years of experience required (Resume shows ${resume.experienceYears} years)`,
      category: 'experience',
      isOptional: false,
    });
  }

  // Education calculation
  const resumeDegreesLower = new Set(resume.educationDegrees.map((d) => d.toLowerCase().trim()));
  let hasDegree = job.requiredDegrees.length === 0;
  for (const deg of job.requiredDegrees) {
    if (resumeDegreesLower.has(deg.toLowerCase().trim())) {
      hasDegree = true;
      break;
    }
  }
  const educationScore = hasDegree ? 100 : 0;
  if (!hasDegree && job.requiredDegrees.length > 0) {
    missingRequirements.push({
      id: 'req-degree',
      title: `Required Degree: ${job.requiredDegrees.join(' or ')}`,
      category: 'education',
      isOptional: false,
    });
  }

  // Keywords
  const resumeKeywordsNormalized = new Set(resume.keywords.map((k) => normalizeSkill(k)));
  let matchedKeywordCount = 0;
  for (const kw of job.keywords) {
    if (resumeKeywordsNormalized.has(normalizeSkill(kw))) {
      matchedKeywordCount++;
    }
  }
  const keywordScore =
    job.keywords.length > 0 ? (matchedKeywordCount / job.keywords.length) * 100 : 100;

  const atsReadabilityScore = 100;
  const roleAlignmentScore = 100;

  // Weighted total
  const rawScore =
    requiredSkillScore * rules.weights.requiredSkills +
    preferredSkillScore * rules.weights.preferredSkills +
    experienceScore * rules.weights.experienceRelevance +
    roleAlignmentScore * rules.weights.roleAlignment +
    educationScore * rules.weights.educationCertification +
    keywordScore * rules.weights.keywordCoverage +
    atsReadabilityScore * rules.weights.atsReadability;

  // Generate 3 actionable recommendations
  const missingRequired = missingRequirements.filter((r) => !r.isOptional);
  if (missingRequired.length > 0) {
    const skillsList = missingRequired
      .slice(0, 3)
      .map((r) => r.title)
      .join(', ');
    recommendations.push(
      `Evidence missing for key requirements: ${skillsList}. Add verified project or work evidence if you have experience with these.`
    );
  }

  const missingPreferred = missingRequirements.filter((r) => r.isOptional);
  if (missingPreferred.length > 0) {
    recommendations.push(
      `Preferred skills like ${missingPreferred[0]?.title} could strengthen your application if highlighted in your project section.`
    );
  }

  if (recommendations.length < 3) {
    recommendations.push(
      'Ensure your bullet points quantify outcomes and impact using measurable metrics.'
    );
  }
  if (recommendations.length < 3) {
    recommendations.push(
      'Tailor your professional summary to explicitly highlight the target role title.'
    );
  }

  return {
    score: Math.round(rawScore),
    categories: {
      requiredSkills: Math.round(requiredSkillScore),
      preferredSkills: Math.round(preferredSkillScore),
      experienceRelevance: Math.round(experienceScore),
      roleAlignment: Math.round(roleAlignmentScore),
      educationCertification: Math.round(educationScore),
      keywordCoverage: Math.round(keywordScore),
      atsReadability: Math.round(atsReadabilityScore),
    },
    matchedEvidence,
    missingRequirements,
    recommendations: recommendations.slice(0, 3),
    scoringVersion: rules.version,
  };
}
