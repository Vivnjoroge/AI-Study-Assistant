import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Centralized error handler middleware.
 * Catches errors thrown from controllers and returns structured JSON responses.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`);
  
  const fs = require('fs');
  const path = require('path');
  const logMessage = `[${new Date().toISOString()}] Error ${statusCode}: ${message}\n${err.stack}\n\n`;
  fs.appendFileSync(path.join(process.cwd(), 'error.log'), logMessage);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/** Helper to create typed AppErrors with HTTP status codes */
export const createError = (message: string, statusCode: number): AppError => {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  return err;
};
