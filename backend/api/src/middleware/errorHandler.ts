import { Request, Response, NextFunction } from 'express';
import { AppError } from '../core/errors.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.id || 'req_unknown';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        fieldErrors: err.fieldErrors,
        requestId,
      },
    });
    return;
  }

  // Fallback for unexpected errors (Do not leak internal errors or stack traces in production)
  console.error(`[${requestId}] Unhandled Error:`, err);

  const isDev = config.NODE_ENV === 'development';
  const isDbError =
    err.message?.includes("Can't reach database server") ||
    (err as any)?.code === 'P1001' ||
    err.name === 'PrismaClientInitializationError';

  res.status(500).json({
    error: {
      code: isDbError ? 'DATABASE_UNAVAILABLE' : 'INTERNAL_SERVER_ERROR',
      message: isDbError && isDev
        ? 'Database server is unreachable at localhost:5432. Please ensure PostgreSQL is running or sign in using demo mode.'
        : 'An unexpected internal error occurred. Please try again later.',
      requestId,
    },
  });
}
