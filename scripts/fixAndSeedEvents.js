import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../src/models/Event.js';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/scantyx-dev';
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Sample future events data
const futureEvents = [
  {
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year with top industry speakers.',
    summary: 'Annual tech conference with workshops and networking',
    category: 'conference',
    bannerImage: 'https://source.unsplash.com/random/800x400/?tech-conference',
    gallery: [
      'https://source.unsplash.com/random/400x300/?conference',
      'https://source.unsplash.com/random/400x300/?workshop',
      'https://source.unsplash.com/random/400x300/?networking'
    ],
    venue: {
      name: 'Convention Center',
      address: '123 Tech Street',
      city: 'Bangalore',
      country: 'India',
      coordinates: [77.5946, 12.9716], // Bangalore coordinates
      isVirtual: false
    },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
    timezone: 'Asia/Kolkata',
    ticketTypes: [
      {
        name: 'General Admission',
        description: 'Access to all conference sessions',
        price: 0.1,  // In ETH
        currency: 'ETH',
        quantity: 500,
        sold: 0,
        isActive: true,
        perks: ['Access to all sessions', 'Lunch included', 'Conference swag']
      }
    ],
    tags: ['tech', 'conference', 'networking'],
    status: 'upcoming'
  },
  // Add more events as needed
];

// Fix and seed events
const fixAndSeedEvents = async () => {
  try {
    await connectDB();
    
    // Get admin user as organizer
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      throw new Error('Admin user not found. Please seed users first.');
    }
    
    // Delete all existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');
    
    // Create new events
    const events = await Promise.all(
      futureEvents.map(async (eventData) => {
        // Set admin as the organizer
        const event = new Event({
          ...eventData,
          organizer: admin._id,
          contractEventId: Math.floor(100000 + Math.random() * 900000) // Random 6-digit ID
        });
        
        await event.save();
        return event;
      })
    );
    
    console.log(`Successfully created ${events.length} events`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing and seeding events:', error);
    process.exit(1);
  }
};

// Run the function
fixAndSeedEvents();
