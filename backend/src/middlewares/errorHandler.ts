import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { isProduction } from '../config/env';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.message, err.code, err.errors);
  }

  // Unexpected errors
  console.error('Unexpected error:', err);

  const message = isProduction ? 'Internal server error' : err.message;
  const stack = isProduction ? undefined : err.stack;

  return res.status(500).json({
    success: false,
    message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(stack && { stack }),
  });
}

export function notFoundHandler(req: Request, res: Response) {
  return errorResponse(res, 404, `Route ${req.method} ${req.path} not found`, 'NOT_FOUND');
}
