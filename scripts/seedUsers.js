import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';
import Event from '../src/models/Event.js';
import Ticket from '../src/models/Ticket.js';
import { getMongoURI } from '../src/config/database.js';

dotenv.config();

// Sample user data
const sampleUsers = [
  // Admin user
  {
    name: 'Admin User',
    email: 'admin@example.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    password: 'admin123',
    passwordConfirm: 'admin123',
    role: 'admin',
    phone: '+919876543210',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    isEmailVerified: true
  },
  // Organizers
  {
    name: 'Tech Events India',
    email: 'organizer@techevents.in',
    walletAddress: '0x2345678901abcdef1234567890abcdef12345679',
    password: 'organizer123',
    passwordConfirm: 'organizer123',
    role: 'organizer',
    phone: '+919876543211',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    isEmailVerified: true
  },
  {
    name: 'Music Festival Org',
    email: 'music@festivals.org',
    walletAddress: '0x3456789012abcdef1234567890abcdef1234567a',
    password: 'music1234',
    passwordConfirm: 'music1234',
    role: 'organizer',
    phone: '+919876543212',
    profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    isEmailVerified: true
  },
  // Regular users
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    walletAddress: '0x4567890123abcdef1234567890abcdef1234567b',
    password: 'rahul1234',
    passwordConfirm: 'rahul1234',
    role: 'user',
    phone: '+919876543213',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    isEmailVerified: true
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    walletAddress: '0x5678901234abcdef1234567890abcdef1234567c',
    password: 'priya1234',
    passwordConfirm: 'priya1234',
    role: 'user',
    phone: '+919876543214',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    isEmailVerified: true
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    walletAddress: '0x6789012345abcdef1234567890abcdef1234567d',
    password: 'amit12345',
    passwordConfirm: 'amit12345',
    role: 'user',
    phone: '+919876543215',
    profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
    isEmailVerified: true
  },
  {
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    walletAddress: '0x7890123456abcdef1234567890abcdef1234567e',
    password: 'ananya123',
    passwordConfirm: 'ananya123',
    role: 'user',
    phone: '+919876543216',
    profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
    isEmailVerified: true
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    walletAddress: '0x8901234567abcdef1234567890abcdef1234567f',
    password: 'vikram123',
    passwordConfirm: 'vikram123',
    role: 'user',
    phone: '+919876543217',
    profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    isEmailVerified: true
  },
  {
    name: 'Neha Reddy',
    email: 'neha.reddy@example.com',
    walletAddress: '0x9012345678abcdef1234567890abcdef12345680',
    password: 'neha12345',
    passwordConfirm: 'neha12345',
    role: 'user',
    phone: '+919876543218',
    profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
    isEmailVerified: true
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@example.com',
    walletAddress: '0x0123456789abcdef1234567890abcdef12345681',
    password: 'arjun1234',
    passwordConfirm: 'arjun1234',
    role: 'user',
    phone: '+919876543219',
    profileImage: 'https://randomuser.me/api/portraits/men/6.jpg',
    isEmailVerified: true
  },
  {
    name: 'Divya Nair',
    email: 'divya.nair@example.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345682',
    password: 'divya1234',
    passwordConfirm: 'divya1234',
    role: 'user',
    phone: '+919876543220',
    profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
    isEmailVerified: true
  },
  {
    name: 'Ravi Verma',
    email: 'ravi.verma@example.com',
    walletAddress: '0x2345678901abcdef1234567890abcdef12345683',
    password: 'ravi12345',
    passwordConfirm: 'ravi12345',
    role: 'user',
    phone: '+919876543221',
    profileImage: 'https://randomuser.me/api/portraits/men/7.jpg',
    isEmailVerified: true
  },
  {
    name: 'Sneha Iyer',
    email: 'sneha.iyer@example.com',
    walletAddress: '0x3456789012abcdef1234567890abcdef12345684',
    password: 'sneha1234',
    passwordConfirm: 'sneha1234',
    role: 'user',
    phone: '+919876543222',
    profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
    isEmailVerified: true
  },
  {
    name: 'Karthik Nair',
    email: 'karthik.nair@example.com',
    walletAddress: '0x4567890123abcdef1234567890abcdef12345685',
    password: 'karthik12',
    passwordConfirm: 'karthik12',
    role: 'user',
    phone: '+919876543223',
    profileImage: 'https://randomuser.me/api/portraits/men/8.jpg',
    isEmailVerified: true
  },
  {
    name: 'Meera Krishnan',
    email: 'meera.k@example.com',
    walletAddress: '0x5678901234abcdef1234567890abcdef12345686',
    password: 'meera1234',
    passwordConfirm: 'meera1234',
    role: 'user',
    phone: '+919876543224',
    profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
    isEmailVerified: true
  }
];

