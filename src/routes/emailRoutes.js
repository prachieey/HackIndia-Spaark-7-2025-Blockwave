import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
    console.log('Sending subscription request to EmailJS...');
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Node.js'
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        accessToken: process.env.EMAILJS_ACCESS_TOKEN,
        template_params: {
          to_email: email,
          to_name: email.split('@')[0],
          from_name: process.env.EMAIL_FROM_NAME || 'Scantyx',
          reply_to: process.env.EMAIL_REPLY_TO || 'no-reply@scantyx.com',
          message: 'Thank you for subscribing to our newsletter!',
          subject: 'Welcome to Scantyx Newsletter!',
          website: req.get('host'),
          unsubscribe_url: `${req.protocol}://${req.get('host')}/unsubscribe?email=${encodeURIComponent(email)}`
        }
      })
    });

    // Try to parse the response as JSON, fallback to text if it fails
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      // If JSON parsing fails, get the response as text
      const textResponse = await response.text();
      console.log('EmailJS Raw Response:', textResponse);
      
      // If the response is empty but status is ok, consider it a success
      if (response.ok && (!textResponse || textResponse.trim() === '')) {
        console.log('Successfully sent email to:', email);
        return res.status(200).json({ 
          success: true, 
          message: 'Successfully subscribed to our newsletter!'
        });
      }
      
      // If we have a non-empty non-JSON response, include it in the error
      throw new Error(textResponse || 'Invalid response from email service');
    }
    
    console.log('EmailJS Response:', responseData);
    
    if (!response.ok) {
      console.error('EmailJS Error Response:', responseData);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send subscription email',
        error: responseData.error || responseData.message || 'Unknown error occurred'
      });
    }

    // If we get here, the email was sent successfully
    console.log('Successfully sent email to:', email);
    
    res.status(200).json({ 
      success: true, 
      message: 'Successfully subscribed to our newsletter!',
      data: responseData
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
