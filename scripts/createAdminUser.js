import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import { getMongoURI } from '../src/config/database.js';

dotenv.config();

// Admin user data
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123', // In a real app, use a more secure password
  passwordConfirm: 'admin123', // Confirm password
  role: 'admin',
  isEmailVerified: true,
  walletAddress: '0x0000000000000000000000000000000000000000' // Default wallet address
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    console.log(`Connecting to MongoDB at: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
      return;
    }
    
    // Create the admin user with plain text password (the pre-save hook will hash it)
    const newAdmin = new User({
      name: adminUser.name,
      email: adminUser.email,
      password: adminUser.password,
      passwordConfirm: adminUser.passwordConfirm,
      role: adminUser.role,
      isEmailVerified: adminUser.isEmailVerified,
      walletAddress: adminUser.walletAddress
    });
    
    // Save the admin user (the pre-save hook will hash the password)
    await newAdmin.save({ validateBeforeSave: true });
    
    console.log('Admin user created successfully:', newAdmin.email);
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the function
createAdminUser();
