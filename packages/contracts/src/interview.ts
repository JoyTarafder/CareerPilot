import { z } from 'zod';

export const InterviewTypeValues = ['HR', 'BEHAVIORAL', 'TECHNICAL', 'CV_BASED', 'MIXED'] as const;
export const InterviewTypeSchema = z.enum(InterviewTypeValues);
export type InterviewType = z.infer<typeof InterviewTypeSchema>;

export const StartInterviewSessionRequestSchema = z.object({
  targetRole: z.string().min(1, 'Target role is required').max(200),
  interviewType: InterviewTypeSchema.default('MIXED'),
  resumeVersionId: z.string().uuid().optional().nullable(),
  jobDescriptionId: z.string().uuid().optional().nullable(),
});

export type StartInterviewSessionRequest = z.infer<typeof StartInterviewSessionRequestSchema>;

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: InterviewType;
  starPrompt: string; // Guidance for candidate: Situation, Task, Action, Result
  groundedContext?: string | null;
}

export const SubmitAnswerRequestSchema = z.object({
  questionText: z.string().min(1, 'Question text is required'),
  userAnswerText: z.string().min(5, 'Answer must be at least 5 characters').max(10000),
  category: InterviewTypeSchema.optional(),
});

export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;

export interface StructuredFeedback {
  relevance: number; // 1-5
  clarity: number; // 1-5
  structure: number; // 1-5 (STAR structure)
  evidence: number; // 1-5 (concrete facts vs generic statements)
  concision: number; // 1-5
  overallRating: number; // 1-5 stars
  feedbackSummary: string;
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  strengths: string[];
  areasForImprovement: string[];
  practiceRecommendation: string;
  nonEmotionNotice: string;
}

export interface InterviewAnswerResponse {
  id: string;
  questionText: string;
  userAnswerText: string;
  feedbackSummary?: string | null;
  starRating?: number | null;
  createdAt: string;
  feedbackDetails?: StructuredFeedback | null;
}

export interface InterviewSessionSummaryReport {
  totalQuestions: number;
  answeredQuestions: number;
  averageRating: number;
  overallStrengths: string[];
  practicePlan: string[];
}

export interface InterviewSessionResponse {
  id: string;
  userId: string;
  targetRole: string;
  interviewType: InterviewType;
  createdAt: string;
  completedAt?: string | null;
  questions: InterviewQuestion[];
  answers: InterviewAnswerResponse[];
  summaryReport?: InterviewSessionSummaryReport | null;
}
