import { z } from 'zod';

export const ResumeTemplateEnum = z.enum(['Foundation', 'Editorial', 'Technical']);
export type ResumeTemplate = z.infer<typeof ResumeTemplateEnum>;

export const ResumeSectionType = z.enum(['summary', 'experience', 'education', 'projects', 'skills']);
export type ResumeSection = z.infer<typeof ResumeSectionType>;

export const ResumeEducationItemSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  fieldOfStudy: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
});

export const ResumeExperienceItemSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const ResumeProjectItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().optional(),
  technologies: z.array(z.string()).default([]),
});

export const ResumeSkillGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string()).default([]),
});

export const ResumePersonalInfoSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  portfolioUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

export const ResumeContentSnapshotSchema = z.object({
  personalInfo: ResumePersonalInfoSchema,
  summary: z.string().optional(),
  educations: z.array(ResumeEducationItemSchema).default([]),
  experiences: z.array(ResumeExperienceItemSchema).default([]),
  projects: z.array(ResumeProjectItemSchema).default([]),
  skills: z.array(ResumeSkillGroupSchema).default([]),
  sectionOrder: z.array(ResumeSectionType).default(['summary', 'experience', 'education', 'projects', 'skills']),
  template: ResumeTemplateEnum.default('Foundation'),
});

export type ResumeContentSnapshot = z.infer<typeof ResumeContentSnapshotSchema>;

export const CreateResumeRequestSchema = z.object({
  title: z.string().min(1).max(200),
  templateName: ResumeTemplateEnum.default('Foundation'),
  fromProfile: z.boolean().default(true),
  initialContent: ResumeContentSnapshotSchema.optional(),
});

export type CreateResumeRequest = z.infer<typeof CreateResumeRequestSchema>;

export const UpdateResumeRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  templateName: ResumeTemplateEnum.optional(),
  content: ResumeContentSnapshotSchema.optional(),
});

export type UpdateResumeRequest = z.infer<typeof UpdateResumeRequestSchema>;
