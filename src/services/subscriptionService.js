import Subscription from '../models/Subscription.js';
import { sendWelcomeEmail } from './emailService.js';

/**
 * Subscribe an email to the newsletter
 * @param {string} email - The email to subscribe
 * @param {Object} options - Additional options
 * @param {string} [options.source='website'] - Source of the subscription
 * @param {Object} [options.metadata={}] - Additional metadata
 * @returns {Promise<Object>} - Result of the operation
 */
export const subscribeEmail = async (email, { source = 'website', metadata = {} } = {}) => {
  try {
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return { success: false, message: 'Please provide a valid email address' };
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if already subscribed
    let subscription = await Subscription.findOne({ email: normalizedEmail });
    
    if (subscription) {
      if (!subscription.isActive) {
        // Resubscribe
        subscription.isActive = true;
        subscription.unsubscribedAt = undefined;
        subscription.source = source;
        subscription.metadata = { ...subscription.metadata, ...metadata };
        await subscription.save();
        
        // Send welcome back email
        await sendWelcomeEmail(normalizedEmail, { isResubscribe: true });
        
        return { 
          success: true, 
          message: 'Successfully resubscribed to our newsletter!',
          isResubscribed: true
        };
      }
      return { 
        success: false, 
        message: 'This email is already subscribed to our newsletter',
        isAlreadySubscribed: true
      };
    }
    
    // Create new subscription
    subscription = new Subscription({
      email: normalizedEmail,
      source,
      metadata
    });
    
    await subscription.save();
    
    // Send welcome email
    await sendWelcomeEmail(normalizedEmail);
    
    return { 
      success: true, 
      message: 'Successfully subscribed to our newsletter!',
      subscription
    };
    
  } catch (error) {
    console.error('Subscription error:', error);
    
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return { 
        success: false, 
        message: 'This email is already subscribed to our newsletter',
        isAlreadySubscribed: true
      };
    }
    
    return { 
      success: false, 
      message: 'Failed to process subscription. Please try again later.'
    };
  }
};

/**
 * Unsubscribe an email from the newsletter
 * @param {string} email - The email to unsubscribe
 * @returns {Promise<Object>} - Result of the operation
 */
export const unsubscribeEmail = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const subscription = await Subscription.findOneAndUpdate(
      { email: normalizedEmail, isActive: true },
      { 
        isActive: false, 
        unsubscribedAt: new Date() 
      },
      { new: true }
    );
    
    if (!subscription) {
      return { 
        success: false, 
        message: 'Email not found or already unsubscribed' 
      };
    }
    
    return { 
      success: true, 
      message: 'Successfully unsubscribed from our newsletter' 
    };
    
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return { 
      success: false, 
      message: 'Failed to process unsubscribe request' 
    };
  }
};

/**
 * Get all active subscribers with pagination
 * @param {Object} options - Pagination options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Number of items per page
 * @returns {Promise<Object>} - Paginated list of subscribers
 */
export const getSubscribers = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const skip = (page - 1) * limit;
    
    const [subscribers, total] = await Promise.all([
      Subscription.find({ isActive: true })
        .sort({ subscribedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Subscription.countDocuments({ isActive: true })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      success: true,
      data: subscribers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
    
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return { 
      success: false, 
      message: 'Failed to fetch subscribers' 
    };
  }
};

/**
 * Update last email sent timestamp for a subscriber
 * @param {string} email - The subscriber's email
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateLastEmailSent = async (email) => {
  try {
    await Subscription.updateOne(
      { email: email.toLowerCase().trim() },
      { lastEmailSent: new Date() }
    );
    return true;
  } catch (error) {
    console.error('Error updating last email sent:', error);
    return false;
  }
};
