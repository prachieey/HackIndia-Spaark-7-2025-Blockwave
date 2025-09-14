const rateLimit = require('express-rate-limit');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const AppError = require('./appError');

// In-memory store for rate limiting
const rateLimiterMemory = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_POINTS) || 100, // Number of points
  duration: parseInt(process.env.RATE_LIMIT_DURATION) || 60 * 60, // Per 1 hour by default
  blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION) || 15 * 60, // Block for 15 minutes
});

/**
 * Custom rate limiter middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.points - Number of points (requests)
 * @param {number} options.duration - Duration in seconds
 * @param {string} options.keyPrefix - Prefix for the rate limiter key
 * @param {string[]} options.whitelist - Array of IPs to whitelist
 * @returns {Function} - Express middleware
 */
const customRateLimiter = (options = {}) => {
  const {
    points = 100,
    duration = 60 * 60, // 1 hour
    keyPrefix = 'rl_',
    whitelist = [],
  } = options;

  return async (req, res, next) => {
    // Skip rate limiting for whitelisted IPs
    const clientIp = req.ip || req.connection.remoteAddress;
    if (whitelist.includes(clientIp)) {
      return next();
    }

    try {
      const rateLimiter = new RateLimiterMemory({
        points,
        duration,
        keyPrefix: `${keyPrefix}${req.path.replace(/\//g, '_')}`,
      });

      await rateLimiter.consume(clientIp);
      next();
    } catch (error) {
      // Calculate retry after in seconds
      const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1;
      
      // Set rate limit headers
      res.set({
        'Retry-After': retryAfter,
        'X-RateLimit-Limit': points,
        'X-RateLimit-Remaining': 0,
        'X-RateLimit-Reset': new Date(Date.now() + error.msBeforeNext).toISOString(),
      });

      next(
        new AppError(
          'Too many requests, please try again later.',
          429,
          { retryAfter }
        )
      );
    }
  };
};

/**
 * Rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `auth_${req.ip}`;
  },
});

/**
 * Rate limiter for public API endpoints
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  keyGenerator: (req) => {
    return `api_${req.ip}`;
  },
});

/**
 * Rate limiter for password reset and similar sensitive operations
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `sensitive_${req.ip}`;
  },
});

/**
 * Rate limiter for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 file uploads per windowMs
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `upload_${req.ip}`;
  },
});

/**
 * Rate limiter for account creation
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 account creation requests per windowMs
  message: 'Too many accounts created from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `signup_${req.ip}`;
  },
});

/**
 * Rate limiter for payment processing
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: 'Too many payment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `payment_${req.ip}`;
  },
});

module.exports = {
  rateLimiterMemory,
  customRateLimiter,
  authLimiter,
  apiLimiter,
  sensitiveLimiter,
  uploadLimiter,
  createAccountLimiter,
  paymentLimiter,
};
