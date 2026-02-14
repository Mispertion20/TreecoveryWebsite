import { Response } from 'express';

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response handler
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  error: string,
  message?: string,
  details?: unknown,
  code?: string
): void {
  const errorResponse: ErrorResponse = {
    error,
    ...(message && { message }),
    ...(details && { details }),
    ...(code && { code }),
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Handle application errors
 */
export function handleError(
  error: unknown,
  res: Response,
  defaultMessage: string = 'Internal server error'
): void {
  // Log error for debugging
  console.error('Error:', error);

  if (error instanceof AppError) {
    sendErrorResponse(
      res,
      error.statusCode,
      error.message,
      error.message,
      error.details,
      error.code
    );
    return;
  }

  if (error instanceof Error) {
    // In development, show full error details
    if (process.env.NODE_ENV === 'development') {
      sendErrorResponse(
        res,
        500,
        defaultMessage,
        error.message,
        { stack: error.stack }
      );
      return;
    }
  }

  // Generic error response for production
  sendErrorResponse(res, 500, defaultMessage);
}

/**
 * Common error creators
 */
export const ErrorCreators = {
  badRequest: (message: string, details?: unknown) =>
    new AppError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = 'Resource not found') =>
    new AppError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string, details?: unknown) =>
    new AppError(message, 409, 'CONFLICT', details),
  
  validationError: (message: string, details?: unknown) =>
    new AppError(message, 422, 'VALIDATION_ERROR', details),
  
  internalServerError: (message: string = 'Internal server error') =>
    new AppError(message, 500, 'INTERNAL_SERVER_ERROR'),
};

