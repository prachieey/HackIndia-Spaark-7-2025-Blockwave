const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

// Load environment variables from .env file
dotenv.config();

// Define the configuration schema
const configSchema = Joi.object({
  app: Joi.object({
    name: Joi.string().required(),
    port: Joi.number().default(3000),
    env: Joi.string().valid('development', 'production', 'test').default('development'),
    logLevel: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    debug: Joi.boolean().default(false),
    trustProxy: Joi.number().default(0)
  }).required(),
  database: Joi.object({
    uri: Joi.string().required(),
    options: Joi.object({
      useNewUrlParser: Joi.boolean().default(true),
      useUnifiedTopology: Joi.boolean().default(true),
      useCreateIndex: Joi.boolean().default(true),
      useFindAndModify: Joi.boolean().default(false),
      ssl: Joi.boolean().default(false),
      sslValidate: Joi.boolean().default(false),
      sslCA: Joi.string().optional()
    }).default()
  }).required(),
  security: Joi.object({
    jwtSecret: Joi.string().required(),
    passwordSaltRounds: Joi.number().default(10),
    rateLimit: Joi.object({
      windowMs: Joi.number().default(15 * 60 * 1000), // 15 minutes
      max: Joi.number().default(100)
    }),
    hsts: Joi.object({
      maxAge: Joi.number().default(31536000),
      includeSubDomains: Joi.boolean().default(true),
      preload: Joi.boolean().default(true)
    }).optional(),
    csp: Joi.object({
      directives: Joi.object()
    }).optional()
  }).required(),
  stripe: Joi.object({
    testMode: Joi.boolean().default(true),
    apiVersion: Joi.string().default('2023-10-16'),
    webhookSecret: Joi.string().required(),
    maxNetworkRetries: Joi.number().default(2),
    timeout: Joi.number().default(20000) // 20 seconds
  }).required(),
  cors: Joi.object({
    origin: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).required(),
    methods: Joi.array().items(Joi.string()).default(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']),
    allowedHeaders: Joi.array().items(Joi.string()).default(['Content-Type', 'Authorization']),
    exposedHeaders: Joi.array().items(Joi.string()).default(['Content-Range', 'X-Content-Range']),
    credentials: Joi.boolean().default(true),
    maxAge: Joi.number().optional()
  }).required(),
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    format: Joi.string().default('combined'),
    file: Joi.string().optional()
  }).default()
}).unknown();

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Load the configuration file for the current environment
let config;
try {
  const configPath = path.join(__dirname, `${env}.json`);
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Replace environment variables in the config
  const replaceEnvVars = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/\$\{([^}]+)\}/g, (match, key) => {
        return process.env[key] || match;
      });
    } else if (Array.isArray(obj)) {
      return obj.map(item => replaceEnvVars(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceEnvVars(value);
      }
      return result;
    }
    return obj;
  };

  config = replaceEnvVars(config);
  
  // Validate the configuration
  const { value, error } = configSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false
  });
  
  if (error) {
    throw new Error(`Config validation error: ${error.details.map(d => d.message).join('; ')}`);
  }
  
  config = value;
  
} catch (error) {
  console.error('Failed to load configuration:', error);
  process.exit(1);
}

// Export the configuration
module.exports = config;
