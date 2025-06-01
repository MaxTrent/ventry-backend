import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendResponse } from '../utils/response';
import logger from '../utils/logger';
import { TokenBlacklist } from 'models/tokenblacklist.model';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authMiddleware = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn({ path: req.path }, 'No token provided');
      sendResponse(res, 401, null, 'Unauthorized');
      return;
    }

    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) {
      logger.warn({ path: req.path }, 'Token revoked');
      sendResponse(res, 401, null, 'Token revoked');
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
    } catch (error: any) {
      logger.error({ error: error.message }, 'Authentication failed');
      sendResponse(res, 401, null, 'Invalid token');
    }
  };
};
