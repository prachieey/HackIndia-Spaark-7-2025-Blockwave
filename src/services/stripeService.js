const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../utils/config');
const logger = require('../utils/logger');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.stripe.setApiVersion(config.stripe.apiVersion);
    this.initialize();
  }

  /**
   * Initialize the Stripe service
   */
  initialize() {
    logger.info('Initializing Stripe service');
    
    // Set app info for API requests
    this.stripe.setAppInfo({
      name: 'Scantyx', // Replace with your app name
      version: '1.0.0', // Your app version
      url: 'https://your-app-url.com', // Your app URL
    });
  }

  /**
   * Create a new customer in Stripe
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Stripe customer object
   */
  async createCustomer(customerData) {
    try {
      const { email, name, paymentMethodId } = customerData;
      
      const customer = await this.stripe.customers.create({
        email,
        name,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      logger.info(`Created Stripe customer: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create a payment intent
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Payment intent
   */
  async createPaymentIntent(paymentData) {
    try {
      const { amount, currency, customerId, paymentMethodId, metadata = {} } = paymentData;
      
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        metadata: {
          ...metadata,
          app_name: 'Scantyx',
        },
      });

      logger.info(`Created payment intent: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Stripe signature from header
   * @returns {Promise<Object>} Stripe event
   */
  async handleWebhookEvent(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      // Log the event
      logger.info(`Processing Stripe event: ${event.type}`, {
        eventId: event.id,
        type: event.type,
      });

      return event;
    } catch (error) {
      logger.error('Error processing webhook event:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {Object} options - Refund options
   * @returns {Promise<Object>} Refund object
   */
  async refundPayment(paymentIntentId, options = {}) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...options,
      });

      logger.info(`Processed refund: ${refund.id} for payment: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw this.handleStripeError(error);
    }
  }

  /**
   * Handle Stripe errors and format them consistently
   * @private
   */
  handleStripeError(error) {
    // Log the error
    logger.error('Stripe API Error:', {
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      requestId: error.requestId,
    });

    // Create a custom error object
    const customError = new Error(error.message);
    customError.type = error.type;
    customError.code = error.code;
    customError.statusCode = error.statusCode || 500;
    customError.requestId = error.requestId;

    return customError;
  }

  /**
   * Verify a webhook signature
   * @param {string} payload - Raw webhook payload
   * @param {string} signature - Stripe signature from header
   * @returns {Object} Stripe event if valid, throws error otherwise
   */
  verifyWebhookSignature(payload, signature) {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw this.handleStripeError(error);
    }
  }
}

// Create a singleton instance
const stripeService = new StripeService();

// Export the singleton instance
module.exports = stripeService;
