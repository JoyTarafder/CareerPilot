import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterRequestSchema, LoginRequestSchema } from '@careerpilot/contracts';
import { ValidationError, UnauthorizedError } from '../../core/errors.js';
import { config } from '../../config/index.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = RegisterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const result = await this.authService.register(
        parsed.data,
        req.ip,
        req.headers['user-agent']
      );

      this.setRefreshCookie(res, result.refreshToken);

      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresInSeconds,
      });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = LoginRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const result = await this.authService.login(
        parsed.data,
        req.ip,
        req.headers['user-agent'],
        false // regular candidate login
      );

      this.setRefreshCookie(res, result.refreshToken);

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresInSeconds,
      });
    } catch (err) {
      next(err);
    }
  };

  adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = LoginRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Validation failed', parsed.error.flatten().fieldErrors);
      }

      const result = await this.authService.login(
        parsed.data,
        req.ip,
        req.headers['user-agent'],
        true // require ADMIN or SUPER_ADMIN
      );

      this.setRefreshCookie(res, result.refreshToken, 'admin_refresh_token');

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresInSeconds,
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Support both cookie and body token for flexible clients
      const refreshToken =
        req.cookies?.refreshToken || req.cookies?.admin_refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError('No refresh token provided');
      }

      const result = await this.authService.refresh(
        refreshToken,
        req.ip,
        req.headers['user-agent']
      );

      const cookieName = req.cookies?.admin_refresh_token ? 'admin_refresh_token' : 'refreshToken';
      this.setRefreshCookie(res, result.refreshToken, cookieName);

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresInSeconds,
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken =
        req.cookies?.refreshToken || req.cookies?.admin_refresh_token || req.body?.refreshToken;

      await this.authService.logout(refreshToken);

      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      res.clearCookie('admin_refresh_token', { path: '/api/v1/auth' });

      res.status(200).json({ message: 'Successfully logged out' });
    } catch (err) {
      next(err);
    }
  };

  revokeAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      await this.authService.revokeAllSessions(req.user.userId);

      res.clearCookie('refreshToken', { path: '/api/v1/auth' });
      res.clearCookie('admin_refresh_token', { path: '/api/v1/auth' });

      res.status(200).json({ message: 'All active sessions have been revoked' });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      res.status(200).json({
        user: {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  private setRefreshCookie(res: Response, token: string, cookieName = 'refreshToken'): void {
    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
