import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

const customerSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, default: 'customer' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

customerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    logger.debug({ email: this.email }, 'Password hashed for customer');
  }
  this.updatedAt = Date.now();
  next();
});

export const Customer = model('Customer', customerSchema);