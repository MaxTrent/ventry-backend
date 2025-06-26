import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const carSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  isAvailable: { type: Boolean, default: true },
  category: { type: String, required: true }, 
  year: { type: Number, required: true, min: 1900 },
  mileage: { type: Number, default: 0, min: 0 },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], required: true },
  transmission: { type: String, enum: ['Automatic', 'Manual'], required: true },
  color: { type: String, required: true, trim: true },
  photos: [{ type: String, validate: {
    function(value: string) {
      return value.startsWith('http://') || value.startsWith('https://');
    },
    message: 'Invalid photo URL format'}}],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

carSchema.pre('save', function (next) {
  // logger.debug({ id: this._id }, 'Saving car document');
  this.updatedAt = new Date();
  next();
});

export const Car = model('Car', carSchema);