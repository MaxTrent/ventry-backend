import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const otpSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 600 },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.pre('save', function (next) {
  logger.debug({ email: this.email }, 'Saving OTP document');
  next();
});

export const Otp = model('Otp', otpSchema);