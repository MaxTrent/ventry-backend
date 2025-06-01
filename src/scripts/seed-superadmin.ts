import mongoose from 'mongoose';
import { Manager } from '../models/manager.model';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/env';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));
const forceSeed = args.force || false;

const seedSuperadmin = async () => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env');
    }
    if (!config.SUPERADMIN_EMAIL || !config.SUPERADMIN_PASSWORD) {
      throw new Error('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not defined in .env');
    }

    await mongoose.connect(config.MONGODB_URI, { dbName: 'ventry' });
    logger.info({ uri: config.MONGODB_URI, dbName: 'ventry' }, 'Connected to MongoDB');

    const existingSuperadmin = await Manager.findOne({ email: config.SUPERADMIN_EMAIL });
    if (existingSuperadmin) {
      logger.info({ email: existingSuperadmin.email, role: existingSuperadmin.role }, 'Superadmin already exists');
      if (!forceSeed) {
        logger.info('Use --force to re-seed the superadmin user');
        process.exit(0);
      }
      await Manager.deleteOne({ email: config.SUPERADMIN_EMAIL });
      logger.info({ email: config.SUPERADMIN_EMAIL }, 'Deleted existing superadmin for re-seeding');
    }

    await Manager.create({
      _id: uuidv4(),
      email: config.SUPERADMIN_EMAIL,
      password: config.SUPERADMIN_PASSWORD,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
    });

    logger.info({ email: config.SUPERADMIN_EMAIL }, 'Superadmin seeded successfully');
    process.exit(0);
  } catch (error: any) {
    logger.error({ error: error.message, stack: error.stack }, 'Failed to seed Superadmin');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
};

seedSuperadmin();