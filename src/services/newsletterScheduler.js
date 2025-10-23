import cron from 'node-cron';
import { getSubscribers } from './subscriptionService.js';
import { sendEmail } from './emailService.js';
import logger from '../utils/logger.js';

// Store the scheduled jobs
const scheduledJobs = new Map();

/**
 * Schedule a recurring newsletter
 * @param {Object} options - Newsletter options
 * @param {string} options.name - Unique name for the newsletter
 * @param {string} options.schedule - Cron schedule (e.g., '0 10 * * 1' for every Monday at 10 AM)
 * @param {string} options.subject - Email subject
 * @param {Function} options.getContent - Async function that returns the newsletter content
 * @param {boolean} [options.enabled=true] - Whether the schedule is enabled
 */
export const scheduleNewsletter = async ({
  name,
  schedule,
  subject,
  getContent,
  enabled = true,
}) => {
  if (scheduledJobs.has(name)) {
    logger.warn(`Newsletter job "${name}" is already scheduled. Removing existing job.`);
    scheduledJobs.get(name).stop();
    scheduledJobs.delete(name);
  }

  if (!enabled) {
    logger.info(`Newsletter "${name}" is disabled.`);
    return;
  }

  try {
    const job = cron.schedule(schedule, async () => {
      try {
        logger.info(`Running scheduled newsletter: ${name}`);
        
        // Get the latest content
        const content = await getContent();
        
        // Get active subscribers
        const { data: subscribers } = await getSubscribers({ limit: 10000 }); // Adjust limit as needed
        
        logger.info(`Sending newsletter to ${subscribers.length} subscribers`);
        
        // Send to each subscriber
        for (const subscriber of subscribers) {
          try {
            await sendEmail({
              to: subscriber.email,
              template: 'newsletter',
              subject: subject,
              data: {
                ...content,
                unsubscribeUrl: `${process.env.APP_URL || 'https://yourapp.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
              },
            });
            logger.debug(`Newsletter sent to ${subscriber.email}`);
            
            // Add a small delay between emails to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            logger.error(`Failed to send newsletter to ${subscriber.email}:`, error);
            // Continue with the next subscriber
          }
        }
        
        logger.info(`Completed sending newsletter: ${name}`);
        
      } catch (error) {
        logger.error(`Error in newsletter job "${name}":`, error);
      }
    }, {
      timezone: 'UTC', // Adjust timezone as needed
    });
    
    scheduledJobs.set(name, job);
    logger.info(`Scheduled newsletter "${name}" with cron: ${schedule}`);
    
  } catch (error) {
    logger.error(`Failed to schedule newsletter "${name}":`, error);
    throw error;
  }
};

/**
 * Remove a scheduled newsletter
 * @param {string} name - Name of the newsletter to remove
 */
export const removeScheduledNewsletter = (name) => {
  if (scheduledJobs.has(name)) {
    scheduledJobs.get(name).stop();
    scheduledJobs.delete(name);
    logger.info(`Removed scheduled newsletter: ${name}`);
    return true;
  }
  return false;
};

/**
 * Initialize default newsletter schedules
 */
export const initializeDefaultNewsletters = () => {
  // Weekly newsletter - every Monday at 10 AM
  scheduleNewsletter({
    name: 'weekly-update',
    schedule: '0 10 * * 1', // Monday at 10:00 AM
    subject: 'Your Weekly Update | {{appName}}',
    enabled: process.env.ENABLE_WEEKLY_NEWSLETTER === 'true',
    getContent: async () => {
      // In a real app, you would fetch dynamic content here
      return {
        title: 'This Week\'s Highlights',
        content: 'Here are the latest updates from our team...',
        cta: {
          text: 'Read More',
          url: `${process.env.APP_URL}/blog`,
        },
      };
    },
  });

  // Monthly newsletter - 1st of every month at 9 AM
  scheduleNewsletter({
    name: 'monthly-digest',
    schedule: '0 9 1 * *', // 1st of every month at 9:00 AM
    subject: '{{appName}} Monthly Digest | {{month}} {{year}}',
    enabled: process.env.ENABLE_MONTHLY_NEWSLETTER === 'true',
    getContent: async () => {
      const now = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      return {
        title: `${monthNames[now.getMonth()]} ${now.getFullYear()} Digest`,
        content: 'Here\'s what happened this month at {{appName}}...',
        cta: {
          text: 'View Full Digest',
          url: `${process.env.APP_URL}/digest/${now.getFullYear()}/${now.getMonth() + 1}`,
        },
      };
    },
  });
};

/**
 * List all scheduled newsletters
 * @returns {Array} List of scheduled newsletters
 */
export const listScheduledNewsletters = () => {
  return Array.from(scheduledJobs.entries()).map(([name, job]) => ({
    name,
    nextRun: job.nextDate().toISO(),
    lastRun: job.lastDate()?.toISO(),
  }));
};

// Initialize default newsletters when this module is loaded
if (process.env.NODE_ENV !== 'test') {
  initializeDefaultNewsletters();
}

export default {
  scheduleNewsletter,
  removeScheduledNewsletter,
  listScheduledNewsletters,
  initializeDefaultNewsletters,
};
