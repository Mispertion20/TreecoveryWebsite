import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '../utils/errorHandler';
import { validateRequired, isValidEmail, isValidUUID } from '../utils/validation';

/**
 * Middleware to validate request body has required fields
 */
export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation = validateRequired(req.body, fields);

    if (validation) {
      sendErrorResponse(
        res,
        400,
        'Missing required fields',
        `The following fields are required: ${validation.missing.join(', ')}`,
        { missing: validation.missing },
        'VALIDATION_ERROR'
      );
      return;
    }

    next();
  };
}

/**
 * Middleware to validate email format
 */
export function validateEmail(field: string = 'email') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const email = req.body[field];

    if (email && !isValidEmail(email)) {
      sendErrorResponse(
        res,
        400,
        'Invalid email format',
        `The ${field} field must be a valid email address`,
        { field },
        'VALIDATION_ERROR'
      );
      return;
    }

    next();
  };
}

/**
 * Middleware to validate UUID format
 */
export function validateUUID(field: string = 'id', param: boolean = false) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const uuid = param ? req.params[field] : req.body[field];

    if (uuid && !isValidUUID(uuid)) {
      sendErrorResponse(
        res,
        400,
        'Invalid UUID format',
        `The ${field} must be a valid UUID`,
        { field },
        'VALIDATION_ERROR'
      );
      return;
    }

    next();
  };
}

/**
 * Middleware to validate request body is not empty
 */
export function validateNotEmpty(req: Request, res: Response, next: NextFunction): void {
  if (Object.keys(req.body).length === 0) {
    sendErrorResponse(
      res,
      400,
      'Request body is required',
      'The request body cannot be empty',
      undefined,
      'VALIDATION_ERROR'
    );
    return;
  }

  next();
}

