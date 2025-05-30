import mongoose, { Schema } from 'mongoose';
import { IPurchase } from 'types/purchase.types';
import { v4 as uuidv4 } from 'uuid';

const purchaseSchema = new Schema<IPurchase>({
  _id: { type: String, default: uuidv4 },
  customerId: { type: String, ref: 'Customer', required: true },
  carId: { type: String, ref: 'Car', required: true },
  amount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  paymentReference: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);