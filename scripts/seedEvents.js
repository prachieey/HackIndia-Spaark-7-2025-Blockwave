import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../src/models/Event.js';
import User from '../src/models/User.js';
import { getMongoURI } from '../src/config/database.js';

dotenv.config();

// Sample events data
const sampleEvents = [
  // Conference Events
  {
    title: "Tech Conference 2025",
    description: "Annual technology conference featuring the latest in software development, AI, and blockchain. Join industry leaders and innovators for three days of keynotes, workshops, and networking opportunities.",
    summary: "Join us for the biggest tech event of the year!",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?conference",
    gallery: [
      "https://source.unsplash.com/random/400x300/?tech",
      "https://source.unsplash.com/random/400x300/?programming",
      "https://source.unsplash.com/random/400x300/?startup"
    ],
    venue: {
      name: "Moscone Center",
      address: "747 Howard St, San Francisco, CA 94103",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94103",
      coordinates: [-122.4012, 37.7836]
    },
    isVirtual: false,
    meetingLink: "",
    startDate: new Date('2025-10-01T09:00:00+05:30'),
    endDate: new Date('2025-10-03T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1000,
    availableTickets: 1000,
    price: 25000, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard",
        price: 25000, 
        quantity: 1000,
        description: "Standard conference pass",
        salesStart: new Date('2025-09-23T00:00:00+05:30'),
        salesEnd: new Date('2025-09-30T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["tech", "conference", "blockchain", "AI"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Music Events
  {
    title: "Summer Music Festival 2025",
    description: "The biggest music festival of the year featuring top artists from around the world. Three days of non-stop music, food, and fun in the sun!",
    summary: "Experience the ultimate summer music festival with top artists!",
    category: "music",
    bannerImage: "https://source.unsplash.com/random/800x400/?music-festival",
    gallery: [
      "https://source.unsplash.com/random/400x300/?concert",
      "https://source.unsplash.com/random/400x300/?festival",
      "https://source.unsplash.com/random/400x300/?music"
    ],
    venue: {
      name: "Golden Gate Park",
      address: "Golden Gate Park, San Francisco, CA",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94122",
      coordinates: [-122.5000, 37.7694]
    },
    isVirtual: false,
    startDate: new Date('2025-10-10T12:00:00+05:30'),
    endDate: new Date('2025-10-12T23:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 10000,
    availableTickets: 10000,
    price: 25000, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "General Admission",
        price: 25000, 
        quantity: 8000,
        description: "3-day general admission pass",
        salesStart: new Date('2025-01-01T00:00:00+05:30'),
        salesEnd: new Date('2025-07-14T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "VIP Experience",
        price: 50000, 
        quantity: 2000,
        description: "VIP access with premium viewing areas and amenities",
        salesStart: new Date('2025-01-01T00:00:00+05:30'),
        salesEnd: new Date('2025-07-14T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["music", "festival", "summer", "concert"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Sports Events
  {
    title: "Marathon 2025",
    description: "Annual city marathon through the heart of downtown. Join thousands of runners in this exciting race with various categories for all skill levels.",
    summary: "Run through the city in this exciting annual marathon!",
    category: "sports",
    bannerImage: "https://source.unsplash.com/random/800x400/?marathon",
    gallery: [
      "https://source.unsplash.com/random/400x300/?running",
      "https://source.unsplash.com/random/400x300/?race",
      "https://source.unsplash.com/random/400x300/?sports"
    ],
    venue: {
      name: "City Center",
      address: "Main Street, Downtown",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94105",
      coordinates: [-122.4030, 37.7749]
    },
    isVirtual: false,
    startDate: new Date('2025-10-15T09:00:00+05:30'),
    endDate: new Date('2025-10-15T14:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 5000,
    availableTickets: 5000,
    price: 7500, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Full Marathon",
        price: 7500, 
        quantity: 2000,
        description: "42.2 km full marathon registration",
        salesStart: new Date('2025-01-01T00:00:00+05:30'),
        salesEnd: new Date('2025-09-15T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Half Marathon",
        price: 7500, 
        quantity: 2000,
        description: "21.1 km half marathon registration",
        salesStart: new Date('2025-01-01T00:00:00+05:30'),
        salesEnd: new Date('2025-09-15T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "10K Run",
        price: 4200, 
        quantity: 1000,
        description: "10 km run registration",
        salesStart: new Date('2025-01-01T00:00:00+05:30'),
        salesEnd: new Date('2025-09-15T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["sports", "marathon", "running", "fitness"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Art Events
  {
    title: "Contemporary Art Exhibition",
    description: "Experience the most innovative contemporary art from emerging and established artists around the world. This exhibition showcases paintings, sculptures, and digital art installations.",
    summary: "A stunning collection of contemporary art from around the world",
    category: "art",
    bannerImage: "https://source.unsplash.com/random/800x400/?art-exhibition",
    gallery: [
      "https://source.unsplash.com/random/400x300/?painting",
      "https://source.unsplash.com/random/400x300/?sculpture",
      "https://source.unsplash.com/random/400x300/?gallery"
    ],
    venue: {
      name: "Modern Art Museum",
      address: "151 3rd St",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94103",
      coordinates: [-122.4008, 37.7857]
    },
    isVirtual: false,
    startDate: new Date('2025-10-16T10:00:00+05:30'),
    endDate: new Date('2025-11-16T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 500,
    availableTickets: 500,
    price: 2100, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "General Admission",
        price: 2100, 
        quantity: 500,
        description: "Entry to the exhibition",
        salesStart: new Date('2026-03-23T00:00:00+05:30'),
        salesEnd: new Date('2026-05-15T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["art", "exhibition", "contemporary", "museum"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Charity Events
  {
    title: "Annual Charity Gala",
    description: "Join us for an elegant evening of dining, entertainment, and philanthropy. All proceeds will support local education initiatives and provide scholarships for underprivileged students.",
    summary: "An elegant evening of fine dining and fundraising for a great cause",
    category: "charity",
    bannerImage: "https://source.unsplash.com/random/800x400/?gala",
    gallery: [
      "https://source.unsplash.com/random/400x300/?charity",
      "https://source.unsplash.com/random/400x300/?fundraiser",
      "https://source.unsplash.com/random/400x300/?dinner"
    ],
    venue: {
      name: "Grand Ballroom",
      address: "333 O'Farrell St",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94102",
      coordinates: [-122.4074, 37.7870]
    },
    isVirtual: false,
    startDate: new Date('2026-04-05T18:00:00+05:30'),
    endDate: new Date('2026-04-05T23:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 300,
    availableTickets: 300,
    price: 12500, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Individual Ticket",
        price: 12500, 
        quantity: 200,
        description: "Entry for one person",
        salesStart: new Date('2026-01-01T00:00:00+05:30'),
        salesEnd: new Date('2026-04-04T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "VIP Table",
        price: 25000, 
        quantity: 10,
        description: "Table for 10 with premium seating",
        salesStart: new Date('2026-01-01T00:00:00+05:30'),
        salesEnd: new Date('2026-04-04T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["charity", "gala", "fundraiser", "philanthropy"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Virtual Events
  {
    title: "Blockchain & Web3 Masterclass",
    description: "Comprehensive online masterclass covering blockchain technology, smart contracts, and Web3 development. Perfect for developers and entrepreneurs looking to enter the blockchain space.",
    summary: "Learn blockchain development from industry experts in this comprehensive online masterclass",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?blockchain",
    gallery: [
      "https://source.unsplash.com/random/400x300/?blockchain",
      "https://source.unsplash.com/random/400x300/?cryptocurrency",
      "https://source.unsplash.com/random/400x300/?coding"
    ],
    venue: {
      name: "Virtual Event",
      address: "Online",
      city: "Virtual",
      state: "",
      country: "",
      postalCode: "",
      coordinates: [0, 0]
    },
    isVirtual: true,
    meetingLink: "https://meet.example.com/blockchain-masterclass",
    startDate: new Date('2026-04-08T09:00:00+05:30'),
    endDate: new Date('2026-04-08T17:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 200,
    availableTickets: 200,
    price: 14999, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Full Access",
        price: 14999, 
        quantity: 200,
        description: "Access to all sessions and materials",
        salesStart: new Date('2026-03-23T00:00:00+05:30'),
        salesEnd: new Date('2026-04-07T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["blockchain", "web3", "programming", "online"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Past Events
  {
    title: "Winter Tech Symposium 2024",
    description: "Our annual winter symposium brought together tech leaders and innovators to discuss the future of technology. This event has already taken place.",
    summary: "A look back at the 2024 Winter Tech Symposium",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?tech-conference",
    gallery: [
      "https://source.unsplash.com/random/400x300/?conference",
      "https://source.unsplash.com/random/400x300/?tech-talk",
      "https://source.unsplash.com/random/400x300/?networking"
    ],
    venue: {
      name: "Convention Center",
      address: "747 Howard St",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94103",
      coordinates: [-122.4012, 37.7836]
    },
    isVirtual: false,
    startDate: new Date('2025-10-20T09:00:00+05:30'),
    endDate: new Date('2025-10-21T17:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 800,
    availableTickets: 0,
    price: 25000, 
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "General Admission",
        price: 25000, 
        quantity: 800,
        available: 0,
        description: "Access to all sessions"
      }
    ],
    status: "completed",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["tech", "conference", "past-event"],
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-07')
  },
  
  // Free Events
  {
    title: "Community Yoga in the Park",
    description: "Join us for a free community yoga session in the park. All levels welcome! Bring your own mat and water bottle.",
    summary: "Free outdoor yoga session for all skill levels",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?yoga",
    gallery: [
      "https://source.unsplash.com/random/400x300/?yoga",
      "https://source.unsplash.com/random/400x300/?park",
      "https://source.unsplash.com/random/400x300/?meditation"
    ],
    venue: {
      name: "Golden Gate Park - Music Concourse",
      address: "Music Concourse Dr",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      postalCode: "94118",
      coordinates: [-122.4662, 37.7694]
    },
    isVirtual: false,
    startDate: new Date('2025-10-25T17:00:00+05:30'),
    endDate: new Date('2025-10-25T19:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 100,
    availableTickets: 100,
    price: 0, 
    currency: "INR",
    isFree: true,
    ticketTypes: [
      {
        name: "Free Registration",
        price: 0, 
        quantity: 100,
        description: "Registration for the yoga session",
        salesStart: new Date('2025-09-23T00:00:00+05:30'),
        salesEnd: new Date('2025-10-24T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["yoga", "fitness", "free", "outdoor"],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Add contractEventId to each event
const eventsWithIds = sampleEvents.map((event, index) => ({
  ...event,
  contractEventId: index + 1,  // Add a unique ID for each event
}));

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

// Seed the database with sample events
const seedEvents = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get an admin user to set as the organizer
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    
    console.log(`Using admin user as organizer: ${adminUser.email}`);
    
    // Add organizer to each event
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: adminUser._id,
      contractEventId: Math.floor(Math.random() * 1000000) // Generate a random ID for the contract
    }));
    
    // Clear existing events to prevent duplicates
    await Event.deleteMany({});
    console.log('Cleared existing events');
    
    // Insert events into the database with ordered: false to prevent duplicates
    const createdEvents = await Event.insertMany(eventsWithOrganizer, { ordered: false });
    
    console.log(`Successfully created ${createdEvents.length} events`);
    console.log('Sample events have been added to the database');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

// Run the seed function
seedEvents();
