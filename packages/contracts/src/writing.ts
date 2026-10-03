import { z } from 'zod';

export const ImproveBulletRequestSchema = z.object({
  originalBullet: z.string().min(5, 'Bullet must be at least 5 characters').max(1000),
  contextRole: z.string().max(200).optional(),
  targetJobKeywords: z.array(z.string()).default([]),
});

export type ImproveBulletRequest = z.infer<typeof ImproveBulletRequestSchema>;

export interface BulletImprovementResponse {
  original: string;
  suggested: string;
  why: string;
  unsupportedClaimsWarning: string | null;
}

export const ImproveSummaryRequestSchema = z.object({
  originalSummary: z.string().min(10, 'Summary must be at least 10 characters').max(3000),
  targetRole: z.string().min(1, 'Target role is required').max(200),
  skills: z.array(z.string()).default([]),
});

export type ImproveSummaryRequest = z.infer<typeof ImproveSummaryRequestSchema>;

export interface SummaryImprovementResponse {
  original: string;
  suggested: string;
  why: string;
  unsupportedClaimsWarning: string | null;
}

export const GenerateCoverLetterRequestSchema = z.object({
  resumeVersionId: z.string().uuid('Valid resume version ID is required'),
  jobDescriptionId: z.string().uuid('Valid job description ID is required'),
  tone: z.enum(['professional', 'concise', 'enthusiastic']).default('professional'),
});

export type GenerateCoverLetterRequest = z.infer<typeof GenerateCoverLetterRequestSchema>;

export interface CoverLetterResponse {
  recipient: string;
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
  groundedClaims: string[];
  unsupportedClaimsWarning: string | null;
}

export interface AIQuotaStatusResponse {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  resetAt: string;
}

export interface AdminCostMetricsResponse {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  estimatedTokens: number;
  estimatedCostUsd: number;
}
