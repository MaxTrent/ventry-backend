export interface IPurchase {
    _id: string;
    customerId: string;
    carId: string;
    amount: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentReference?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface CreatePurchaseInput {
    carId: string;
    email: string;
  }