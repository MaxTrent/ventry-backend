import express, { Express } from 'express';
import logger from '../utils/logger';
import { sendResponse } from '../utils/response';

export default function bootstrap(app: Express): void {
  app.use(express.json());
  app.use((req, res, next) => {
    logger.info({ method: req.method, path: req.path }, 'Incoming request');
    next();
  });
  app.get('/health', (req, res) => {
    logger.info('Health check requested');
    sendResponse(res, 200, { status: 'healthy' });
  });
  logger.info('Express app initialized');
}