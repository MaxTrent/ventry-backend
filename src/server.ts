import app from './app';
import { connectDB } from './config/db';
import config from './config/env';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(config.PORT, () => {
      logger.info(`Server running on http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();