import { initiatePurchase, handlePaymentCallback } from '../services/purchase.service';
import { Car } from '../models/car.model';
import { Customer } from '../models/customer.model';
import { Purchase } from '../models/purchase.model';
import { IPurchase } from '../types/purchase.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {Paystack} from 'paystack-sdk';
import { sendPurchaseConfirmationEmail } from '../utils/email';

jest.mock('../models/car.model', () => ({
  Car: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));
jest.mock('../models/customer.model', () => ({
  Customer: {
    findById: jest.fn(),
  },
}));
jest.mock('../models/purchase.model', () => ({
  Purchase: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('paystack-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    transaction: {
      initialize: jest.fn(),
      verify: jest.fn(),
    },
  }));
});
jest.mock('../utils/email', () => ({
  sendPurchaseConfirmationEmail: jest.fn(),
}));

describe('Purchase Service', () => {
  let mockPaystackInstance: { transaction: { initialize: jest.Mock; verify: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
    mockPaystackInstance = {
      transaction: {
        initialize: jest.fn(),
        verify: jest.fn(),
      },
    };
    (Paystack as jest.Mock).mockImplementation(() => mockPaystackInstance);
  });

  it('should initiate a car purchase', async () => {
    const carId = uuidv4();
    const customerId = uuidv4();
    const email = 'test@example.com';
    const reference = `ventry_${uuidv4()}`;
    const car = {
      _id: carId,
      brand: 'Toyota',
      model: 'Camry',
      price: 25000,
      isAvailable: true,
      category: uuidv4(),
      year: 2022,
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Blue',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const customer = {
      _id: customerId,
      email,
      firstName: 'Test',
      lastName: 'User',
      role: 'customer',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const purchase: IPurchase = {
      _id: reference,
      customerId,
      carId,
      amount: car.price,
      paymentStatus: 'pending',
      paymentReference: reference,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    (Car.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(car),
    });
    (Customer.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(customer),
    });
    mockPaystackInstance.transaction.initialize.mockResolvedValue({
      data: { authorization_url: 'https://paystack.com/pay/test' },
    });
    (Purchase.create as jest.Mock).mockResolvedValue(purchase);

    const result = await initiatePurchase({ carId, email }, customerId);

    expect(Car.findById).toHaveBeenCalledWith(carId);
    expect(Customer.findById).toHaveBeenCalledWith(customerId);
    expect(Paystack).toHaveBeenCalledWith(expect.any(String));
    expect(mockPaystackInstance.transaction.initialize).toHaveBeenCalledWith({
      email,
      amount: (car.price * 100).toString(),
      reference,
      callback_url: expect.any(String),
    });
    expect(Purchase.create).toHaveBeenCalledWith({
      _id: reference,
      customerId,
      carId,
      amount: car.price,
      paymentReference: reference,
      paymentStatus: 'pending',
    });
    expect(result).toEqual({ purchase, paymentUrl: 'https://paystack.com/pay/test' });
    logger.info({ result }, 'initiatePurchase unit test passed');
  });

  it('should verify a purchase and send confirmation email', async () => {
    const reference = `ventry_${uuidv4()}`;
    const carId = uuidv4();
    const customerId = uuidv4();
    const car = {
      _id: carId,
      brand: 'Toyota',
      model: 'Camry',
      price: 25000,
      isAvailable: true,
      category: uuidv4(),
      year: 2022,
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Blue',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const customer = {
      _id: customerId,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const purchase: IPurchase = {
      _id: reference,
      customerId,
      carId,
      amount: 25000,
      paymentStatus: 'pending',
      paymentReference: reference,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn().mockResolvedValue(true),
    } as any;

    (Purchase.findOne as jest.Mock).mockResolvedValue(purchase);
    (Car.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(car),
    });
    (Customer.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(customer),
    });
    mockPaystackInstance.transaction.verify.mockResolvedValue({
      data: { status: 'success', amount: 25000 * 100 },
    });
    (Car.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);
    (sendPurchaseConfirmationEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await handlePaymentCallback(reference);

    expect(Purchase.findOne).toHaveBeenCalledWith({ paymentReference: reference });
    expect(Paystack).toHaveBeenCalledWith(expect.any(String));
    expect(mockPaystackInstance.transaction.verify).toHaveBeenCalledWith(reference);
    expect(Car.findByIdAndUpdate).toHaveBeenCalledWith(carId, { isAvailable: false });
    expect(sendPurchaseConfirmationEmail).toHaveBeenCalledWith(
      customer.email,
      car.brand,
      car.model,
      purchase.amount
    );
    expect(purchase.paymentStatus).toBe('completed');
    expect(purchase.save).toHaveBeenCalled();
    expect(result).toBe(purchase);
    logger.info({ result }, 'handlePaymentCallback unit test passed');
  });

  it('should fail if car is not available', async () => {
    const carId = uuidv4();
    const customerId = uuidv4();
    const email = 'test@example.com';
    const car = {
      _id: carId,
      brand: 'Toyota',
      model: 'Camry',
      price: 25000,
      isAvailable: false,
      category: uuidv4(),
      year: 2022,
      mileage: 0,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      color: 'Blue',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const customer = {
      _id: customerId,
      email,
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Car.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(car),
    });
    (Customer.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue(customer),
    });

    await expect(initiatePurchase({ carId, email }, customerId)).rejects.toThrow('Car not available');
  });
});