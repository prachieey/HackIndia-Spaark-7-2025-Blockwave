const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../utils/config');
const logger = require('../utils/logger');

/**
 * Middleware to validate Stripe webhook events
 */
const validateStripeWebhook = async (req, res, next) => {
  try {
    // Get the signature from the request headers
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
      logger.warn('Stripe webhook signature missing');
      return res.status(400).json({ error: 'Missing Stripe signature' });
    }

    let event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Attach the event to the request object
    req.stripeEvent = event;
    
    // Log the event for debugging
    logger.info(`Received Stripe event: ${event.type}`, {
      eventId: event.id,
      type: event.type,
      livemode: event.livemode,
    });

    next();
  } catch (error) {
    logger.error('Error in validateStripeWebhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Middleware to validate Stripe API requests
 */
const validateStripeRequest = (req, res, next) => {
  // Validate required Stripe headers
  if (!req.headers['stripe-version']) {
    return res.status(400).json({ 
      error: 'Stripe-version header is required' 
    });
  }

  // Add additional validation as needed
  next();
};

/**
 * Middleware to handle Stripe API errors
 */
const handleStripeErrors = (err, req, res, next) => {
  if (err.type === 'StripeInvalidRequestError') {
    logger.error('Stripe invalid request error:', err);
    return res.status(400).json({
      error: 'Invalid request to Stripe API',
      details: err.message,
    });
  }

  if (err.type === 'StripeAPIError') {
    logger.error('Stripe API error:', err);
    return res.status(502).json({
      error: 'Error communicating with Stripe',
      details: 'Payment service temporarily unavailable',
    });
  }

  if (err.type === 'StripeConnectionError') {
    logger.error('Stripe connection error:', err);
    return res.status(503).json({
      error: 'Unable to connect to Stripe',
      details: 'Payment service is currently unavailable',
    });
  }

  // For other types of errors, pass to the default error handler
  next(err);
};

/**
 * Validate payment method details
 */
const validatePaymentMethod = (req, res, next) => {
  const { paymentMethodId, amount, currency } = req.body;
  
  // Basic validation
  if (!paymentMethodId) {
    return res.status(400).json({ error: 'Payment method ID is required' });
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'A valid amount is required' });
  }

  if (!currency || !['usd', 'eur', 'gbp'].includes(currency.toLowerCase())) {
    return res.status(400).json({ error: 'A valid currency is required' });
  }

  // Add additional validation as needed
  next();
};

module.exports = {
  validateStripeWebhook,
  validateStripeRequest,
  handleStripeErrors,
  validatePaymentMethod,
};
