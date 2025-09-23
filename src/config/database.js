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
  MONGODB_URI_DEV = 'mongodb://127.0.0.1:27017/scantyx-dev?directConnection=true',
  MONGODB_URI_TEST = 'mongodb://127.0.0.1:27017/scantyx-test?directConnection=true'
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
    
    console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000, // Added connection timeout
      family: 4, // Use IPv4, skip trying IPv6
    });

    logger.info(`MongoDB Connected: ${conn.connection.host} [${NODE_ENV}]`);
    
    // Connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to DB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
    });

    // Close the Mongoose connection when the Node process ends
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// For testing purposes
const closeDB = async () => {
  if (NODE_ENV === 'test') {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
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

// Export functions
export { 
  connectDB, 
  closeDB, 
  clearDB,
  getMongoURI 
};
