import DemoRequest from '../models/DemoRequest.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

export const createDemoRequest = async (req, res, next) => {
  try {
    const { name, email, company, message } = req.body;

    // Validate required fields
    if (!name || !email || !company) {
      return next(new AppError('Name, email, and company are required', 400));
    }

    // Create new demo request
    const demoRequest = await DemoRequest.create({
      name,
      email,
      company,
      message: message || 'No additional message provided',
    });

    // Send confirmation email (optional)
    try {
      await sendEmail({
        email: email,
        subject: 'Demo Request Received',
        message: `Hi ${name},\n\nThank you for your interest in Scantyx! We've received your demo request and our team will contact you within 24-48 hours.\n\nBest regards,\nThe Scantyx Team`
      });

      // Also send notification to admin
      await sendEmail({
        email: process.env.ADMIN_EMAIL || 'admin@scantyx.com',
        subject: 'New Demo Request',
        message: `New demo request received:\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nMessage: ${message || 'No message provided'}`
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      status: 'success',
      data: {
        demoRequest
      }
    });
  } catch (error) {
    console.error('Error creating demo request:', error);
    next(new AppError('Failed to process demo request', 500));
  }
};

export const getAllDemoRequests = async (req, res, next) => {
  try {
    const demoRequests = await DemoRequest.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: demoRequests.length,
      data: {
        demoRequests
      }
    });
  } catch (error) {
    next(new AppError('Failed to fetch demo requests', 500));
  }
};
