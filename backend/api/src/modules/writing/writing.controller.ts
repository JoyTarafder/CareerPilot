import { Request, Response, NextFunction } from 'express';
import {
  ImproveBulletRequestSchema,
  ImproveSummaryRequestSchema,
  GenerateCoverLetterRequestSchema,
} from '@careerpilot/contracts';
import { WritingService } from './writing.service.js';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

export class WritingController {
  constructor(private readonly service: WritingService) {}

  improveBullet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = ImproveBulletRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid bullet improvement payload', parsed.error.flatten().fieldErrors);
      }

      const result = await this.service.improveBullet(req.user.userId, parsed.data);
      res.status(200).json({
        success: true,
        improvement: result,
      });
    } catch (err) {
      next(err);
    }
  };

  improveSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = ImproveSummaryRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid summary improvement payload', parsed.error.flatten().fieldErrors);
      }

      const result = await this.service.improveSummary(req.user.userId, parsed.data);
      res.status(200).json({
        success: true,
        improvement: result,
      });
    } catch (err) {
      next(err);
    }
  };

  generateCoverLetter = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = GenerateCoverLetterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid cover letter payload', parsed.error.flatten().fieldErrors);
      }

      const result = await this.service.generateCoverLetter(req.user.userId, parsed.data);
      res.status(200).json({
        success: true,
        coverLetter: result,
      });
    } catch (err) {
      next(err);
    }
  };

  getQuota = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const quota = await this.service.getQuotaStatus(req.user.userId);
      res.status(200).json({
        success: true,
        quota,
      });
    } catch (err) {
      next(err);
    }
  };

  getAdminMetrics = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const metrics = await this.service.getAdminMetrics();
      res.status(200).json({
        success: true,
        metrics,
      });
    } catch (err) {
      next(err);
    }
  };
}
