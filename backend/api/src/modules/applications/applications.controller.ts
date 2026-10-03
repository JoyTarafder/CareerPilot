import { Request, Response, NextFunction } from 'express';
import {
  CreateJobApplicationRequestSchema,
  UpdateJobApplicationRequestSchema,
  UpdateApplicationStatusRequestSchema,
  ApplicationFilterQuerySchema,
} from '@careerpilot/contracts';
import { ApplicationsService } from './applications.service.js';
import { ValidationError } from '../../core/errors.js';

export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  createApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = CreateJobApplicationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid application payload', parsed.error.flatten().fieldErrors);
      }

      const application = await this.service.createApplication(req.user!.userId, parsed.data);
      res.status(201).json({
        success: true,
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  listApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = ApplicationFilterQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', parsed.error.flatten().fieldErrors);
      }

      const result = await this.service.listApplications(req.user!.userId, parsed.data);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.service.getMetrics(req.user!.userId);
      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (error) {
      next(error);
    }
  };

  getReminders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const daysAhead = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const reminders = await this.service.getReminders(req.user!.userId, isNaN(daysAhead) ? 7 : daysAhead);
      res.status(200).json({
        success: true,
        reminders,
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application = await this.service.getApplicationById(req.user!.userId, req.params.id as string);
      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  updateApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = UpdateJobApplicationRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid update payload', parsed.error.flatten().fieldErrors);
      }

      const application = await this.service.updateApplication(
        req.user!.userId,
        req.params.id as string,
        parsed.data
      );
      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = UpdateApplicationStatusRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid status payload', parsed.error.flatten().fieldErrors);
      }

      const application = await this.service.updateStatus(
        req.user!.userId,
        req.params.id as string,
        parsed.data.status
      );
      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteApplication(req.user!.userId, req.params.id as string);
      res.status(200).json({
        success: true,
        message: 'Application deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
