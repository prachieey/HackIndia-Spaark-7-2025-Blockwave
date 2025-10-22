import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config({ path: '.env' });

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scantyx-dev');
    console.log('Connected to MongoDB...');

    // Find the admin user
    const adminEmail = 'admin@scantyx.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('Admin user not found. Creating admin user...');
      adminUser = new User({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
        active: true
      });
      await adminUser.save();
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user found:', {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        isEmailVerified: adminUser.isEmailVerified,
        active: adminUser.active
      });

      // Update role to admin if not already set
      if (adminUser.role !== 'admin') {
        console.log('Updating user role to admin...');
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('User role updated to admin.');
      }
    }

    console.log('Admin check completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdminUser();
