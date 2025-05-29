import { signupCustomer, verifyOtp } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { Otp } from '../models/otp.model';
import { sendOtpEmail } from '../utils/email';
import { ICustomer, SignupCustomerInput,  } from '../types/customer.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/customer.model');
jest.mock('../models/otp.model');
jest.mock('../utils/email');

describe('Customer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should signup a customer and send OTP', async () => {
    const mockInput = {
      email: 'customer@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    } as SignupCustomerInput;

    (Customer.findOne as jest.Mock).mockResolvedValue(null);
    (Customer.create as jest.Mock).mockResolvedValue(mockInput);
    (Otp.create as jest.Mock).mockResolvedValue({ email: mockInput.email, otp: '123456', expiresAt: new Date() });
    (sendOtpEmail as jest.Mock).mockResolvedValue(undefined);

    await signupCustomer(mockInput);

    expect(Customer.findOne).toHaveBeenCalledWith({ email: mockInput.email });
    expect(Customer.create).toHaveBeenCalledWith(mockInput);
    expect(Otp.create).toHaveBeenCalled();
    expect(sendOtpEmail).toHaveBeenCalledWith(mockInput.email, expect.any(String));
    logger.info('signupCustomer unit test passed');
  });

  it('should verify OTP and return token', async () => {
    const mockId = uuidv4();
    const mockCustomer = {
      _id: mockId,
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      isVerified: false,
    } as ICustomer;

    const mockOtp = {
      email: 'customer@example.com',
      otp: '123456',
      expiresAt: new Date(Date.now() + 1000),
    };

    (Otp.findOne as jest.Mock).mockResolvedValue(mockOtp);
    (Customer.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockCustomer, isVerified: true });

    const result = await verifyOtp({ email: 'customer@example.com', otp: '123456' });

    expect(Otp.findOne).toHaveBeenCalledWith({ email: 'customer@example.com', otp: '123456' });
    expect(Customer.findOneAndUpdate).toHaveBeenCalledWith(
      { email: 'customer@example.com' },
      { isVerified: true },
      { new: true },
    );
    expect(result).toHaveProperty('token');
    logger.info({ result }, 'verifyOtp unit test passed');
  });
});