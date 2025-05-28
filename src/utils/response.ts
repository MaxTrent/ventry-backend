import { Response } from 'express';
import logger from './logger';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page?: number; limit?: number; total?: number };
}

export const sendResponse = <T>(
  res: Response,
  status: number,
  data?: T,
  error?: string,
  meta?: { page?: number; limit?: number; total?: number }
): void => {
  const response: ApiResponse<T> = { success: !error, data, error, meta };
  logger.debug({ status, response }, 'Sending response');
  res.status(status).json(response);
};