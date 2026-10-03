import { z } from 'zod';

export const CreateAnalysisRequestSchema = z.object({
  resumeVersionId: z.string().min(1, 'resumeVersionId is required'),
  jobDescriptionId: z.string().min(1, 'jobDescriptionId is required'),
  scoringVersion: z.string().default('1.0.0'),
});

export type CreateAnalysisRequest = z.infer<typeof CreateAnalysisRequestSchema>;

export const MatchEvidenceSchema = z.object({
  requirementId: z.string(),
  requirementTitle: z.string(),
  matchedText: z.string(),
  section: z.enum(['skills', 'experience', 'education', 'projects']),
  confidence: z.number().min(0).max(1),
});

export type MatchEvidence = z.infer<typeof MatchEvidenceSchema>;

export const MissingRequirementSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(['requiredSkill', 'preferredSkill', 'experience', 'education', 'keyword']),
  isOptional: z.boolean(),
});

export type MissingRequirement = z.infer<typeof MissingRequirementSchema>;

export const MatchAnalysisResultSchema = z.object({
  id: z.string(),
  resumeVersionId: z.string(),
  jobDescriptionId: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  score: z.number().min(0).max(100),
  categories: z.record(z.string(), z.number()),
  matchedEvidence: z.array(MatchEvidenceSchema),
  missingRequirements: z.array(MissingRequirementSchema),
  recommendations: z.array(z.string()),
  scoringVersion: z.string(),
  disclaimer: z.string(),
  createdAt: z.string(),
});

export type MatchAnalysisResult = z.infer<typeof MatchAnalysisResultSchema>;
