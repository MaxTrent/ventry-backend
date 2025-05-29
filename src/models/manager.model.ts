import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const managerSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['superadmin', 'manager'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

managerSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    // logger.debug({ email: this.email }, 'Password hashed for manager');
  }
  this.updatedAt = new Date();
  next();
});

export const Manager = model('Manager', managerSchema);