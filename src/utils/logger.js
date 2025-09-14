import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: 'debug', // Log everything in development
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      logFormat
    ),
    transports: [new transports.Console()],
  });
};

const productionLogger = () => {
  return createLogger({
    level: 'info', // Only log important info in production
    format: combine(timestamp(), format.errors({ stack: true }), json()),
    defaultMeta: { service: 'scantyx-api' },
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ],
    exceptionHandlers: [new transports.File({ filename: 'logs/exceptions.log' })],
    rejectionHandlers: [new transports.File({ filename: 'logs/rejections.log' })],
  });
};

// Select logger based on environment
const logger =
  process.env.NODE_ENV === 'production' ? productionLogger() : developmentLogger();

export default logger;
