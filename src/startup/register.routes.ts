import { Express } from 'express';
import carRoutes from '../routes/car.routes';
import managerRoutes from '../routes/manager.routes';
import customerRoutes from '../routes/customer.routes';
import logger from '../utils/logger';

export default function registerRoutes(app: Express): void {
  app.use('/api/cars', carRoutes);
  app.use('/api/managers', managerRoutes);
  app.use('/api/customers', customerRoutes);
  logger.info('Routes registered');
}