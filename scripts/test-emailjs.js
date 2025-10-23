import dotenv from 'dotenv';
import { connectDB } from '../src/config/database-connection.js';
import { sendEmail } from '../src/services/emailService.js';

// Load environment variables
dotenv.config();

// Test email configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

async function testEmailJS() {
  console.log('=== Testing EmailJS Integration ===\n');
  
  try {
    // Set EmailJS as the email provider
    process.env.EMAIL_PROVIDER = 'emailjs';
    
    // Verify required environment variables
    const requiredVars = [
      'EMAILJS_SERVICE_ID',
      'EMAILJS_TEMPLATE_ID',
      'EMAILJS_USER_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required EmailJS environment variables:');
      missingVars.forEach(varName => console.error(`- ${varName}`));
      console.log('\nPlease add these to your .env file and try again.');
      process.exit(1);
    }
    
    console.log('✅ EmailJS environment variables are set');
    
    // Connect to database (in case needed for logging)
    console.log('\n1. Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');
    
    // Test sending an email
    console.log('2. Sending test email...');
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: 'Test Email from EmailJS',
      template: 'welcome',
      data: {
        isResubscribe: false,
        unsubscribeUrl: `http://localhost:${process.env.PORT || 5000}/unsubscribe?email=${encodeURIComponent(TEST_EMAIL)}`,
        appName: 'Your App Name',
        year: new Date().getFullYear()
      }
    });
    
    console.log('\n✅ Test email sent successfully!');
    console.log('Response:', {
      messageId: result.messageId,
      response: result.response
    });
    
  } catch (error) {
    console.error('\n❌ Error sending test email:');
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the test
testEmailJS();