// Sample ticket data for purchases
const createSampleTickets = async (users, events) => {
  const tickets = [];
  const statuses = ['active', 'active', 'active', 'used', 'transferred'];
  const ticketTypes = [
    { name: 'Standard', price: 1000, currency: 'INR' },
    { name: 'VIP', price: 2500, currency: 'INR' },
    { name: 'Early Bird', price: 750, currency: 'INR' },
    { name: 'Group', price: 800, currency: 'INR' },
    { name: 'Student', price: 500, currency: 'INR' }
  ];

  // Create tickets for each user (skip admin and organizers)
  for (let i = 3; i < users.length; i++) {
    const user = users[i];
    const numTickets = Math.floor(Math.random() * 5) + 1; // 1-5 tickets per user
    
    for (let j = 0; j < numTickets; j++) {
      // Pick a random event
      const event = events[Math.floor(Math.random() * events.length)];
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate a random token ID (in a real app, this would be from the blockchain)
      const tokenId = `tkt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      const ticket = new Ticket({
        tokenId,
        contractAddress: '0x' + '0'.repeat(40), // Placeholder for contract address
        transactionHash: '0x' + '0'.repeat(64), // Placeholder for transaction hash
        event: event._id,
        ticketType,
        owner: user._id,
        ownerWallet: user.walletAddress,
        attendee: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        status,
        isVerified: status === 'used',
        verifiedAt: status === 'used' ? new Date() : null,
        isTransferable: true,
        transferHistory: [],
        metadata: {
          purchaseDate: new Date(),
          purchasePrice: ticketType.price,
          currency: ticketType.currency
        }
      });
      
      tickets.push(ticket);
      
      // Add ticket to user's tickets array
      user.tickets.push(ticket._id);
      
      // Add event to user's events if not already there
      if (!user.events.includes(event._id)) {
        user.events.push(event._id);
      }
      
      // Update event's available tickets
      event.availableTickets = Math.max(0, event.availableTickets - 1);
    }
  }
  
  return tickets;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = getMongoURI();
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed the database with sample users and tickets
const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing users and tickets...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    
    // Get all events
    const events = await Event.find({});
    if (events.length === 0) {
      console.error('No events found. Please seed events first.');
      process.exit(1);
    }
    
    console.log('Creating users...');
    // Create users with hashed passwords
    const createdUsers = [];
    for (const user of sampleUsers) {
      // Create the user with the plain password first (validation will hash it)
      const newUser = new User({
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        password: user.password, // Plain password
        passwordConfirm: user.password, // Same as password for validation
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified
      });
      
      // Save the user (the pre-save hook will hash the password)
      await newUser.save();
      createdUsers.push(newUser);
    }
    
    console.log('Creating tickets...');
    // Create tickets and update users with ticket references
    const tickets = await createSampleTickets(createdUsers, events);
    await Ticket.insertMany(tickets);
    
    // Save users with updated ticket references
    for (const user of createdUsers) {
      if (user.tickets.length > 0 || user.events.length > 0) {
        await user.save();
      }
    }
    
    // Update events with new availableTickets
    for (const event of events) {
      await event.save();
    }
    
    console.log('Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${tickets.length} tickets`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
