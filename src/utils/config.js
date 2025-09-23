const Joi = require('joi');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define environment variable schema
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE: Joi.string().default('30d'),
  COOKIE_EXPIRE: Joi.number().default(30),
  
  // Database
  MONGODB_URI: Joi.string().required(),
  MONGODB_URI_DEV: Joi.string().default('mongodb://localhost:27017/scantyx-dev'),
  MONGODB_URI_TEST: Joi.string().default('mongodb://localhost:27017/scantyx-test'),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().required(),
  STRIPE_API_VERSION: Joi.string().default('2023-10-16'),
  
  // Security
  ENABLE_HSTS: Joi.boolean().default(true),
  ENABLE_CSP: Joi.boolean().default(true),
  ENABLE_XSS_PROTECTION: Joi.boolean().default(true),
  
  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  ALLOWED_ORIGINS: Joi.string().default('http://localhost:5173'),
  
  // Request Limits
  MAX_REQUEST_SIZE: Joi.string().default('10mb'),
  MAX_FILE_UPLOAD: Joi.string().default('5mb'),
  
  // Key Rotation
  KEY_ROTATION_INTERVAL: Joi.string().default('30d'),
  LAST_KEY_ROTATION: Joi.string().isoDate(),
  
  // Other configurations...
}).unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
    cookieExpire: envVars.COOKIE_EXPIRE,
  },
  
  // Database
  db: {
    uri: envVars.NODE_ENV === 'production' 
      ? envVars.MONGODB_URI 
      : envVars.MONGODB_URI_DEV,
    testUri: envVars.MONGODB_URI_TEST,
  },
  
  // Stripe
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
    apiVersion: envVars.STRIPE_API_VERSION,
  },
  
  // Security
  security: {
    hsts: envVars.ENABLE_HSTS,
    csp: envVars.ENABLE_CSP,
    xssProtection: envVars.ENABLE_XSS_PROTECTION,
  },
  
  // CORS
  cors: {
    origin: envVars.CORS_ORIGIN,
    allowedOrigins: envVars.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()),
  },
  
  // Request Limits
  limits: {
    maxRequestSize: envVars.MAX_REQUEST_SIZE,
    maxFileUpload: envVars.MAX_FILE_UPLOAD,
  },
  
  // Key Rotation
  keyRotation: {
    interval: envVars.KEY_ROTATION_INTERVAL,
    lastRotation: envVars.LAST_KEY_ROTATION ? new Date(envVars.LAST_KEY_ROTATION) : null,
  },
  
  // Frontend URL
  frontendUrl: envVars.FRONTEND_URL || 'http://localhost:5173',
  
  // Other configurations...
};
