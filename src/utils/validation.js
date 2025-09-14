const Joi = require('joi');
const AppError = require('./appError');

// Common validation schemas
const schemas = {
  // User schemas
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be longer than 50 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    passwordConfirm: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Please confirm your password',
    }),
    role: Joi.string().valid('user', 'organizer'),
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).messages({
      'string.pattern.base': 'Please provide a valid Ethereum address',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),

  // Event schemas
  createEvent: Joi.object({
    title: Joi.string().min(5).max(100).required().messages({
      'string.empty': 'Event title is required',
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot be longer than 100 characters',
    }),
    description: Joi.string().min(20).required().messages({
      'string.empty': 'Event description is required',
      'string.min': 'Description must be at least 20 characters long',
    }),
    category: Joi.string()
      .valid('music', 'sports', 'conference', 'art', 'charity', 'other')
      .required()
      .messages({
        'any.only': 'Please select a valid category',
        'string.empty': 'Category is required',
      }),
    startDate: Joi.date().iso().greater('now').required().messages({
      'date.base': 'Please provide a valid start date',
      'date.greater': 'Start date must be in the future',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'date.base': 'Please provide a valid end date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required',
    }),
    venue: Joi.object({
      name: Joi.string().required().messages({
        'string.empty': 'Venue name is required',
      }),
      address: Joi.string().required().messages({
        'string.empty': 'Venue address is required',
      }),
      city: Joi.string().required().messages({
        'string.empty': 'City is required',
      }),
      country: Joi.string().required().messages({
        'string.empty': 'Country is required',
      }),
      coordinates: Joi.array()
        .items(Joi.number())
        .length(2)
        .optional()
        .messages({
          'array.base': 'Coordinates must be an array',
          'array.length': 'Coordinates must contain exactly 2 values [longitude, latitude]',
        }),
      isVirtual: Joi.boolean().default(false),
      meetingLink: Joi.when('isVirtual', {
        is: true,
        then: Joi.string().uri().required().messages({
          'string.uri': 'Please provide a valid meeting URL',
          'string.empty': 'Meeting link is required for virtual events',
        }),
        otherwise: Joi.string().allow('').optional(),
      }),
    }).required(),
    ticketTypes: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().messages({
            'string.empty': 'Ticket type name is required',
          }),
          description: Joi.string().allow('').optional(),
          price: Joi.number().min(0).required().messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price cannot be negative',
            'any.required': 'Price is required',
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
          }),
          saleStart: Joi.date().iso().min('now').optional().messages({
            'date.base': 'Sale start must be a valid date',
            'date.min': 'Sale start must be in the future',
          }),
          saleEnd: Joi.date()
            .iso()
            .greater(Joi.ref('saleStart'))
            .optional()
            .messages({
              'date.base': 'Sale end must be a valid date',
              'date.greater': 'Sale end must be after sale start',
            }),
          perks: Joi.array().items(Joi.string()).optional(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one ticket type is required',
        'any.required': 'Ticket types are required',
      }),
    termsConditions: Joi.string().allow('').optional(),
    refundPolicy: Joi.string().allow('').optional(),
  }),

  // Ticket schemas
  purchaseTickets: Joi.object({
    eventId: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid event ID format',
      'string.length': 'Invalid event ID length',
      'any.required': 'Event ID is required',
    }),
    tickets: Joi.array()
      .items(
        Joi.object({
          ticketTypeId: Joi.string().hex().length(24).required().messages({
            'string.hex': 'Invalid ticket type ID format',
            'string.length': 'Invalid ticket type ID length',
            'any.required': 'Ticket type ID is required',
          }),
          quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
          }),
          attendeeInfo: Joi.object({
            name: Joi.string().required().messages({
              'string.empty': 'Attendee name is required',
            }),
            email: Joi.string().email().required().messages({
              'string.empty': 'Attendee email is required',
              'string.email': 'Please provide a valid email address',
            }),
          })
            .unknown()
            .optional(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one ticket must be selected',
        'any.required': 'Tickets are required',
      }),
    paymentMethod: Joi.string().valid('crypto', 'card').required().messages({
      'any.only': 'Invalid payment method',
      'any.required': 'Payment method is required',
    }),
  }),

  // Review schemas
  createReview: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot be more than 5',
      'any.required': 'Rating is required',
    }),
    review: Joi.string().min(10).required().messages({
      'string.empty': 'Review text is required',
      'string.min': 'Review must be at least 10 characters long',
    }),
  }),

  // Pagination and filtering
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
    sort: Joi.string().pattern(/^-?[a-zA-Z,]+$/).optional().messages({
      'string.pattern.base': 'Invalid sort format',
    }),
    fields: Joi.string().optional(),
  }),
};

/**
 * Validate request data against a schema
 * @param {Object} data - Data to validate
 * @param {string} schemaName - Name of the schema to use
 * @param {Object} options - Additional options for validation
 * @returns {Object} - Validated data
 * @throws {AppError} - If validation fails
 */
const validate = (data, schemaName, options = {}) => {
  const schema = schemas[schemaName];
  
  if (!schema) {
    throw new AppError(`Validation schema '${schemaName}' not found`, 500);
  }

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: options.allowUnknown || false,
    stripUnknown: options.stripUnknown !== false, // Default to true
    ...options,
  });

  if (error) {
    const errors = {};
    
    error.details.forEach((detail) => {
      const key = detail.path.join('.');
      errors[key] = detail.message;
    });

    throw new AppError('Validation failed', 400, errors);
  }

  return value;
};

/**
 * Middleware to validate request data
 * @param {string} schemaName - Name of the schema to use
 * @param {Object} options - Additional options for validation
 * @returns {Function} - Express middleware function
 */
const validateRequest = (schemaName, options = {}) => {
  return (req, res, next) => {
    try {
      // Combine all request data
      const data = {
        ...req.body,
        ...req.params,
        ...(req.query && Object.keys(req.query).length > 0 && { query: req.query }),
      };

      // Validate the data
      const validatedData = validate(data, schemaName, options);

      // Replace the request data with validated data
      req.validatedData = validatedData;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  schemas,
  validate,
  validateRequest,
};
