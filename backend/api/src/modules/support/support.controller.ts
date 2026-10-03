import { Request, Response, NextFunction } from 'express';
import { SupportService } from './support.service.js';
import { UnauthorizedError } from '../../core/errors.js';

export class SupportController {
  constructor(private readonly service: SupportService) {}

  grantAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const grant = await this.service.grantAccess(
        req.user.userId,
        req.user.email,
        req.body
      );
      res.status(201).json({
        success: true,
        grant,
      });
    } catch (err) {
      next(err);
    }
  };

  revokeAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const result = await this.service.revokeAccess(req.user.userId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const grant = await this.service.getActiveGrant(req.user.userId);
      res.status(200).json({
        success: true,
        hasActiveGrant: !!grant,
        grant,
      });
    } catch (err) {
      next(err);
    }
  };

  adminListGrants = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const grants = await this.service.listActiveGrants();
      res.status(200).json({
        success: true,
        grants,
      });
    } catch (err) {
      next(err);
    }
  };

  adminVerifyAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateId = req.params.candidateId as string;
      const verification = await this.service.verifyAdminSupportAccess(candidateId);
      res.status(200).json({
        success: true,
        ...verification,
      });
    } catch (err) {
      next(err);
    }
  };
}
