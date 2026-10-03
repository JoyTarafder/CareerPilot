import { Request, Response, NextFunction } from 'express';
import { ProfilesService } from './profiles.service.js';
import { z } from 'zod';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

const UpdateProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  targetRoles: z.array(z.string().max(100)).max(10).optional(),
  phoneNumber: z.string().max(30).optional(),
  location: z.string().max(100).optional(),
  portfolioUrl: z.string().url().max(255).optional().or(z.literal('')),
  githubUrl: z.string().url().max(255).optional().or(z.literal('')),
  linkedinUrl: z.string().url().max(255).optional().or(z.literal('')),
});

const EducationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(100),
  fieldOfStudy: z.string().min(1).max(100),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  isCurrent: z.boolean().default(false),
  grade: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  displayOrder: z.number().int().default(0),
});

const ExperienceSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(100),
  location: z.string().max(100).optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  isCurrent: z.boolean().default(false),
  description: z.string().max(2000).optional(),
  highlights: z.array(z.string().max(500)).default([]),
  displayOrder: z.number().int().default(0),
});

const ProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  url: z.string().url().max(255).optional().or(z.literal('')),
  technologies: z.array(z.string().max(50)).default([]),
  displayOrder: z.number().int().default(0),
});

export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const profile = await this.profilesService.getProfile(req.user.userId);
      res.status(200).json({ profile });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = UpdateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid profile input', parsed.error.flatten().fieldErrors);
      }

      const updated = await this.profilesService.updateProfile(req.user.userId, parsed.data);
      res.status(200).json({ profile: updated, message: 'Profile updated' });
    } catch (err) {
      next(err);
    }
  };

  addEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = EducationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid education input', parsed.error.flatten().fieldErrors);
      }

      const education = await this.profilesService.addEducation(req.user.userId, parsed.data);
      res.status(201).json({ education });
    } catch (err) {
      next(err);
    }
  };

  deleteEducation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      await this.profilesService.deleteEducation(req.user.userId, req.params.id as string);
      res.status(200).json({ message: 'Education deleted' });
    } catch (err) {
      next(err);
    }
  };

  addExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = ExperienceSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid experience input', parsed.error.flatten().fieldErrors);
      }

      const experience = await this.profilesService.addExperience(req.user.userId, parsed.data);
      res.status(201).json({ experience });
    } catch (err) {
      next(err);
    }
  };

  deleteExperience = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      await this.profilesService.deleteExperience(req.user.userId, req.params.id as string);
      res.status(200).json({ message: 'Experience deleted' });
    } catch (err) {
      next(err);
    }
  };

  addProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = ProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid project input', parsed.error.flatten().fieldErrors);
      }

      const project = await this.profilesService.addProject(req.user.userId, parsed.data);
      res.status(201).json({ project });
    } catch (err) {
      next(err);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      await this.profilesService.deleteProject(req.user.userId, req.params.id as string);
      res.status(200).json({ message: 'Project deleted' });
    } catch (err) {
      next(err);
    }
  };
}
