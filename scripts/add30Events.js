import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from '../src/models/Event.js';
import User from '../src/models/User.js';
import { getMongoURI } from '../src/config/database.js';

dotenv.config();

// Helper function to get a random date within a range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Sample events data
const events = [
  // Music Events
  {
    title: "Global Music Festival 2025",
    description: "Experience the most diverse music festival of the year with artists from over 30 countries. Five stages featuring EDM, rock, pop, and world music.",
    summary: "A 3-day international music extravaganza with top global artists",
    category: "music",
    bannerImage: "https://source.unsplash.com/random/800x400/?music-festival",
    gallery: [
      "https://source.unsplash.com/random/400x300/?concert",
      "https://source.unsplash.com/random/400x300/?music-stage",
      "https://source.unsplash.com/random/400x300/?crowd"
    ],
    venue: {
      name: "Sunset Beach",
      address: "Beach Road, Goa",
      city: "Goa",
      state: "Goa",
      country: "India",
      postalCode: "403515",
      coordinates: [73.8278, 15.4909]
    },
    isVirtual: false,
    startDate: new Date('2025-01-15T16:00:00+05:30'),
    endDate: new Date('2025-01-18T23:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 20000,
    availableTickets: 20000,
    price: 5000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "3-Day Pass",
        price: 12000,
        quantity: 10000,
        description: "Access to all 3 days of the festival",
        salesStart: new Date('2024-11-01T00:00:00+05:30'),
        salesEnd: new Date('2025-01-10T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Single Day Pass",
        price: 5000,
        quantity: 10000,
        description: "Access for one day of the festival",
        salesStart: new Date('2024-11-01T00:00:00+05:30'),
        salesEnd: new Date('2025-01-14T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["music", "festival", "live-music", "goa"],
    isPublished: true
  },

  // Tech Conference
  {
    title: "AI & Blockchain Summit 2025",
    description: "Join industry leaders in AI and Blockchain for a 2-day summit featuring keynotes, workshops, and networking opportunities. Learn about the latest advancements and network with professionals.",
    summary: "Premier conference on AI and Blockchain technologies",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?blockchain",
    gallery: [
      "https://source.unsplash.com/random/400x300/?ai",
      "https://source.unsplash.com/random/400x300/?blockchain",
      "https://source.unsplash.com/random/400x300/?tech-conference"
    ],
    venue: {
      name: "Taj Palace",
      address: "Sardar Patel Marg, Diplomatic Enclave",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110021",
      coordinates: [77.1861, 28.5965]
    },
    isVirtual: true,
    meetingLink: "https://meet.tech/summit2025",
    startDate: new Date('2025-02-20T09:00:00+05:30'),
    endDate: new Date('2025-02-21T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1000,
    availableTickets: 1000,
    price: 15000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard Pass",
        price: 15000,
        quantity: 800,
        description: "Access to all sessions and workshops",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-02-15T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Student Pass",
        price: 7500,
        quantity: 200,
        description: "Discounted pass for students with valid ID",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-02-15T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["ai", "blockchain", "technology", "conference"],
    isPublished: true
  },

  // Art Exhibition
  {
    title: "Contemporary Art Biennale 2025",
    description: "Experience the largest contemporary art exhibition in South Asia, featuring works from over 200 artists across the globe. The event includes live art installations, interactive exhibits, and artist talks.",
    summary: "Biennial contemporary art exhibition featuring global artists",
    category: "art",
    bannerImage: "https://source.unsplash.com/random/800x400/?art-exhibition",
    gallery: [
      "https://source.unsplash.com/random/400x300/?modern-art",
      "https://source.unsplash.com/random/400x300/?sculpture",
      "https://source.unsplash.com/random/400x300/?gallery"
    ],
    venue: {
      name: "National Gallery of Modern Art",
      address: "Manikyavu, Palace Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560052",
      coordinates: [77.5946, 12.9986]
    },
    isVirtual: false,
    startDate: new Date('2025-03-01T10:00:00+05:30'),
    endDate: new Date('2025-04-30T20:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 5000,
    availableTickets: 5000,
    price: 1000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "General Admission",
        price: 1000,
        quantity: 4500,
        description: "One-time entry to the exhibition",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-04-30T18:00:00+05:30'),
        isActive: true
      },
      {
        name: "Season Pass",
        price: 3000,
        quantity: 500,
        description: "Unlimited entry for the entire duration",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-04-25T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["art", "exhibition", "contemporary-art", "biennale"],
    isPublished: true
  },

  // Sports Event
  {
    title: "Mumbai Marathon 2025",
    description: "Join thousands of runners in India's premier marathon event. Choose from Full Marathon, Half Marathon, or 10K categories. The route showcases Mumbai's iconic landmarks including Marine Drive and Gateway of India.",
    summary: "Annual marathon through the heart of Mumbai",
    category: "sports",
    bannerImage: "https://source.unsplash.com/random/800x400/?marathon",
    gallery: [
      "https://source.unsplash.com/random/400x300/?running",
      "https://source.unsplash.com/random/400x300/?mumbai",
      "https://source.unsplash.com/random/400x300/?race"
    ],
    venue: {
      name: "Chhatrapati Shivaji Maharaj Terminus",
      address: "Chhatrapati Shivaji Terminus Area, Fort",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
      coordinates: [72.8359, 18.9401]
    },
    isVirtual: false,
    startDate: new Date('2025-01-19T05:00:00+05:30'),
    endDate: new Date('2025-01-19T14:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 50000,
    availableTickets: 50000,
    price: 2500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Full Marathon",
        price: 2500,
        quantity: 20000,
        description: "42.195 km full marathon",
        salesStart: new Date('2024-10-01T00:00:00+05:30'),
        salesEnd: new Date('2025-01-10T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Half Marathon",
        price: 2000,
        quantity: 20000,
        description: "21.0975 km half marathon",
        salesStart: new Date('2024-10-01T00:00:00+05:30'),
        salesEnd: new Date('2025-01-10T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "10K Run",
        price: 1500,
        quantity: 10000,
        description: "10 km run",
        salesStart: new Date('2024-10-01T00:00:00+05:30'),
        salesEnd: new Date('2025-01-10T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["marathon", "running", "sports", "mumbai"],
    isPublished: true
  },

  // Charity Gala
  {
    title: "Hope for Children Gala Dinner 2025",
    description: "An elegant evening of fine dining, entertainment, and philanthropy to support underprivileged children's education. The event includes a silent auction, live performances, and inspiring stories of impact.",
    summary: "Black-tie fundraising gala for children's education",
    category: "charity",
    bannerImage: "https://source.unsplash.com/random/800x400/?gala",
    gallery: [
      "https://source.unsplash.com/random/400x300/?fundraiser",
      "https://source.unsplash.com/random/400x300/?charity",
      "https://source.unsplash.com/random/400x300/?dinner"
    ],
    venue: {
      name: "The Leela Palace",
      address: "Airport Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560008",
      coordinates: [77.6401, 12.9619]
    },
    isVirtual: false,
    startDate: new Date('2025-02-14T19:00:00+05:30'),
    endDate: new Date('2025-02-15T00:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 300,
    availableTickets: 300,
    price: 25000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Individual Ticket",
        price: 25000,
        quantity: 250,
        description: "Admission for one person",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-02-10T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Table of 10",
        price: 200000,
        quantity: 5,
        description: "Reserved table for 10 guests",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-02-10T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    organizer: null,
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["charity", "fundraiser", "gala", "philanthropy"],
    isPublished: true
  },
  // Tech & Startup Events
  {
    title: "Startup India Innovation Summit 2025",
    description: "Annual gathering of India's most promising startups and investors. Featuring pitch sessions, workshops, and networking opportunities with industry leaders and venture capitalists.",
    summary: "India's premier startup conference connecting entrepreneurs with investors",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?startup",
    gallery: [
      "https://source.unsplash.com/random/400x300/?entrepreneur",
      "https://source.unsplash.com/random/400x300/?pitching",
      "https://source.unsplash.com/random/400x300/?networking"
    ],
    venue: {
      name: "Bombay Exhibition Centre",
      address: "NSE Complex, Goregaon East",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400063",
      coordinates: [72.8699, 19.1394]
    },
    isVirtual: false,
    startDate: new Date('2025-04-10T09:00:00+05:30'),
    endDate: new Date('2025-04-12T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 3000,
    availableTickets: 3000,
    price: 15000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard Pass",
        price: 15000,
        quantity: 2500,
        description: "Access to all sessions and expo",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-04-05T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Student Pass",
        price: 7500,
        quantity: 500,
        description: "Discounted pass for students with valid ID",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-04-05T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["startup", "entrepreneurship", "investment", "networking"],
    isPublished: true
  },
  
  // Add 24 more events with similar structure...
  // [Previous events 1-5 remain the same]
  
  // Event 6
  {
    title: "Yoga & Wellness Retreat",
    description: "A 5-day rejuvenating retreat in the Himalayas focusing on yoga, meditation, and holistic wellness. Includes accommodation, meals, and daily sessions with renowned yoga gurus.",
    summary: "Transformative wellness retreat in the Himalayas",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?yoga",
    gallery: [
      "https://source.unsplash.com/random/400x300/?meditation",
      "https://source.unsplash.com/random/400x300/?himalayas",
      "https://source.unsplash.com/random/400x300/?wellness"
    ],
    venue: {
      name: "Himalayan Yoga Retreat Center",
      address: "Near Triund, McLeod Ganj",
      city: "Dharamshala",
      state: "Himachal Pradesh",
      country: "India",
      postalCode: "176219",
      coordinates: [76.3204, 32.2389]
    },
    isVirtual: false,
    startDate: new Date('2025-05-15T06:00:00+05:30'),
    endDate: new Date('2025-05-20T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 50,
    availableTickets: 50,
    price: 35000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Single Occupancy",
        price: 45000,
        quantity: 20,
        description: "Private room with attached bathroom",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-05-01T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Double Occupancy",
        price: 35000,
        quantity: 30,
        description: "Shared room with another participant",
        salesStart: new Date('2024-12-01T00:00:00+05:30'),
        salesEnd: new Date('2025-05-01T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["yoga", "wellness", "retreat", "meditation"],
    isPublished: true
  },
  
  // Event 7
  {
    title: "Indian Premier League 2025 - Opening Ceremony",
    description: "Spectacular opening ceremony of IPL 2025 featuring live performances by top Bollywood and international artists, followed by the first match of the season.",
    summary: "Grand opening ceremony of IPL 2025 with live performances",
    category: "sports",
    bannerImage: "https://source.unsplash.com/random/800x400/?cricket",
    gallery: [
      "https://source.unsplash.com/random/400x300/?stadium",
      "https://source.unsplash.com/random/400x300/?cricket-match",
      "https://source.unsplash.com/random/400x300/?concert"
    ],
    venue: {
      name: "Narendra Modi Stadium",
      address: "Sardar Patel Sports Enclave, Motera",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      postalCode: "380016",
      coordinates: [72.5000, 23.0759]
    },
    isVirtual: false,
    startDate: new Date('2025-03-22T18:30:00+05:30'),
    endDate: new Date('2025-03-23T00:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 132000,
    availableTickets: 100000,
    price: 5000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "General Stand",
        price: 5000,
        quantity: 80000,
        description: "General seating in the stadium",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-03-15T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Premium Stand",
        price: 15000,
        quantity: 15000,
        description: "Premium seating with better views",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-03-15T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "VIP Box",
        price: 50000,
        quantity: 5000,
        description: "Luxury box seating with catering",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-03-15T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["cricket", "ipl", "sports", "concert"],
    isPublished: true
  },
  
  // [Previous events 1-7 remain, events 8-30 would be added here with similar structure]
  
  // Event 8
  {
    title: "Web3 Developer Bootcamp",
    description: "Intensive 3-day bootcamp for developers looking to build on blockchain. Hands-on workshops on Solidity, smart contracts, and dApp development.",
    summary: "Comprehensive blockchain development training",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?blockchain",
    gallery: [
      "https://source.unsplash.com/random/400x300/?coding",
      "https://source.unsplash.com/random/400x300/?ethereum",
      "https://source.unsplash.com/random/400x300/?workshop"
    ],
    venue: {
      name: "Tech Hub Bangalore",
      address: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560095",
      coordinates: [77.6245, 12.9352]
    },
    isVirtual: true,
    meetingLink: "https://meet.tech/web3bootcamp",
    startDate: new Date('2025-04-05T10:00:00+05:30'),
    endDate: new Date('2025-04-07T17:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 500,
    availableTickets: 500,
    price: 15000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard Pass",
        price: 15000,
        quantity: 400,
        description: "Access to all workshops and materials",
        salesStart: new Date('2025-01-10T00:00:00+05:30'),
        salesEnd: new Date('2025-04-01T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Early Bird",
        price: 10000,
        quantity: 100,
        description: "Early registration discount",
        salesStart: new Date('2025-01-10T00:00:00+05:30'),
        salesEnd: new Date('2025-02-28T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["blockchain", "web3", "development", "coding"],
    isPublished: true
  },
  
  // Event 9: Food Festival
  {
    title: "Indian Street Food Festival",
    description: "A culinary journey through India's diverse street food culture. Taste authentic dishes from different states, live cooking demonstrations, and food competitions.",
    summary: "Celebration of India's vibrant street food culture",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?street-food",
    gallery: [
      "https://source.unsplash.com/random/400x300/?indian-food",
      "https://source.unsplash.com/random/400x300/?spices",
      "https://source.unsplash.com/random/400x300/?food-festival"
    ],
    venue: {
      name: "Jawaharlal Nehru Stadium",
      address: "Lodhi Road",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110003",
      coordinates: [77.2376, 28.5839]
    },
    isVirtual: false,
    startDate: new Date('2025-05-01T11:00:00+05:30'),
    endDate: new Date('2025-05-03T23:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 10000,
    availableTickets: 10000,
    price: 1000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Single Day Pass",
        price: 1000,
        quantity: 8000,
        description: "Entry for one day",
        salesStart: new Date('2025-03-01T00:00:00+05:30'),
        salesEnd: new Date('2025-04-30T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Three Day Pass",
        price: 2500,
        quantity: 2000,
        description: "Entry for all three days",
        salesStart: new Date('2025-03-01T00:00:00+05:30'),
        salesEnd: new Date('2025-04-30T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["food", "festival", "culinary", "delhi"],
    isPublished: true
  },
  
  // Event 10: Tech Conference
  {
    title: "Future of AI Conference 2025",
    description: "Explore the latest advancements in Artificial Intelligence with industry leaders, researchers, and practitioners. Keynotes, workshops, and networking sessions.",
    summary: "Premier AI conference showcasing cutting-edge research and applications",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?artificial-intelligence",
    gallery: [
      "https://source.unsplash.com/random/400x300/?ai-robots",
      "https://source.unsplash.com/random/400x300/?machine-learning",
      "https://source.unsplash.com/random/400x300/?tech-conference"
    ],
    venue: {
      name: "Hyderabad International Convention Centre",
      address: "Izzathnagar",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      postalCode: "500032",
      coordinates: [78.3287, 17.4126]
    },
    isVirtual: true,
    meetingLink: "https://meet.tech/ai2025",
    startDate: new Date('2025-06-15T09:00:00+05:30'),
    endDate: new Date('2025-06-17T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2000,
    availableTickets: 2000,
    price: 20000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard Pass",
        price: 20000,
        quantity: 1500,
        description: "Access to all sessions and expo",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-06-10T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "Student Pass",
        price: 10000,
        quantity: 500,
        description: "Discounted pass for students with valid ID",
        salesStart: new Date('2025-01-15T00:00:00+05:30'),
        salesEnd: new Date('2025-06-10T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["ai", "artificial-intelligence", "tech", "conference"],
    isPublished: true
  },
  
  // Event 11: Kolkata Literature Festival
  {
    title: "Kolkata Literature Festival 2025",
    description: "A 3-day festival celebrating literature with author talks, panel discussions, and book signings. Engage with authors from India and abroad.",
    summary: "Annual literature festival in Kolkata",
    category: "conference",
    bannerImage: "https://source.unsplash.com/random/800x400/?books",
    gallery: [
      "https://source.unsplash.com/random/400x300/?reading",
      "https://source.unsplash.com/random/400x300/?author",
      "https://source.unsplash.com/random/400x300/?book-fair"
    ],
    venue: {
      name: "Science City, Kolkata",
      address: "JBS Haldane Avenue",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      postalCode: "700046",
      coordinates: [88.3648, 22.5726]
    },
    isVirtual: false,
    startDate: new Date('2025-02-25T10:00:00+05:30'),
    endDate: new Date('2025-02-27T18:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2000,
    availableTickets: 2000,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "General", 
        price: 2000, 
        quantity: 1500, 
        description: "Full festival access", 
        salesStart: new Date('2024-12-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-02-20T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "Student Pass", 
        price: 1000, 
        quantity: 500, 
        description: "Valid student ID required", 
        salesStart: new Date('2024-12-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-02-20T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["literature", "books", "festival", "kolkata"],
    isPublished: true
  },

  // Event 12: Jaipur International Film Festival
  {
    title: "Jaipur International Film Festival 2025",
    description: "Showcasing the best of international cinema with screenings, awards, and panel discussions with filmmakers and actors.",
    summary: "Annual international film festival in Jaipur",
    category: "art",
    bannerImage: "https://source.unsplash.com/random/800x400/?film-festival",
    gallery: [
      "https://source.unsplash.com/random/400x300/?movie",
      "https://source.unsplash.com/random/400x300/?cinema",
      "https://source.unsplash.com/random/400x300/?screening"
    ],
    venue: {
      name: "Jaipur International Convention Centre",
      address: "MI Road",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      postalCode: "302001",
      coordinates: [75.7873, 26.9124]
    },
    isVirtual: false,
    startDate: new Date('2025-03-10T09:00:00+05:30'),
    endDate: new Date('2025-03-15T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 3000,
    availableTickets: 3000,
    price: 1500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "All Access Pass", 
        price: 5000, 
        quantity: 500, 
        description: "Full festival access", 
        salesStart: new Date('2024-12-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-03-05T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "Single Screening", 
        price: 1500, 
        quantity: 2500, 
        description: "Entry for one film", 
        salesStart: new Date('2024-12-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-03-05T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["film", "festival", "jaipur", "cinema"],
    isPublished: true
  },

  // Event 13: Delhi Fashion Week
  {
    title: "Delhi Fashion Week 2025",
    description: "Premier fashion event showcasing upcoming and established designers. Runway shows, exhibitions, and designer meet-and-greet sessions.",
    summary: "Annual fashion week in Delhi",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?fashion",
    gallery: [
      "https://source.unsplash.com/random/400x300/?runway",
      "https://source.unsplash.com/random/400x300/?designer",
      "https://source.unsplash.com/random/400x300/?models"
    ],
    venue: {
      name: "NSIC Exhibition Complex",
      address: "Okhla Industrial Estate",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110020",
      coordinates: [77.2775, 28.5533]
    },
    isVirtual: false,
    startDate: new Date('2025-04-05T10:00:00+05:30'),
    endDate: new Date('2025-04-10T20:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2500,
    availableTickets: 2500,
    price: 3000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "VIP Pass", 
        price: 10000, 
        quantity: 200, 
        description: "Front-row access to all shows", 
        salesStart: new Date('2025-01-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-04-01T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "General Admission", 
        price: 3000, 
        quantity: 2300, 
        description: "Access to all shows", 
        salesStart: new Date('2025-01-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-04-01T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["fashion", "delhi", "runway", "designers"],
    isPublished: true
  },
  
  // Event 14: Samay Raina Live in Mumbai
  {
    title: "Samay Raina: No Laughing Matter Tour",
    description: "Experience an evening of unfiltered comedy with India's favorite chess-playing comedian, Samay Raina. Fresh jokes, chess roasts, and his signature style of observational humor that you don't want to miss!",
    summary: "Samay Raina brings his hilarious No Laughing Matter tour to Mumbai",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Jamshed Bhabha Theatre, NCPA",
      address: "Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400021",
      coordinates: [72.8213, 18.9254]
    },
    isVirtual: false,
    startDate: new Date('2025-05-15T19:00:00+05:30'),
    endDate: new Date('2025-05-15T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1000,
    availableTickets: 1000,
    price: 1500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1500, 
        quantity: 800, 
        description: "Standard seating", 
        salesStart: new Date('2025-03-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-10T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 3000, 
        quantity: 200, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-03-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-10T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "samay-raina", "mumbai"],
    isPublished: true
  },

  // Event 15: Harsh Gujral - The Gujju Way
  {
    title: "Harsh Gujral: The Gujju Way - Live in Delhi",
    description: "Harsh Gujral brings his unique perspective on daily life, relationships, and the hilarity of being a Gujju in Delhi. Expect non-stop laughter with his clean yet side-splitting comedy.",
    summary: "Harsh Gujral's The Gujju Way comedy special in Delhi",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-show",
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Siri Fort Auditorium",
      address: "August Kranti Marg",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110049",
      coordinates: [77.2090, 28.5355]
    },
    isVirtual: false,
    startDate: new Date('2025-05-20T19:30:00+05:30'),
    endDate: new Date('2025-05-20T22:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1500,
    availableTickets: 1500,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2000, 
        quantity: 1200, 
        description: "Standard seating", 
        salesStart: new Date('2025-03-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-15T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 4000, 
        quantity: 300, 
        description: "Front row + Meet & Greet", 
        salesStart: new Date('2025-03-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-15T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "harsh-gujral", "delhi"],
    isPublished: true
  },

  // Event 16: Zakir Khan - Tathastu Tour
  {
    title: "Zakir Khan: Tathastu Tour - Live in Bangalore",
    description: "The 'Sakht Launda' of India, Zakir Khan, brings his Tathastu tour to Bangalore. Experience his unique storytelling style that blends humor with heartfelt moments.",
    summary: "Zakir Khan's Tathastu comedy tour in Bangalore",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup-comedy",
      "https://source.unsplash.com/random/400x300/?mic-stand",
      "https://source.unsplash.com/random/400x300/?comedy-club"
    ],
    venue: {
      name: "Chowdiah Memorial Hall",
      address: "Sankey Road",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560020",
      coordinates: [77.5724, 12.9986]
    },
    isVirtual: false,
    startDate: new Date('2025-06-05T19:00:00+05:30'),
    endDate: new Date('2025-06-05T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1200,
    availableTickets: 1200,
    price: 2500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2500, 
        quantity: 900, 
        description: "Standard seating", 
        salesStart: new Date('2025-04-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-31T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 5000, 
        quantity: 300, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-04-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-05-31T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "zakir-khan", "bengaluru"],
    isPublished: true
  },

  // Event 17: Kanan Gill & Kenny Sebastian - Tour
  {
    title: "Kanan Gill & Kenny Sebastian: The Good Evening World Tour",
    description: "Two of India's most beloved comedians come together for an unforgettable evening of comedy. Kanan's sharp wit meets Kenny's musical comedy in this special joint tour.",
    summary: "Kanan Gill and Kenny Sebastian's joint comedy tour",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-duo",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-show",
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Shanmukhananda Hall",
      address: "Sion",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400022",
      coordinates: [72.8558, 19.0409]
    },
    isVirtual: false,
    startDate: new Date('2025-06-12T19:30:00+05:30'),
    endDate: new Date('2025-06-12T22:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2000,
    availableTickets: 2000,
    price: 3000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 3000, 
        quantity: 1600, 
        description: "Standard seating", 
        salesStart: new Date('2025-04-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-10T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 6000, 
        quantity: 400, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-04-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-10T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "kanan-gill", "kenny-sebastian", "mumbai"],
    isPublished: true
  },

  // Event 18: Abhishek Upmanyu - Thoda Saaf Bolta Hu
  {
    title: "Abhishek Upmanyu: Thoda Saaf Bolta Hu - Live in Pune",
    description: "Abhishek Upmanyu brings his signature style of clean yet edgy comedy to Pune. His unique perspective on everyday life will leave you in splits.",
    summary: "Abhishek Upmanyu's stand-up comedy show in Pune",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Ganesh Kala Krida Manch",
      address: "Swargate",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      postalCode: "411042",
      coordinates: [73.8567, 18.5204]
    },
    isVirtual: false,
    startDate: new Date('2025-06-20T19:00:00+05:30'),
    endDate: new Date('2025-06-20T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1500,
    availableTickets: 1500,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2000, 
        quantity: 1200, 
        description: "Standard seating", 
        salesStart: new Date('2025-04-15T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-15T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 4000, 
        quantity: 300, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-04-15T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-15T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "abhishek-upmanyu", "pune"],
    isPublished: true
  },

  // Event 19: Anubhav Singh Bassi - Bas Kar Bassi
  {
    title: "Anubhav Singh Bassi: Bas Kar Bassi - Live in Hyderabad",
    description: "After the massive success of his previous tours, Anubhav Singh Bassi is back with fresh content. His relatable stories about middle-class India will have you laughing non-stop.",
    summary: "Anubhav Singh Bassi's stand-up comedy show in Hyderabad",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?mic-stand",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Shilpakala Vedika",
      address: "Madhapur",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      postalCode: "500081",
      coordinates: [78.3559, 17.4449]
    },
    isVirtual: false,
    startDate: new Date('2025-06-25T19:30:00+05:30'),
    endDate: new Date('2025-06-25T22:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1800,
    availableTickets: 1800,
    price: 2500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2500, 
        quantity: 1400, 
        description: "Standard seating", 
        salesStart: new Date('2025-04-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-20T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 5000, 
        quantity: 400, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-04-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-20T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "anubhav-singh-bassi", "hyderabad"],
    isPublished: true
  },

  // Event 20: Aakash Gupta - Sakht Laundas of India
  {
    title: "Aakash Gupta: Sakht Laundas of India - Live in Chandigarh",
    description: "Aakash Gupta, known for his viral 'Sakht Laundas of India' series, brings his unique brand of comedy to Chandigarh. A night of clean, relatable humor that everyone can enjoy.",
    summary: "Aakash Gupta's stand-up comedy show in Chandigarh",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Tagore Theatre",
      address: "Sector 18",
      city: "Chandigarh",
      state: "Chandigarh",
      country: "India",
      postalCode: "160018",
      coordinates: [76.7794, 30.7333]
    },
    isVirtual: false,
    startDate: new Date('2025-07-05T19:00:00+05:30'),
    endDate: new Date('2025-07-05T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1000,
    availableTickets: 1000,
    price: 1500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1500, 
        quantity: 800, 
        description: "Standard seating", 
        salesStart: new Date('2025-05-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-30T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 3000, 
        quantity: 200, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-05-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-06-30T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "aakash-gupta", "chandigarh"],
    isPublished: true
  },

  // Event 21: Comicstaan All Stars
  {
    title: "Comicstaan All Stars - Live in Bangalore",
    description: "A power-packed evening featuring the best of Comicstaan comedians. Multiple comedians, one stage, and non-stop laughter in this special showcase of India's top comic talent.",
    summary: "Comicstaan comedians come together for a night of laughter in Bangalore",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Manpho Convention Centre",
      address: "Manyata Tech Park",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      postalCode: "560045",
      coordinates: [77.6388, 13.0405]
    },
    isVirtual: false,
    startDate: new Date('2025-07-12T19:30:00+05:30'),
    endDate: new Date('2025-07-12T23:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1500,
    availableTickets: 1500,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2000, 
        quantity: 1200, 
        description: "Standard seating", 
        salesStart: new Date('2025-05-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-10T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 4000, 
        quantity: 300, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-05-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-10T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "comicstaan", "bengaluru"],
    isPublished: true
  },
  
  // Event 22: Rahul Dua - Haha Ka Dhandha
  {
    title: "Rahul Dua: Haha Ka Dhandha - Live in Jaipur",
    description: "Rahul Dua, one of India's fastest-rising comedians, brings his hilarious take on daily life, relationships, and the comedy scene to Jaipur. Fresh from his viral videos and web series, this is a show you don't want to miss!",
    summary: "Rahul Dua's side-splitting comedy show in Jaipur",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Jawahar Kala Kendra",
      address: "Jawahar Lal Nehru Marg",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      postalCode: "302017",
      coordinates: [75.8167, 26.8467]
    },
    isVirtual: false,
    startDate: new Date('2025-07-19T19:30:00+05:30'),
    endDate: new Date('2025-07-19T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 800,
    availableTickets: 800,
    price: 1200,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1200, 
        quantity: 700, 
        description: "Standard seating", 
        salesStart: new Date('2025-05-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-15T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 2500, 
        quantity: 100, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-05-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-15T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "rahul-dua", "jaipur"],
    isPublished: true
  },

  // Event 23: Sumukhi Suresh - Don't Tell Amma
  {
    title: "Sumukhi Suresh: Don't Tell Amma - Live in Ahmedabad",
    description: "Sumukhi Suresh, the queen of storytelling, brings her newest hour of comedy to Ahmedabad. With her signature style of blending humor with heartfelt stories, she'll have you laughing and crying in the same show. Expect stories about family, relationships, and the chaos of adulting.",
    summary: "Sumukhi Suresh's hilarious and heartfelt comedy show in Ahmedabad",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Gulmohar Park Mall",
      address: "SG Highway",
      city: "Ahmedabad",
      state: "Gujarat",
      country: "India",
      postalCode: "380054",
      coordinates: [72.5714, 23.0225]
    },
    isVirtual: false,
    startDate: new Date('2025-07-26T19:30:00+05:30'),
    endDate: new Date('2025-07-26T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 600,
    availableTickets: 600,
    price: 1500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1500, 
        quantity: 500, 
        description: "Standard seating", 
        salesStart: new Date('2025-05-25T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-22T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 3000, 
        quantity: 100, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-05-25T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-22T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "sumukhi-suresh", "ahmedabad"],
    isPublished: true
  },

  // Event 24: Azeem Banatwalla - Middle Class
  {
    title: "Azeem Banatwalla: Middle Class - Live in Kochi",
    description: "Azeem Banatwalla, one of India's most cerebral comedians, brings his critically acclaimed 'Middle Class' tour to Kochi. With his sharp wit and intelligent observations, Azeem takes you on a hilarious journey through the trials and tribulations of being middle class in modern India.",
    summary: "Azeem Banatwalla's Middle Class comedy show in Kochi",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Grand Hyatt Kochi Bolgatty",
      address: "Bolgatty Island",
      city: "Kochi",
      state: "Kerala",
      country: "India",
      postalCode: "682504",
      coordinates: [76.2673, 9.9312]
    },
    isVirtual: false,
    startDate: new Date('2025-08-02T19:30:00+05:30'),
    endDate: new Date('2025-08-02T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 700,
    availableTickets: 700,
    price: 1400,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1400, 
        quantity: 600, 
        description: "Standard seating", 
        salesStart: new Date('2025-06-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-29T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 2800, 
        quantity: 100, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-06-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-07-29T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "azeem-banatwalla", "kochi"],
    isPublished: true
  },

  // Event 25: Aditi Mittal - Unladylike
  {
    title: "Aditi Mittal: Unladylike - Live in Kolkata",
    description: "Aditi Mittal, one of India's first female stand-up comedians, brings her groundbreaking show 'Unladylike' to Kolkata. With her sharp wit and fearless humor, Aditi tackles topics that are often considered taboo, making you laugh while making you think.",
    summary: "Aditi Mittal's bold and hilarious Unladylike show in Kolkata",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Science City Auditorium",
      address: "JBS Haldane Avenue",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      postalCode: "700046",
      coordinates: [88.4285, 22.5330]
    },
    isVirtual: false,
    startDate: new Date('2025-08-09T19:00:00+05:30'),
    endDate: new Date('2025-08-09T21:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1000,
    availableTickets: 1000,
    price: 1200,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1200, 
        quantity: 850, 
        description: "Standard seating", 
        salesStart: new Date('2025-06-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-05T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 2500, 
        quantity: 150, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-06-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-05T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "aditi-mittal", "kolkata"],
    isPublished: true
  },

  // Event 26: Kunal Kamra - The Best of Kunal Kamra
  {
    title: "Kunal Kamra: The Best of Kunal Kamra - Live in Pune",
    description: "Kunal Kamra, known for his satirical and political humor, brings his best work to Pune. This show features his most popular material along with fresh takes on current events. Not for the easily offended, Kunal's sharp commentary will make you laugh while making you think.",
    summary: "Kunal Kamra's satirical comedy show featuring his best work in Pune",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Bal Gandharva Rang Mandir",
      address: "JM Road",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      postalCode: "411004",
      coordinates: [73.8413, 18.5204]
    },
    isVirtual: false,
    startDate: new Date('2025-08-16T20:00:00+05:30'),
    endDate: new Date('2025-08-16T22:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 1200,
    availableTickets: 1200,
    price: 1500,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1500, 
        quantity: 1000, 
        description: "Standard seating", 
        salesStart: new Date('2025-06-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-12T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 3000, 
        quantity: 200, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-06-20T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-12T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "kunal-kamra", "pune"],
    isPublished: true
  },

  // Event 27: Biswa Kalyan Rath - Biswa Mast Aadmi
  {
    title: "Biswa Kalyan Rath: Biswa Mast Aadmi - Live in Hyderabad",
    description: "Biswa Kalyan Rath, the man who redefined Indian stand-up comedy, is back with his new show 'Biswa Mast Aadmi'. After a long hiatus, Biswa returns to the stage with fresh material that's as intelligent as it is hilarious. Don't miss this rare opportunity to see one of India's most original comedy voices live!",
    summary: "Biswa Kalyan Rath's highly anticipated comedy show in Hyderabad",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Shilpakala Vedika",
      address: "HITEC City",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      postalCode: "500081",
      coordinates: [78.3643, 17.4474]
    },
    isVirtual: false,
    startDate: new Date('2025-08-23T19:30:00+05:30'),
    endDate: new Date('2025-08-23T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2000,
    availableTickets: 2000,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2000, 
        quantity: 1700, 
        description: "Standard seating", 
        salesStart: new Date('2025-06-25T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-20T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 4000, 
        quantity: 300, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-06-25T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-20T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "biswa-kalyan-rath", "hyderabad"],
    isPublished: true
  },

  // Event 28: Urooj Ashfaq - Oh No!
  {
    title: "Urooj Ashfaq: Oh No! - Live in Delhi",
    description: "Urooj Ashfaq, one of the most exciting new voices in Indian comedy, brings her debut solo show 'Oh No!' to Delhi. Fresh off her international success, Urooj's unique perspective on life, relationships, and mental health will have you laughing while making you feel seen.",
    summary: "Urooj Ashfaq's debut solo comedy show 'Oh No!' in Delhi",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?standup-comedy",
    gallery: [
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?mic",
      "https://source.unsplash.com/random/400x300/?laughing-audience"
    ],
    venue: {
      name: "Kamani Auditorium",
      address: "Copernicus Marg",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      postalCode: "110001",
      coordinates: [77.2090, 28.6274]
    },
    isVirtual: false,
    startDate: new Date('2025-08-30T19:30:00+05:30'),
    endDate: new Date('2025-08-30T22:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 800,
    availableTickets: 800,
    price: 1800,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 1800, 
        quantity: 700, 
        description: "Standard seating", 
        salesStart: new Date('2025-07-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-27T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 3500, 
        quantity: 100, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-07-01T00:00:00+05:30'), 
        salesEnd: new Date('2025-08-27T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "urooj-ashfaq", "delhi"],
    isPublished: true
  },

  // Event 29: Rahul Subramanian - Kal Main Udega
  {
    title: "Rahul Subramanian: Kal Main Udega - Live in Mumbai",
    description: "Rahul Subramanian, one of India's most popular stand-up comedians, is back with his brand new show 'Kal Main Udega'. After selling out shows across the globe, Rahul brings his unique brand of clean, relatable comedy to Mumbai. Expect hilarious stories, spot-on observations, and an evening full of laughter.",
    summary: "Rahul Subramanian's new comedy special 'Kal Main Udega' in Mumbai",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?comedy-show",
    gallery: [
      "https://source.unsplash.com/random/400x300/?standup",
      "https://source.unsplash.com/random/400x300/?comedy-club",
      "https://source.unsplash.com/random/400x300/?laughing"
    ],
    venue: {
      name: "Jio World Garden",
      address: "Bandra Kurla Complex",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400051",
      coordinates: [72.8650, 19.0760]
    },
    isVirtual: false,
    startDate: new Date('2025-09-06T19:30:00+05:30'),
    endDate: new Date('2025-09-06T22:30:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 2500,
    availableTickets: 2500,
    price: 2000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      { 
        name: "Standard", 
        price: 2000, 
        quantity: 2000, 
        description: "Standard seating", 
        salesStart: new Date('2025-07-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-09-03T23:59:59+05:30'), 
        isActive: true 
      },
      { 
        name: "VIP", 
        price: 4000, 
        quantity: 500, 
        description: "Premium seating + Meet & Greet", 
        salesStart: new Date('2025-07-10T00:00:00+05:30'), 
        salesEnd: new Date('2025-09-03T23:59:59+05:30'), 
        isActive: true 
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["comedy", "standup", "rahul-subramanian", "mumbai"],
    isPublished: true
  },
  
  // Event 30 (Final event)
  {
    title: "New Year's Eve Gala 2026",
    description: "Ring in the New Year in style at the most exclusive party of the year. Featuring live music, gourmet dining, and spectacular fireworks display over the Arabian Sea.",
    summary: "Luxurious New Year's Eve celebration with premium dining and entertainment",
    category: "other",
    bannerImage: "https://source.unsplash.com/random/800x400/?new-years-eve",
    gallery: [
      "https://source.unsplash.com/random/400x300/?party",
      "https://source.unsplash.com/random/400x300/?fireworks",
      "https://source.unsplash.com/random/400x300/?gala"
    ],
    venue: {
      name: "The Taj Mahal Palace",
      address: "Apollo Bunder",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      postalCode: "400001",
      coordinates: [72.8273, 18.9220]
    },
    isVirtual: false,
    startDate: new Date('2025-12-31T20:00:00+05:30'),
    endDate: new Date('2026-01-01T02:00:00+05:30'),
    timezone: "Asia/Kolkata",
    capacity: 500,
    availableTickets: 500,
    price: 50000,
    currency: "INR",
    isFree: false,
    ticketTypes: [
      {
        name: "Standard Entry",
        price: 50000,
        quantity: 400,
        description: "Entry to the gala with dinner and drinks",
        salesStart: new Date('2025-10-01T00:00:00+05:30'),
        salesEnd: new Date('2025-12-25T23:59:59+05:30'),
        isActive: true
      },
      {
        name: "VIP Experience",
        price: 100000,
        quantity: 100,
        description: "VIP seating, premium bar access, and gift bag",
        salesStart: new Date('2025-10-01T00:00:00+05:30'),
        salesEnd: new Date('2025-12-25T23:59:59+05:30'),
        isActive: true
      }
    ],
    status: "upcoming",
    contractEventId: "0x" + Math.random().toString(16).substr(2, 40),
    tags: ["new-years", "gala", "celebration", "luxury"],
    isPublished: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Get a random admin user to be the organizer
const getRandomAdmin = async () => {
  try {
    const admins = await User.find({ role: 'admin' });
    if (admins.length > 0) {
      return admins[Math.floor(Math.random() * admins.length)]._id;
    }
    return null;
  } catch (err) {
    console.error('Error finding admin user:', err);
    return null;
  }
};

// Add contractEventId to each event if not present
const prepareEvents = (events) => {
  return events.map(event => ({
    ...event,
    contractEventId: event.contractEventId || "0x" + Math.random().toString(16).substr(2, 40),
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};

// Seed the database with events
const seedEvents = async () => {
  try {
    await connectDB();
    
    // Get an admin user to be the organizer
    const adminId = await getRandomAdmin();
    
    // Prepare events data
    const eventsToInsert = prepareEvents(events);
    
    // Set organizer for all events
    if (adminId) {
      eventsToInsert.forEach(event => {
        event.organizer = adminId;
      });
    }
    
    // Insert events
    const createdEvents = await Event.insertMany(eventsToInsert);
    console.log(`Successfully added ${createdEvents.length} events to the database.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding events:', err);
    process.exit(1);
  }
};

// Run the seed function
seedEvents();
