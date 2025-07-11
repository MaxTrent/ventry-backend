import { Express } from 'express';
import carRoutes from '../routes/car.routes';
import managerRoutes from '../routes/manager.routes';
import customerRoutes from '../routes/customer.routes';
import authRoutes from '../routes/auth.routes';
import categoryRoutes from '../routes/category.routes';
import logger from '../utils/logger';
import purchaseRoutes from '../routes/purchase.routes';

export default function registerRoutes(app: Express): void {
  app.use('/api/cars', carRoutes);
  app.use('/api/managers', managerRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/purchases', purchaseRoutes);
  logger.info('Routes registered');
}