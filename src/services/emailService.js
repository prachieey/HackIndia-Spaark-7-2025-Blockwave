import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import fetch from 'node-fetch';
import { updateLastEmailSent } from './subscriptionService.js';
import logger from '../utils/logger.js';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email templates cache
const templates = {};

/**
 * Get email template
 * @param {string} templateName - Name of the template file (without extension)
 * @returns {Promise<Function>} - Compiled Handlebars template
 */
async function getTemplate(templateName) {
  if (templates[templateName]) {
    return templates[templateName];
  }

  try {
    const templatePath = path.join(
      __dirname, 
      '..', 
      'templates', 
      'emails', 
      `${templateName}.hbs`
    );
    
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    templates[templateName] = handlebars.compile(templateContent);
    return templates[templateName];
  } catch (error) {
    console.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${templateName}`);
  }
}

/**
 * Create email transporter based on environment variables
 * @returns {Object} - Nodemailer transporter
 */
async function createTransporter() {
  const emailProvider = (process.env.EMAIL_PROVIDER || 'ethereal').toLowerCase();
  
  // Common email options
  const commonOptions = {
    from: `\"${process.env.EMAIL_FROM_NAME || 'Your App Name'}\" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'}>`,
  };

  // For testing, always use Ethereal Email
  if (process.env.NODE_ENV === 'test' || emailProvider === 'ethereal') {
    console.log('Using Ethereal Email for testing');
    // Create a test account if not in production
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      logger: process.env.NODE_ENV !== 'test',
      debug: process.env.NODE_ENV !== 'test',
    });
  }

  // Production email providers
  switch (emailProvider) {
    case 'sendgrid':
      return nodemailer.createTransport({
        ...commonOptions,
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });

    case 'gmail':
      return nodemailer.createTransport({
        ...commonOptions,
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
        },
      });

    case 'emailjs':
      // For EmailJS, we'll use a custom transport
      return {
        sendMail: async (mailOptions) => {
          try {
            if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID || !process.env.EMAILJS_USER_ID) {
              throw new Error('EmailJS configuration is missing. Please check your environment variables.');
            }

            const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID,
                user_id: process.env.EMAILJS_USER_ID,
                template_params: {
                  to_email: mailOptions.to,
                  to_name: mailOptions.to.split('@')[0],
                  from_name: mailOptions.from?.name || process.env.EMAIL_FROM_NAME || 'Your App Name',
                  reply_to: mailOptions.replyTo || process.env.EMAIL_REPLY_TO || 'noreply@example.com',
                  subject: mailOptions.subject || 'No Subject',
                  message: mailOptions.text || '',
                  html: mailOptions.html || '',
                  ...(mailOptions.context || {}) // Pass any additional template parameters
                },
                accessToken: process.env.EMAILJS_ACCESS_TOKEN // Optional access token
              })
            });

            if (!response.ok) {
              const error = await response.text();
              logger.error('EmailJS Error:', error);
              throw new Error(`Failed to send email: ${error}`);
            }

            const result = await response.json();
            logger.info('Email sent via EmailJS:', { 
              to: mailOptions.to, 
              messageId: result.message_id 
            });

            return {
              messageId: result.message_id,
              response: '250 Message sent via EmailJS',
              envelope: {
                from: mailOptions.from,
                to: [mailOptions.to]
              }
            };
          } catch (error) {
            logger.error('EmailJS send error:', error);
            throw error;
          }
        }
      };

    case 'ses':
      return nodemailer.createTransport({
        ...commonOptions,
        SES: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1',
        },
      });

    case 'smtp':
    default:
      if (!process.env.SMTP_HOST) {
        throw new Error('SMTP_HOST is required when using SMTP provider');
      }
      return nodemailer.createTransport({
        ...commonOptions,
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  }
}

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.template - Template name (without .hbs)
 * @param {Object} options.data - Template data
 * @param {string} options.subject - Email subject
 * @returns {Promise<Object>} - Result of the email sending
 */
export const sendEmail = async ({ to, template, data = {}, subject }) => {
  try {
    const transporter = await createTransporter();
    
    // Get and compile the template
    const templateFn = await getTemplate(template);
    const html = templateFn({
      ...data,
      year: new Date().getFullYear(),
      appName: process.env.APP_NAME || 'Our App',
      appUrl: process.env.APP_URL || 'https://yourapp.com',
      emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com',
    });

    // Prepare email options
    const mailOptions = {
      from: `\"${process.env.EMAIL_FROM_NAME || 'Your App Name'}\" <${process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'}>`,
      to,
      subject,
      html,
      // Optional: Add text version for better deliverability
      text: html.replace(/<[^>]*>?/gm, ''), // Simple HTML to text conversion
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    // For Ethereal Email in test/dev, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    // Update last email sent timestamp
    await updateLastEmailSent(to);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send welcome email to new subscribers
 * @param {string} email - Subscriber's email
 * @param {Object} options - Additional options
 * @param {boolean} [options.isResubscribe] - Whether this is a resubscription
 * @returns {Promise<Object>} - Result of the email sending
 */
export const sendWelcomeEmail = async (email, { isResubscribe = false } = {}) => {
  const subject = isResubscribe 
    ? 'Welcome Back to Our Newsletter! 🎉' 
    : 'Welcome to Our Newsletter! 🎉';
    
  return sendEmail({
    to: email,
    template: 'welcome', // This should match the template filename (welcome.hbs)
    subject,
    data: {
      isResubscribe,
      unsubscribeUrl: `${process.env.APP_URL || 'https://yourapp.com'}/unsubscribe?email=${encodeURIComponent(email)}`,
    },
  });
};

/**
 * Send a newsletter to all active subscribers
 * @param {Object} newsletter - Newsletter data
 * @param {string} newsletter.subject - Email subject
 * @param {string} newsletter.content - HTML content of the newsletter
 * @param {string} [newsletter.previewText] - Preview text for email clients
 * @returns {Promise<Object>} - Result of the newsletter sending
 */
export const sendNewsletter = async ({ subject, content, previewText }) => {
  try {
    // In a real app, you would fetch subscribers from the database
    // and send emails in batches to avoid rate limiting
    const { data: subscribers } = await getSubscribers({ limit: 1000 }); // Adjust limit as needed
    
    const results = {
      total: subscribers.length,
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process emails in batches to avoid overwhelming the email service
    const BATCH_SIZE = 10; // Adjust based on your email provider's rate limits
    
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(async (subscriber) => {
          try {
            await sendEmail({
              to: subscriber.email,
              template: 'newsletter',
              subject,
              data: {
                content,
                previewText,
                unsubscribeUrl: `${process.env.APP_URL || 'https://yourapp.com'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`,
              },
            });
            return { success: true, email: subscriber.email };
          } catch (error) {
            return { 
              success: false, 
              email: subscriber.email, 
              error: error.message 
            };
          }
        })
      );

      // Update results
      batchResults.forEach(result => {
        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({
            email: result.email,
            error: result.error,
          });
        }
      });

      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: results.failed === 0,
      ...results,
    };
    
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return {
      success: false,
      error: error.message,
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
    };
  }
};
