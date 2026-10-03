import { Request, Response, NextFunction } from 'express';
import { JobsService } from './jobs.service.js';
import {
  CreateJobRequestSchema,
  UpdateJobRequirementsRequestSchema,
} from '@careerpilot/contracts';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  listJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const jobs = await this.jobsService.listJobs(req.user.userId);
      res.status(200).json({ jobs });
    } catch (err) {
      next(err);
    }
  };

  createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = CreateJobRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid job description input', parsed.error.flatten().fieldErrors);
      }

      const job = await this.jobsService.createJob(req.user.userId, parsed.data);
      res.status(201).json({ job });
    } catch (err) {
      next(err);
    }
  };

  getJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const job = await this.jobsService.getJob(req.user.userId, req.params.id as string);
      res.status(200).json({ job });
    } catch (err) {
      next(err);
    }
  };

  updateRequirements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = UpdateJobRequirementsRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid requirements update', parsed.error.flatten().fieldErrors);
      }

      const job = await this.jobsService.updateRequirements(
        req.user.userId,
        req.params.id as string,
        parsed.data
      );
      res.status(200).json({ job });
    } catch (err) {
      next(err);
    }
  };

  deleteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      await this.jobsService.deleteJob(req.user.userId, req.params.id as string);
      res.status(200).json({ message: 'Job description deleted' });
    } catch (err) {
      next(err);
    }
  };
}
