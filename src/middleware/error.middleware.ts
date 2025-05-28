import { Request, Response, NextFunction, Express } from 'express';
import { ZodError } from 'zod';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';

export const registerErrorHandlers = (app: Express): void => {
  app.use((error: Error, req: Request, res: Response, next: NextFunction): void => {
    if (error instanceof ZodError) {
      logger.error({ error: error.errors, path: req.path }, 'Validation error');
      sendResponse(res, 400, null, error.errors.map((e) => e.message).join(', '));
    } else {
      logger.error({ error, path: req.path }, 'Internal server error');
      sendResponse(res, 500, null, 'Internal server error');
    }
  });
};