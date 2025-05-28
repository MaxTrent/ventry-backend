import { connectDB } from '../config/db';
import config from '../config/env';
import { Manager } from '../models/manager.model';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

const seedSuperadmin = async () => {
  try {
    await connectDB();
    const existingSuperadmin = await Manager.findOne({ email: config.SUPERADMIN_EMAIL });
    if (existingSuperadmin) {
      logger.info({ email: config.SUPERADMIN_EMAIL }, 'Superadmin already exists');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(config.SUPERADMIN_PASSWORD, 10);
    await Manager.create({
      _id: uuidv4(),
      email: config.SUPERADMIN_EMAIL,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
    });

    logger.info({ email: config.SUPERADMIN_EMAIL }, 'Superadmin seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Failed to seed Superadmin');
    process.exit(1);
  }
};

seedSuperadmin();