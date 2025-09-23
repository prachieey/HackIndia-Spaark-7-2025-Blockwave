import winston from 'winston';
import 'winston-daily-rotate-file';
import { logging } from '../config/index.js';

const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json, metadata } = format;

// Security: Redact sensitive information
const redactSensitive = format((info) => {
  const redactFields = [
    'password',
    'token',
    'authorization',
    'card',
    'cvv',
    'number',
    'exp_month',
    'exp_year',
    'cvc',
    'ssn',
    'api_key',
    'apiKey',
    'secret',
  ];

  const redactValue = () => '[REDACTED]';

  const redactObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const result = { ...obj };
    for (const key of Object.keys(result)) {
      if (redactFields.includes(key.toLowerCase())) {
        result[key] = redactValue();
      } else if (typeof result[key] === 'object') {
        result[key] = redactObject(result[key]);
      } else if (typeof result[key] === 'string' && 
                (key.toLowerCase().includes('token') || 
                 key.toLowerCase().includes('secret') ||
                 key.toLowerCase().includes('key'))) {
        result[key] = redactValue();
      }
    }
    return result;
  };

  return redactObject(info);
});

// Custom log format with security in mind
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level.toUpperCase()}] ${message}${metaString}${stack ? `\n${stack}` : ''}`;
});

// Log to console for development
const consoleTransport = new transports.Console({
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  ),
  level: 'debug',
});

// File transport for production
const fileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: combine(
    timestamp(),
    json(),
    format.errors({ stack: true })
  ),
});

// Error file transport
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: combine(
    timestamp(),
    json(),
    format.errors({ stack: true })
  ),
});

// Security alert transport
const securityTransport = new winston.transports.File({
  filename: 'logs/security.log',
  level: 'warn',
  format: combine(
    timestamp(),
    json(),
    format.errors({ stack: true })
  ),
});

// Create the logger with security features
const logger = createLogger({
  level: logging.level || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactSensitive(),
    json(),
    metadata()
  ),
  defaultMeta: { service: 'scantyx-api' },
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new transports.File({ filename: 'logs/rejections.log' })
  ],
  exitOnError: false, // Don't exit on handled exceptions
});

// Add request logging middleware
const requestLogger = (req, res, next) => {
  // Skip health check endpoints
  if (req.path === '/health' || req.path === '/status') {
    return next();
  }

  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  
  // Log the request
  logger.info('Request received', {
    method,
    url: originalUrl,
    ip,
    userAgent: headers['user-agent'],
    referrer: headers.referer || headers.referrer,
    contentType: headers['content-type'],
    contentLength: headers['content-length'] || 0,
  });

  // Log the response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow request', {
        method,
        url: originalUrl,
        duration: `${duration}ms`,
        statusCode,
      });
    }
    
    // Log errors
    if (statusCode >= 400) {
      logger.error('Request error', {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
};

// Security logging
// Security logging
const securityLogger = {
  suspiciousActivity: (message, meta = {}) => {
    logger.warn(`SECURITY: ${message}`, {
      ...meta,
      securityEvent: true,
      timestamp: new Date().toISOString(),
    });
    
    // In production, you might want to send an alert here
    if (process.env.NODE_ENV === 'production') {
      // Example: Send alert to security team
      console.warn(`SECURITY ALERT: ${message}`, meta);
    }
  },
  
  authFailure: (username, ip, reason) => {
    logger.warn('Authentication failure', {
      username,
      ip,
      reason,
      securityEvent: true,
      timestamp: new Date().toISOString(),
    });
  },
  
  rateLimitHit: (ip, path) => {
    logger.warn('Rate limit hit', {
      ip,
      path,
      securityEvent: true,
      timestamp: new Date().toISOString(),
    });
  },
};

// Add unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { 
    reason: reason.toString(),
    stack: reason.stack 
  });
});

// Export logger as default for backward compatibility
const defaultExport = logger;
export { logger, requestLogger, securityLogger };
export default defaultExport;
