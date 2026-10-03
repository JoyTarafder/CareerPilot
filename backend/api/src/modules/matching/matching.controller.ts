import { Request, Response, NextFunction } from 'express';
import { MatchingService } from './matching.service.js';
import { CreateAnalysisRequestSchema } from '@careerpilot/contracts';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  createAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const parsed = CreateAnalysisRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid analysis request', parsed.error.flatten().fieldErrors);
      }

      const analysis = await this.matchingService.createAnalysis(req.user.userId, parsed.data);
      res.status(201).json({ analysis });
    } catch (err) {
      next(err);
    }
  };

  getAnalysis = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const analysis = await this.matchingService.getAnalysis(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json({ analysis });
    } catch (err) {
      next(err);
    }
  };

  listAnalysesForResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError('Authentication required');
      const analyses = await this.matchingService.listAnalysesForResume(
        req.user.userId,
        req.params.resumeVersionId as string
      );
      res.status(200).json({ analyses });
    } catch (err) {
      next(err);
    }
  };
}
