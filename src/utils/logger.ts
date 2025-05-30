import pino from 'pino';
import config from '../config/env';

const logger = pino({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    config.NODE_ENV === 'test'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true },
        },
});

export default logger;