const AppError = require('./appError');

/**
 * Success Response Handler
 * @param {Object} res - Express response object
 * @param {*} data - Data to send in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} - JSON response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    // Handle pagination data
    if (data.docs) {
      response.data = data.docs;
      response.pagination = {
        total: data.totalDocs,
        limit: data.limit,
        page: data.page,
        pages: data.totalPages,
        hasNextPage: data.hasNextPage,
        hasPrevPage: data.hasPrevPage,
      };
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Handler
 * @param {Object} res - Express response object
 * @param {Error|string} error - Error object or error message
 * @param {string} defaultMessage - Default error message if error is a string
 * @param {number} defaultStatusCode - Default status code if error is not an AppError
 * @returns {Object} - JSON response
 */
const errorResponse = (res, error, defaultMessage = 'An error occurred', defaultStatusCode = 500) => {
  let statusCode = defaultStatusCode;
  let message = defaultMessage;
  let errors = null;

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode || statusCode;
    message = error.message || message;
    errors = error.errors;
  } else if (error.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    
    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    // Extract the duplicate field from the error message
    const match = error.message.match(/index: (?:.*\$)?(\w+)_\d+/);
    if (match) {
      const field = match[1];
      errors = { [field]: `This ${field} is already in use` };
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  } else if (typeof error === 'string') {
    message = error;
  }

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * 404 Not Found Response
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource that was not found
 * @returns {Object} - JSON response
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(
    res,
    new AppError(`${resource} not found`, 404)
  );
};

/**
 * 403 Forbidden Response
 * @param {Object} res - Express response object
 * @param {string} message - Custom forbidden message
 * @returns {Object} - JSON response
 */
const forbiddenResponse = (res, message = 'You do not have permission to perform this action') => {
  return errorResponse(
    res,
    new AppError(message, 403)
  );
};

/**
 * 401 Unauthorized Response
 * @param {Object} res - Express response object
 * @param {string} message - Custom unauthorized message
 * @returns {Object} - JSON response
 */
const unauthorizedResponse = (res, message = 'Please log in to access this resource') => {
  return errorResponse(
    res,
    new AppError(message, 401)
  );
};

/**
 * 400 Bad Request Response
 * @param {Object} res - Express response object
 * @param {string} message - Custom error message
 * @param {Object} errors - Optional validation errors
 * @returns {Object} - JSON response
 */
const badRequestResponse = (res, message = 'Invalid request', errors = null) => {
  const error = new AppError(message, 400);
  if (errors) {
    error.errors = errors;
  }
  return errorResponse(res, error);
};

/**
 * 500 Internal Server Error Response
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @returns {Object} - JSON response
 */
const serverErrorResponse = (res, error) => {
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  return errorResponse(
    res,
    error,
    message,
    500
  );
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
};
