import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  logger.error('Unhandled error', { message: err.message, stack: err.stack, url: req.originalUrl });
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
}
