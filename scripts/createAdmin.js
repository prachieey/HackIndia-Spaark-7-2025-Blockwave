import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

dotenv.config({ path: '.env' });

const createAdmin = async () => {
  try {
    // Connect to local MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/scantyx-dev');
    console.log('Connected to local MongoDB...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@scantyx.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const password = 'admin123'; // Default password, should be changed after first login
    const adminData = {
      name: 'Scantyx Admin',
      email: 'admin@scantyx.com',
      password: password,
      passwordConfirm: password,
      role: 'admin',
      walletAddress: '0x0000000000000000000000000000000000000000', // Default wallet, should be updated
      isEmailVerified: true,
      active: true
    };

    // Create and save admin user - the pre-save middleware will handle password hashing
    const admin = new User(adminData);
    await admin.save({ validateBeforeSave: true });
    
    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: admin123');
    console.log('IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
