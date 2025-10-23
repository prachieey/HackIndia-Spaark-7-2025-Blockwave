import express from 'express';
import { body, validationResult } from 'express-validator';
import { subscribeEmail, unsubscribeEmail, getSubscribers } from '../services/subscriptionService.js';
import { sendNewsletter } from '../services/emailService.js';
import { protect, restrictTo } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/newsletter/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post(
  '/subscribe',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('source').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => err.msg) 
      });
    }

    try {
      const { email, source = 'website' } = req.body;
      const metadata = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      const result = await subscribeEmail(email, { source, metadata });
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: result.message,
        isResubscribed: result.isResubscribed,
      });

    } catch (error) {
      logger.error('Newsletter subscription error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error during subscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   POST /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.post(
  '/unsubscribe',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => err.msg) 
      });
    }

    try {
      const { email } = req.body;
      const result = await unsubscribeEmail(email);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: result.message,
      });

    } catch (error) {
      logger.error('Newsletter unsubscribe error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process unsubscribe request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/newsletter/subscribers
// @desc    Get all newsletter subscribers (Admin only)
// @access  Private/Admin
router.get('/subscribers', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await getSubscribers({ 
      page: parseInt(page, 10), 
      limit: Math.min(parseInt(limit, 10), 100) 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscribers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @route   POST /api/newsletter/send
// @desc    Send a newsletter (Admin only)
// @access  Private/Admin
router.post(
  '/send',
  protect,
  restrictTo('admin'),
  [
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('previewText').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(err => err.msg) 
      });
    }

    try {
      const { subject, content, previewText } = req.body;
      const result = await sendNewsletter({
        subject,
        content,
        previewText,
      });
      
      res.json({
        success: result.success,
        message: result.success 
          ? 'Newsletter sent successfully' 
          : 'Failed to send some emails',
        data: result,
      });

    } catch (error) {
      logger.error('Error sending newsletter:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send newsletter',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

// @route   GET /api/newsletter/unsubscribe/:email
// @desc    Unsubscribe from newsletter via email link
// @access  Public
router.get('/unsubscribe/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const result = await unsubscribeEmail(decodeURIComponent(email));
    
    // Render a success page or redirect
    if (result.success) {
      return res.send(`
        <html>
          <head>
            <title>Unsubscribed Successfully</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                line-height: 1.6;
              }
              .success { color: #28a745; }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <h1 class="success">Successfully Unsubscribed</h1>
            <p>You have been successfully unsubscribed from our newsletter.</p>
            <p>We're sorry to see you go. You can resubscribe anytime.</p>
            <p><a href="${process.env.APP_URL || '/'}">Return to our website</a></p>
          </body>
        </html>
      `);
    }
    
    // Handle error case
    res.status(400).send(`
      <html>
        <head>
          <title>Error Unsubscribing</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px; 
              line-height: 1.6;
            }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Error Unsubscribing</h1>
          <p>${result.message || 'An error occurred while processing your request.'}</p>
          <p>Please contact support if you need assistance.</p>
          <p><a href="${process.env.APP_URL || '/'}">Return to our website</a></p>
        </body>
      </html>
    `);
    
  } catch (error) {
    logger.error('Error processing unsubscribe request:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

export default router;
