import { z } from 'zod';

export const ApplicationStatusValues = [
  'SAVED',
  'APPLIED',
  'SCREENING',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
] as const;

export const ApplicationStatusSchema = z.enum(ApplicationStatusValues);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const CreateJobApplicationRequestSchema = z.object({
  company: z.string().min(1, 'Company name is required').max(200),
  role: z.string().min(1, 'Role title is required').max(200),
  jobUrl: z.string().url('Must be a valid URL').max(2000).optional().nullable(),
  status: ApplicationStatusSchema.default('SAVED'),
  salaryNote: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  appliedDate: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  resumeVersionId: z.string().uuid().optional().nullable(),
  matchAnalysisId: z.string().uuid().optional().nullable(),
});

export type CreateJobApplicationRequest = z.infer<typeof CreateJobApplicationRequestSchema>;

export const UpdateJobApplicationRequestSchema = CreateJobApplicationRequestSchema.partial();
export type UpdateJobApplicationRequest = z.infer<typeof UpdateJobApplicationRequestSchema>;

export const UpdateApplicationStatusRequestSchema = z.object({
  status: ApplicationStatusSchema,
});
export type UpdateApplicationStatusRequest = z.infer<typeof UpdateApplicationStatusRequestSchema>;

export const ApplicationFilterQuerySchema = z.object({
  status: ApplicationStatusSchema.optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['createdAt', 'appliedDate', 'interviewDate', 'followUpDate', 'company', 'role'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ApplicationFilterQuery = z.infer<typeof ApplicationFilterQuerySchema>;

export interface ApplicationMetricsResponse {
  total: number;
  active: number;
  responseRate: number; // % that progressed past APPLIED
  interviewRate: number; // % that reached INTERVIEW or OFFER
  offerRate: number; // % that reached OFFER
  byStatus: Record<ApplicationStatus, number>;
}

export interface JobApplicationResponse {
  id: string;
  userId: string;
  company: string;
  role: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  salaryNote?: string | null;
  location?: string | null;
  appliedDate?: string | null;
  followUpDate?: string | null;
  interviewDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  resumeVersionId?: string | null;
  resumeVersion?: {
    id: string;
    versionNumber: number;
    resumeTitle: string;
  } | null;
  matchAnalysisId?: string | null;
  matchAnalysis?: {
    id: string;
    score?: number | null;
    scoringVersion: string;
  } | null;
}
