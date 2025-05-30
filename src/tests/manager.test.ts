import { createManager, deleteManager, getManagers, updateManager } from '../services/manager.service';
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


  it('should get managers with pagination', async () => {
    const query = { page: 1, limit: 10 };
    const managers = [
      { _id: uuidv4(), email: 'manager1@example.com', role: 'manager' },
      { _id: uuidv4(), email: 'manager2@example.com', role: 'manager' },
    ];
    const total = 2;

    (Manager.find as jest.Mock).mockReturnValue({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(managers),
    });
    (Manager.countDocuments as jest.Mock).mockResolvedValue(total);

    const result = await getManagers(query);

    expect(Manager.find).toHaveBeenCalledWith({ role: 'manager' });
    expect(Manager.countDocuments).toHaveBeenCalledWith({ role: 'manager' });
    expect(result).toEqual({ managers, total });
    logger.info({ result }, 'getManagers unit test passed');
  });


  it('should update a manager', async () => {
    const managerId = uuidv4();
    const updatedData = { firstName: 'Updated' };
    const manager = {
      _id: managerId,
      email: 'manager@example.com',
      firstName: 'Updated',
      role: 'manager',
    };

    (Manager.findOne as jest.Mock).mockResolvedValue(null);
    (Manager.findByIdAndUpdate as jest.Mock).mockResolvedValue(manager);

    const result = await updateManager(managerId, updatedData);

    expect(Manager.findByIdAndUpdate).toHaveBeenCalledWith(managerId, updatedData, { new: true });
    expect(result).toEqual(manager);
    logger.info({ result }, 'updateManager unit test passed');
  });


  it('should delete a manager', async () => {
    const managerId = uuidv4();
    const manager = { _id: managerId, email: 'manager@example.com' };

    (Manager.findByIdAndDelete as jest.Mock).mockResolvedValue(manager);

    await deleteManager(managerId);

    expect(Manager.findByIdAndDelete).toHaveBeenCalledWith(managerId);
    logger.info('deleteManager unit test passed');
  });
});