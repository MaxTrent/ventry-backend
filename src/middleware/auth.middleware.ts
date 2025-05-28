import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn({ path: req.path }, 'No token provided');
      sendResponse(res, 401, null, 'Unauthorized');
      return;
    }

    try {
      const decoded = verifyToken(token);
      if (!allowedRoles.includes(decoded.role)) {
        logger.warn({ userId: decoded.id, role: decoded.role }, 'Unauthorized role access');
        sendResponse(res, 403, null, 'Forbidden');
        return;
      }
      req.user = decoded;
      logger.debug({ userId: decoded.id }, 'User authenticated');
      next();
    } catch (error) {
      logger.error({ error }, 'Authentication failed');
      sendResponse(res, 401, null, 'Invalid token');
    }
  };
};