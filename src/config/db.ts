import mongoose from 'mongoose';
import config from './env';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      autoIndex: config.NODE_ENV !== 'production',
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error({ error }, 'MongoDB connection failed');
    process.exit(1);
  }
};