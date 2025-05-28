import jwt from 'jsonwebtoken';
import config from '../config/env';
import logger from './logger';

interface JwtPayload {
  id: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });
  logger.debug({ userId: payload.id, token: token.slice(0, 10) + '...' }, 'JWT generated');
  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    logger.debug({ userId: decoded.id }, 'JWT verified');
    return decoded;
  } catch (error) {
    logger.error({ error }, 'JWT verification failed');
    throw new Error('Invalid token');
  }
};