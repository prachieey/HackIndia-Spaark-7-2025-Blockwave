const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('./config');
const logger = require('./logger');

class KeyRotationManager {
  constructor() {
    this.isRotationScheduled = false;
  }

  /**
   * Schedule key rotation based on the configured interval
   */
  scheduleRotation() {
    if (this.isRotationScheduled) {
      logger.warn('Key rotation is already scheduled');
      return;
    }

    // Parse the rotation interval (e.g., '30d' -> 30 days)
    const interval = this.parseInterval(config.keyRotation.interval);
    if (!interval) {
      logger.warn('Invalid key rotation interval. Rotation not scheduled.');
      return;
    }

    // Schedule the rotation using cron syntax
    // This example runs at midnight every day and checks if rotation is needed
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.checkAndRotateKeys();
      } catch (error) {
        logger.error('Error during key rotation check:', error);
      }
    });

    this.isRotationScheduled = true;
    logger.info(`Key rotation scheduled to check every day at midnight`);
  }

  /**
   * Check if it's time to rotate keys and perform rotation if needed
   */
  async checkAndRotateKeys() {
    const now = new Date();
    const lastRotation = config.keyRotation.lastRotation || new Date(0);
    const intervalMs = this.parseIntervalToMs(config.keyRotation.interval);
    
    if (now - lastRotation >= intervalMs) {
      logger.info('Initiating key rotation...');
      await this.rotateStripeKeys();
      // Update last rotation time
      process.env.LAST_KEY_ROTATION = now.toISOString();
      logger.info('Key rotation completed successfully');
    }
  }

  /**
   * Rotate Stripe API keys
   */
  async rotateStripeKeys() {
    try {
      // 1. Create a new API key
      const newKey = await stripe.apiKeys.create({
        role: 'standard',
      });
      
      // 2. Update the environment variables
      process.env.STRIPE_SECRET_KEY = newKey.secret;
      
      // 3. Optionally, update the publishable key if needed
      // process.env.STRIPE_PUBLISHABLE_KEY = newKey.publishable_key;
      
      // 4. Revoke the old key (after a grace period in production)
      if (process.env.NODE_ENV === 'production') {
        // In production, you might want to keep the old key active for a short period
        // to avoid disrupting in-flight requests
        setTimeout(async () => {
          try {
            await stripe.apiKeys.del(process.env.STRIPE_SECRET_KEY);
            logger.info('Old Stripe API key revoked');
          } catch (error) {
            logger.error('Error revoking old Stripe API key:', error);
          }
        }, 24 * 60 * 60 * 1000); // 24-hour grace period
      }
      
      logger.info('Stripe API keys rotated successfully');
    } catch (error) {
      logger.error('Error rotating Stripe API keys:', error);
      throw error;
    }
  }

  /**
   * Parse interval string (e.g., '30d', '1w') to milliseconds
   */
  parseIntervalToMs(interval) {
    const match = interval.match(/^(\d+)([smhdwMy])?$/);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2] || 'd'; // Default to days

    switch (unit) {
      case 's': return value * 1000; // seconds
      case 'm': return value * 60 * 1000; // minutes
      case 'h': return value * 60 * 60 * 1000; // hours
      case 'd': return value * 24 * 60 * 60 * 1000; // days
      case 'w': return value * 7 * 24 * 60 * 60 * 1000; // weeks
      case 'M': return value * 30 * 24 * 60 * 60 * 1000; // months (approximate)
      case 'y': return value * 365 * 24 * 60 * 60 * 1000; // years (approximate)
      default: return null;
    }
  }

  /**
   * Parse interval string to human-readable format
   */
  parseInterval(interval) {
    const ms = this.parseIntervalToMs(interval);
    if (!ms) return null;

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

// Create a singleton instance
const keyRotationManager = new KeyRotationManager();

// Export the singleton instance
module.exports = keyRotationManager;
