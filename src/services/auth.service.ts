import { Manager } from '../models/manager.model';
import { Customer } from '../models/customer.model';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const login = async (data: { email: string; password: string }): Promise<{ token: string; role: string }> => {
  const validatedData = loginSchema.parse(data);
  logger.debug({ email: validatedData.email }, 'Processing login');

  const manager = await Manager.findOne({ email: validatedData.email }).lean();
  const customer = await Customer.findOne({ email: validatedData.email }).lean();

  const user = manager || customer;
  if (!user) {
    logger.warn({ email: validatedData.email }, 'User not found');
    throw new Error('Invalid credentials');
  }

  if (user.role === 'customer' && !user.isVerified) {
    logger.warn({ email: validatedData.email }, 'Customer not verified');
    throw new Error('Account not verified');
  }

  const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
  if (!isPasswordValid) {
    logger.warn({ email: validatedData.email }, 'Invalid password');
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user._id, role: user.role });
  logger.info({ email: validatedData.email, role: user.role }, 'Login successful');
  return { token, role: user.role };
};

