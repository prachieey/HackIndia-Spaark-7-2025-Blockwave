import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../src/models/User.js';

dotenv.config({ path: '.env' });

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scantyx-dev');
    console.log('Connected to MongoDB...');

    // Find the admin user
    const admin = await User.findOne({ email: 'admin@scantyx.com' });
    
    if (!admin) {
      console.log('Admin user not found. Creating a new admin user...');
      
      const password = 'admin123';
      const adminData = {
        name: 'Scantyx Admin',
        email: 'admin@scantyx.com',
        password: password,
        passwordConfirm: password,
        role: 'admin',
        walletAddress: '0x' + crypto.randomBytes(20).toString('hex'),
        isEmailVerified: true,
        active: true
      };
      
      const newAdmin = new User(adminData);
      await newAdmin.save({ validateBeforeSave: true });
      console.log('New admin user created successfully!');
    } else {
      // Reset password to 'admin123'
      const newPassword = 'admin123';
      admin.password = newPassword;
      admin.passwordConfirm = newPassword;
      admin.passwordChangedAt = Date.now() - 1000; // Set to 1 second ago
      
      // This will trigger the pre-save middleware to hash the password
      await admin.save();
      console.log('Admin password has been reset to: admin123');
    }
    
    console.log('\nAdmin login details:');
    console.log('Email: admin@scantyx.com');
    console.log('Password: admin123');
    console.log('\nIMPORTANT: Change this password after logging in!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();
