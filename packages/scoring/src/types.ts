export interface Evidence {
  requirementId: string;
  requirementTitle: string;
  matchedText: string;
  section: 'skills' | 'experience' | 'education' | 'projects';
  confidence: number;
}

export interface Requirement {
  id: string;
  title: string;
  category: 'requiredSkill' | 'preferredSkill' | 'experience' | 'education' | 'keyword';
  isOptional: boolean;
}

export interface NormalizedResumeEvidence {
  skills: string[];
  experienceYears: number;
  educationDegrees: string[];
  keywords: string[];
}

export interface NormalizedJobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  requiredDegrees: string[];
  keywords: string[];
}

export interface ScoringWeights {
  requiredSkills: number;
  preferredSkills: number;
  experienceRelevance: number;
  roleAlignment: number;
  educationCertification: number;
  keywordCoverage: number;
  atsReadability: number;
}

export interface ScoringRuleSet {
  version: string;
  weights: ScoringWeights;
}

export interface MatchInput {
  resume: NormalizedResumeEvidence;
  job: NormalizedJobRequirements;
  rules: ScoringRuleSet;
}

export interface MatchResult {
  score: number;
  categories: Record<string, number>;
  matchedEvidence: Evidence[];
  missingRequirements: Requirement[];
  recommendations: string[];
  scoringVersion: string;
}
