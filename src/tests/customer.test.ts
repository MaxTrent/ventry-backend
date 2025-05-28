import { signupCustomer, verifyOtp } from '../services/customer.service';
import { Customer } from '../models/customer.model';
import { Otp } from '../models/otp.model';
import { sendOtpEmail } from '../utils/email';
import { generateToken } from '../utils/jwt';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/customer.model');
jest.mock('../models/otp.model');
jest.mock('../utils/email');
jest.mock('../utils/jwt');

describe('Customer Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should initiate signup and send OTP', async () => {
    const mockInput = {
      email: 'customer@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    (Customer.findOne as jest.Mock).mockResolvedValue(null);
    (Customer.create as jest.Mock).mockResolvedValue(mockInput);
    (Otp.create as jest.Mock).mockResolvedValue({ email: mockInput.email, otp: '123456', expiresAt: new Date() });
    (sendOtpEmail as jest.Mock).mockResolvedValue(undefined);

    await signupCustomer(mockInput);

    expect(Customer.findOne).toHaveBeenCalledWith({ email: mockInput.email });
    expect(Customer.create).toHaveBeenCalledWith({ ...mockInput, isVerified: false });
    expect(Otp.create).toHaveBeenCalledWith({
      email: mockInput.email,
      otp: expect.any(String),
      expiresAt: expect.any(Date),
    });
    expect(sendOtpEmail).toHaveBeenCalledWith(mockInput.email, expect.any(String));
    logger.info('signupCustomer unit test passed');
  });

  it('should verify OTP and return JWT', async () => {
    const mockInput = { email: 'customer@example.com', otp: '123456' };
    const mockCustomer = {
      _id: uuidv4(),
      email: mockInput.email,
      role: 'customer',
      isVerified: false,
    };
    const mockOtp = { _id: uuidv4(), email: mockInput.email, otp: mockInput.otp, expiresAt: new Date(Date.now() + 1000) };

    (Otp.findOne as jest.Mock).mockResolvedValue(mockOtp);
    (Customer.findOneAndUpdate as jest.Mock).mockResolvedValue({ ...mockCustomer, isVerified: true });
    (Otp.deleteOne as jest.Mock).mockResolvedValue({});
    (generateToken as jest.Mock).mockReturnValue('mock-jwt');

    const result = await verifyOtp(mockInput);

    expect(Otp.findOne).toHaveBeenCalledWith({ email: mockInput.email, otp: mockInput.otp });
    expect(Customer.findOneAndUpdate).toHaveBeenCalledWith(
      { email: mockInput.email },
      { isVerified: true },
      { new: true }
    );
    expect(Otp.deleteOne).toHaveBeenCalledWith({ _id: mockOtp._id });
    expect(generateToken).toHaveBeenCalledWith({ id: mockCustomer._id, role: mockCustomer.role });
    expect(result).toBe('mock-jwt');
    logger.info({ result }, 'verifyOtp unit test passed');
  });
});