import { Request, Response, NextFunction } from 'express';
import {
  StartInterviewSessionRequestSchema,
  SubmitAnswerRequestSchema,
} from '@careerpilot/contracts';
import { InterviewService } from './interview.service.js';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';

export class InterviewController {
  constructor(private readonly service: InterviewService) {}

  startSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = StartInterviewSessionRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid interview session payload', parsed.error.flatten().fieldErrors);
      }

      const session = await this.service.startSession(req.user.userId, parsed.data);
      res.status(201).json({
        success: true,
        session,
      });
    } catch (err) {
      next(err);
    }
  };

  listSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const sessions = await this.service.listSessions(req.user.userId);
      res.status(200).json({
        success: true,
        sessions,
      });
    } catch (err) {
      next(err);
    }
  };

  getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const session = await this.service.getSession(req.user.userId, req.params.id as string);
      res.status(200).json({
        success: true,
        session,
      });
    } catch (err) {
      next(err);
    }
  };

  submitAnswer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const parsed = SubmitAnswerRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid answer payload', parsed.error.flatten().fieldErrors);
      }

      const answer = await this.service.submitAnswer(
        req.user.userId,
        req.params.id as string,
        parsed.data
      );
      res.status(201).json({
        success: true,
        answer,
      });
    } catch (err) {
      next(err);
    }
  };

  completeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const session = await this.service.completeSession(
        req.user.userId,
        req.params.id as string
      );
      res.status(200).json({
        success: true,
        session,
      });
    } catch (err) {
      next(err);
    }
  };
}
