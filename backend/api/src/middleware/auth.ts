import { Request, Response, NextFunction } from 'express';
import { defaultTokenService } from '../modules/auth/token.service.js';
import { UnauthorizedError, ForbiddenError } from '../core/errors.js';
import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  sessionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new UnauthorizedError('Access token is empty');
  }

  const payload = defaultTokenService.verifyAccessToken(token);
  req.user = {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
  };

  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
}
