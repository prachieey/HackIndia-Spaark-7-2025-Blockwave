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

// Sample future events data with diverse event types
const futureEvents = [
  {
    title: 'Tech Conference 2025',
    description: 'The biggest tech conference of the year featuring industry leaders, hands-on workshops, and networking opportunities. Join us for three days of innovation and learning.',
    summary: 'Annual tech conference with workshops and networking',
    category: 'conference',
    bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f96d5538?ixlib=rb-4.0.3',
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?ixlib=rb-4.0.3'
    ],
    venue: {
      name: 'Bangalore International Convention Center',
      address: 'NH 44, Devanahalli',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      coordinates: [77.7049, 13.1986],
      isVirtual: false
    },
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    timezone: 'Asia/Kolkata',
    ticketTypes: [
      {
        name: 'Early Bird',
        description: 'Access to all conference sessions and workshops',
        price: 0.05,  // In ETH
        currency: 'ETH',
        quantity: 200,
        sold: 0,
        isActive: true,
        perks: ['All conference sessions', 'Workshop access', 'Lunch included', 'Conference swag']
      },
      {
        name: 'Standard',
        description: 'Standard conference access',
        price: 0.1,  // In ETH
        currency: 'ETH',
        quantity: 500,
        sold: 0,
        isActive: true,
        perks: ['All conference sessions', 'Lunch included']
      },
      {
        name: 'VIP',
        description: 'VIP access with premium benefits',
        price: 0.25,  // In ETH
        currency: 'ETH',
        quantity: 50,
        sold: 0,
        isActive: true,
        perks: ['VIP seating', 'Backstage access', 'Networking dinner', 'All conference sessions', 'Workshops', 'Premium swag']
      }
    ],
    tags: ['technology', 'conference', 'networking', 'workshop', 'blockchain'],
    status: 'upcoming',
    socialLinks: {
      website: 'https://techconf2025.example.com',
      twitter: 'techconf2025',
      instagram: 'techconf2025',
      linkedin: 'company/techconf2025'
    },
    maxAttendees: 1000,
    isPrivate: false,
    registrationDeadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000) // 6 days from now
  },
  {
    title: 'Blockchain Hackathon',
    description: 'A 48-hour hackathon where developers will build decentralized applications on various blockchains. Prizes worth $50,000!',
    summary: 'Build the future of decentralized applications',
    category: 'hackathon',
    bannerImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3',
    gallery: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3'
    ],
    venue: {
      name: 'Innovation Hub',
      address: '456 Tech Park',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      coordinates: [78.4867, 17.3850],
      isVirtual: false
    },
    startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
    timezone: 'Asia/Kolkata',
    ticketTypes: [
      {
        name: 'Hacker Pass',
        description: 'Access to hackathon with meals and swag',
        price: 0.02,  // In ETH
        currency: 'ETH',
        quantity: 300,
        sold: 0,
        isActive: true,
        perks: ['Meals included', 'Swag pack', 'Mentorship']
      },
      {
        name: 'Free Pass',
        description: 'Basic access to the event',
        price: 0,  // Free
        currency: 'ETH',
        quantity: 100,
        sold: 0,
        isActive: true,
        perks: ['Basic access', 'No meals included']
      }
    ],
    tags: ['blockchain', 'hackathon', 'web3', 'coding', 'ethereum', 'solana'],
    status: 'upcoming',
    maxAttendees: 400,
    isPrivate: false,
    registrationDeadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) // 12 days from now
  },
  {
    title: 'Virtual Web3 Summit',
    description: 'A fully virtual conference exploring the latest in Web3, DeFi, and the decentralized web. Join us from anywhere in the world!',
    summary: 'Global virtual summit on Web3 and decentralized technologies',
    category: 'virtual',
    bannerImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3',
    gallery: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1621784563286-5d0b608a06ab?ixlib=rb-4.0.3'
    ],
    venue: {
      name: 'Online Event',
      isVirtual: true,
      virtualEventUrl: 'https://web3summit.live',
      platform: 'Zoom & Discord'
    },
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    timezone: 'UTC',
    ticketTypes: [
      {
        name: 'General Admission',
        description: 'Access to all virtual sessions',
        price: 0.02,  // In ETH
        currency: 'ETH',
        quantity: 1000,
        sold: 0,
        isActive: true,
        perks: ['Access to all sessions', 'Virtual networking', 'Digital swag']
      },
      {
        name: 'Premium Pass',
        description: 'Premium access with exclusive content',
        price: 0.05,  // In ETH
        currency: 'ETH',
        quantity: 200,
        sold: 0,
        isActive: true,
        perks: ['Exclusive workshops', '1:1 with speakers', 'Premium content', 'Digital swag pack']
      }
    ],
    tags: ['web3', 'virtual', 'defi', 'blockchain', 'online', 'nft'],
    status: 'upcoming',
    maxAttendees: 1200,
    isPrivate: false,
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  }
];

/**
 * Fix and seed events with comprehensive data
 * This function will:
 * 1. Connect to the database
 * 2. Clear existing events
 * 3. Create new sample events
 * 4. Handle errors appropriately
 */
const fixAndSeedEvents = async () => {
  console.log('Starting event seeding process...');
  
  try {
    // Connect to database
    await connectDB();
    
    // Get admin user as organizer
    console.log('Fetching admin user...');
    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      throw new Error('❌ Admin user not found. Please ensure you have seeded users first.');
    }
    
    // Delete all existing events
    console.log('Clearing existing events...');
    const deleteResult = await Event.deleteMany({});
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing events`);
    
    // Create new events
    console.log('Creating new events...');
    const events = await Promise.all(
      futureEvents.map(async (eventData, index) => {
        try {
          const event = new Event({
            ...eventData,
            organizer: admin._id,
            contractEventId: Math.floor(100000 + Math.random() * 900000), // Random 6-digit ID
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          await event.save();
          console.log(`✅ Created event: ${event.title}`);
          return event;
        } catch (error) {
          console.error(`❌ Error creating event ${eventData.title}:`, error.message);
          return null;
        }
      })
    );
    
    // Filter out any failed event creations
    const successfulEvents = events.filter(event => event !== null);
    
    console.log(`\n🎉 Successfully created ${successfulEvents.length} out of ${futureEvents.length} events`);
    
    // Log event details
    console.log('\n📋 Created Events:');
    successfulEvents.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Date: ${event.startDate.toLocaleDateString()} - ${event.endDate.toLocaleDateString()}`);
      console.log(`   Tickets: ${event.ticketTypes.map(t => `\n     - ${t.name}: ${t.quantity} available at ${t.price} ${t.currency}`).join('')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing and seeding events:', error);
    process.exit(1);
  }
};

// Run the function
fixAndSeedEvents();
