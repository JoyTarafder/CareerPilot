import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service.js';
import { UnauthorizedError } from '../../core/errors.js';

export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const prefs = await this.service.getPreferences(req.user.userId);
      res.status(200).json({
        success: true,
        preferences: prefs.preferences,
        updatedAt: prefs.updatedAt,
      });
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await this.service.updatePreferences(req.user.userId, req.body);
      res.status(200).json({
        success: true,
        preferences: updated.preferences,
        updatedAt: updated.updatedAt,
      });
    } catch (err) {
      next(err);
    }
  };

  dispatchReminders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new UnauthorizedError();
      // Candidate can trigger test/immediate dispatch for their own applications, or admin for all
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
      const targetUserId = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' ? undefined : req.user.userId;
      const result = await this.service.dispatchReminders(targetUserId, days);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (err) {
      next(err);
    }
  };
}
