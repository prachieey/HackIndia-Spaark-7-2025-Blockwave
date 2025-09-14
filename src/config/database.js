require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

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

const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
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

module.exports = { connectDB, closeDB, clearDB };
