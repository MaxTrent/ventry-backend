import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),
  JWT_SECRET: z.string().min(1, 'Jwt secret is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SENDGRID_API_KEY: z.string().min(1, 'Sendgrid Api Key is required'),
  SENDGRID_FROM_EMAIL: z.string().email('Invalid email address'),
  SUPERADMIN_EMAIL: z.string().email('Invalid Superadmin email'),
  SUPERADMIN_PASSWORD: z.string().min(1, 'Superadmin Password is required'),
  PAYSTACK_SECRET_KEY: z.string().min(1, 'Paystack Secret Key is required'),
  APP_URL: z.string().url('Invalid App URL'),

});

export default (function () {
  try {
    const parsed = envSchema.parse(process.env);
    console.log(parsed);
    console.log(process.env.SUPERADMIN_EMAIL);
console.log(process.env.SUPERADMIN_PASSWORD);
    console.log('Environment variables validated successfully');
    // logger.info('Environment variables validated successfully');
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment validation failed:', error.errors);
      // logger.error({ errors: error.errors }, 'Environment validation failed');

    } else {
      console.error('Unexpected error during environment validation:', error);
      // logger.error({ error }, 'Unexpected error during environment validation');
    }
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
})();