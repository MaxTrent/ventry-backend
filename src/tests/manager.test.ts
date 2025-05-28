import { createManager } from '../services/manager.service';
import { Manager } from '../models/manager.model';
import { CreateManagerInput, IManager } from '../types/manager.types';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

jest.mock('../models/manager.model');

describe('Manager Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Cleared mocks for test');
  });

  it('should create a manager', async () => {
    const mockInput: CreateManagerInput = {
      email: 'manager@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'manager',
    };

    const mockManager: IManager = {
      ...mockInput,
      _id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (Manager.findOne as jest.Mock).mockResolvedValue(null);
    (Manager.create as jest.Mock).mockResolvedValue(mockManager);

    const result = await createManager(mockInput);

    expect(Manager.findOne).toHaveBeenCalledWith({ email: mockInput.email });
    expect(Manager.create).toHaveBeenCalledWith(mockInput);
    expect(result).toEqual(mockManager);
    logger.info({ result }, 'createManager unit test passed');
  });
});