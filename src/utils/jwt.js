const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./appError');

/**
 * Generate a JWT token
 * @param {string} userId - User ID to include in the token
 * @param {string} [role='user'] - User role
 * @returns {string} - JWT token
 */
const generateToken = (userId, role = 'user') => {
  if (!userId) {
    throw new AppError('User ID is required to generate token', 500);
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 * @throws {AppError} - If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!token) {
    throw new AppError('No token provided', 401);
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired. Please log in again.', 401);
    } else if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again.', 401);
    } else {
      throw new AppError('Authentication failed', 401);
    }
  }
};

/**
 * Get token from request headers, cookies, or query parameters
 * @param {Object} req - Express request object
 * @returns {string} - JWT token
 */
const getTokenFromRequest = (req) => {
  let token;
  
  // 1) Check headers (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2) Check cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 3) Check query parameters (for email verification links, etc.)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  return token;
};

/**
 * Generate a random token (for password reset, email verification, etc.)
 * @param {number} [bytes=32] - Number of bytes to generate
 * @returns {string} - Random token
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a hashed token using crypto
 * @param {string} token - Token to hash
 * @returns {string} - Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Set JWT as HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 * @param {Object} [options={}] - Additional cookie options
 */
const setJwtCookie = (res, token, options = {}) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    ...options,
  };

  res.cookie('jwt', token, cookieOptions);
};

/**
 * Clear JWT cookie
 * @param {Object} res - Express response object
 */
const clearJwtCookie = (res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromRequest,
  generateRandomToken,
  hashToken,
  setJwtCookie,
  clearJwtCookie,
};
