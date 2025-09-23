import dotenv from 'dotenv';
import mongoose from 'mongoose';
import winston from 'winston';
import 'winston-daily-rotate-file';

const { createLogger, format, transports } = winston;

dotenv.config();

// Create a logger instance
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

const {
  NODE_ENV = 'development',
  MONGODB_URI,
  MONGODB_URI_DEV = 'mongodb://localhost:27017/scantyx-dev',
  MONGODB_URI_TEST = 'mongodb://localhost:27017/scantyx-test'
} = process.env;

// Select the appropriate database URI based on environment
const getMongoURI = () => {
  switch (NODE_ENV) {
    case 'test':
      return MONGODB_URI_TEST;
    case 'development':
      return MONGODB_URI_DEV;
    case 'production':
      if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is required in production environment');
      }
      return MONGODB_URI;
    default:
      return MONGODB_URI_DEV;
  }
};

// MongoDB connection options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    
    const conn = await mongoose.connect(mongoURI, mongoOptions);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// For testing purposes
const closeDB = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected');
};

// Clear the test database
const clearDB = async () => {
  if (NODE_ENV === 'test') {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export { connectDB, closeDB, clearDB };
