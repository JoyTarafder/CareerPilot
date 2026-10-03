import { z } from 'zod';

export const ExtractedJobRequirementsSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  minExperienceYears: z.number().nonnegative().default(0),
  requiredDegrees: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type ExtractedJobRequirements = z.infer<typeof ExtractedJobRequirementsSchema>;

export const CreateJobRequestSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  rawContent: z.string().min(20, 'Job description must be at least 20 characters').max(50000),
});

export type CreateJobRequest = z.infer<typeof CreateJobRequestSchema>;

export const UpdateJobRequirementsRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  company: z.string().max(200).optional(),
  extractedData: ExtractedJobRequirementsSchema.optional(),
});

export type UpdateJobRequirementsRequest = z.infer<typeof UpdateJobRequirementsRequestSchema>;
