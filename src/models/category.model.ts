import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const categorySchema = new Schema({
  _id: { type: String, default: uuidv4 },
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

categorySchema.pre('save', function (next) {
  // logger.debug({ id: this._id }, 'Saving category document');
  this.updatedAt = new Date();
  next();
});

export const Category = model('Category', categorySchema);