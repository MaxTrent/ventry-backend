import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SENDGRID_API_KEY: z.string().min(1, 'SENDGRID_API_KEY is required'),
  SENDGRID_FROM_EMAIL: z.string().email('Invalid email address'),
  SUPERADMIN_EMAIL: z.string().email('Invalid Superadmin email'),
  SUPERADMIN_PASSWORD: z.string().min(1, 'SUPERADMIN_PASSWORD is required'),
});

export default (function () {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info('Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error({ errors: error.errors }, 'Environment validation failed');
    } else {
      logger.error({ error }, 'Unexpected error during environment validation');
    }
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
})();