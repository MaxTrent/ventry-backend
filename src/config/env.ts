import { z } from 'zod';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT Secret is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SENDGRID_API_KEY: z.string().min(1, 'SendGrid API key is required'),
  SENDGRID_FROM_EMAIL: z.string().email('Valid SendGrid sender email is required'),
  SUPERADMIN_EMAIL: z.string().email('Valid Superadmin email is required'),
  SUPERADMIN_PASSWORD: z.string().min(6, 'Superadmin password must be at least 6 characters'),
});

const config = (() => {
  try {
    const parsed = envSchema.parse(process.env);
    logger.info('Environment variables validated successfully');
    return parsed;
  } catch (error) {
    logger.error({ error }, 'Environment validation failed');
    process.exit(1);
  }
})();

export default config;