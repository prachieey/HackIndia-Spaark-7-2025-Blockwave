import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Database connection URL - Use development database in development environment
const MONGODB_URI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI 
  : process.env.MONGODB_URI_DEV;

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    logger.info('MongoDB connected successfully');
    
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

    return mongoose.connection;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Close the database connection
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    return true;
  } catch (error) {
    logger.error(`Error closing MongoDB connection: ${error.message}`);
    return false;
  }
};

// Clear the test database
const clearDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    logger.info('Test database cleared');
    return true;
  }
  logger.warn('Database can only be cleared in test environment');
  return false;
};

export { connectDB, closeDB, clearDB };
export default connectDB;
