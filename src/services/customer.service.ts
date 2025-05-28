import { Customer } from '../models/customer.model';
import { Otp } from '../models/otp.model';
import { OtpInput, SignupCustomerInput } from '../types/customer.types';
import logger from '../utils/logger';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { sendOtpEmail } from '../utils/email';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const otpSchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const signupCustomer = async (data: SignupCustomerInput): Promise<void> => {
  const validatedData = signupSchema.parse(data);
  logger.debug({ email: validatedData.email }, 'Processing customer signup');

  const existingCustomer = await Customer.findOne({ email: validatedData.email });
  if (existingCustomer) {
    logger.warn({ email: validatedData.email }, 'Customer already exists');
    throw new Error('Email already registered');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

  await Otp.create({ email: validatedData.email, otp, expiresAt });
  await Customer.create({ ...validatedData, isVerified: false });
  await sendOtpEmail(validatedData.email, otp);

  logger.info({ email: validatedData.email }, 'Signup initiated, OTP sent');
};

export const verifyOtp = async (data: OtpInput): Promise<string> => {
  const validatedData = otpSchema.parse(data);
  logger.debug({ email: validatedData.email }, 'Processing OTP verification');

  const otpRecord = await Otp.findOne({ email: validatedData.email, otp: validatedData.otp });
  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    logger.warn({ email: validatedData.email }, 'Invalid or expired OTP');
    throw new Error('Invalid or expired OTP');
  }

  const customer = await Customer.findOneAndUpdate(
    { email: validatedData.email },
    { isVerified: true },
    { new: true }
  );
  if (!customer) {
    logger.error({ email: validatedData.email }, 'Customer not found');
    throw new Error('Customer not found');
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const token = generateToken({ id: customer._id, role: customer.role });
  logger.info({ email: validatedData.email }, 'OTP verified, JWT issued');
  return token;
};