import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

/**
 * @route   POST /api/email/subscribe
 * @desc    Subscribe to newsletter
 * @access  Public
 */
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
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
          to_email: email,
          to_name: email.split('@')[0],
          from_name: 'Scantyx',
          reply_to: 'no-reply@scantyx.com',
          message: 'Thank you for subscribing to our newsletter!',
          subject: 'Welcome to Scantyx Newsletter!',
          website: req.get('host')
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('EmailJS Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send subscription email',
        error: error.toString()
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Successfully subscribed to our newsletter!' 
    });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing subscription',
      error: error.message 
    });
  }
});

export default router;
