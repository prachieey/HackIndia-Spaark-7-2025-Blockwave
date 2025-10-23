import dotenv from 'dotenv';
import { connectDB } from '../src/config/database-connection.js';
import { subscribeEmail, unsubscribeEmail } from '../src/services/subscriptionService.js';
import { sendEmail } from '../src/services/emailService.js';

// Load environment variables
dotenv.config();

// Test email configuration (use a real email for testing)
const TEST_EMAIL = 'test@example.com';

// Use Ethereal Email for testing
process.env.EMAIL_PROVIDER = 'ethereal';
process.env.NODE_ENV = 'test';

async function runTests() {
  console.log('=== Starting Newsletter System Tests ===\n');
  
  try {
    // 1. Connect to database
    console.log('1. Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');
    
    // 2. Test subscription
    console.log('2. Testing subscription...');
    const subResult = await subscribeEmail(TEST_EMAIL, { source: 'website' });
    console.log('Subscription result:', subResult);
    
    if (!subResult.success) {
      console.log('ℹ️  User might already be subscribed. Continuing tests...\n');
    } else {
      console.log('✅ Subscription test passed\n');
    }
    
    // 3. Test sending welcome email
    console.log('3. Testing welcome email...');
    const welcomeResult = await sendEmail({
      to: TEST_EMAIL,
      template: 'welcome',
      subject: 'Test Welcome Email',
      data: {
        isResubscribe: false,
        unsubscribeUrl: `http://localhost:${process.env.PORT || 5000}/unsubscribe?email=${encodeURIComponent(TEST_EMAIL)}`,
      },
    });
    
    console.log('Welcome email result:', welcomeResult);
    console.log(welcomeResult.success ? '✅ Welcome email test passed\n' : '❌ Welcome email test failed\n');
    
    // 4. Test sending newsletter email
    console.log('4. Testing newsletter email...');
    const newsletterResult = await sendEmail({
      to: TEST_EMAIL,
      template: 'newsletter',
      subject: 'Test Newsletter',
      data: {
        title: 'Test Newsletter',
        content: '<p>This is a <strong>test newsletter</strong> to verify the email system is working correctly.</p>',
        cta: {
          text: 'View Online',
          url: 'https://example.com',
        },
        unsubscribeUrl: `http://localhost:${process.env.PORT || 5000}/unsubscribe?email=${encodeURIComponent(TEST_EMAIL)}`,
      },
    });
    
    console.log('Newsletter email result:', newsletterResult);
    console.log(newsletterResult.success ? '✅ Newsletter email test passed\n' : '❌ Newsletter email test failed\n');
    
    // 5. Test unsubscription
    console.log('5. Testing unsubscription...');
    
    // First, ensure the email is subscribed
    await subscribeEmail(TEST_EMAIL, { source: 'website' });
    
    // Then test unsubscribing
    const unsubResult = await unsubscribeEmail(TEST_EMAIL);
    console.log('Unsubscription result:', unsubResult);
    console.log(unsubResult.success ? '✅ Unsubscription test passed\n' : '❌ Unsubscription test failed\n');
    
    // Cleanup: Remove test subscription
    const Subscription = (await import('../src/models/Subscription.js')).default;
    await Subscription.deleteOne({ email: TEST_EMAIL });
    
    console.log('=== All tests completed ===');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the tests
runTests();
