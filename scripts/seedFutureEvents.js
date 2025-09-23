import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../src/models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scantyx-dev');
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// New future events data
const futureEvents = [
  {
    title: 'AI & Machine Learning Summit',
    summary: 'Join us for a deep dive into the latest advancements in AI and Machine Learning',
    description: 'Learn from industry experts and network with professionals in the field of AI and Machine Learning. This summit will cover the latest trends, tools, and technologies shaping the future of AI.',
    startDate: new Date('2025-11-15T09:00:00'),
    endDate: new Date('2025-11-17T18:00:00'),
    venue: {
      name: 'Tech Convention Center',
      address: '123 Tech Park, Bangalore',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    category: 'conference',
    status: 'upcoming',
    capacity: 500,
    price: 2999,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?ai-ml',
    contractEventId: 1001
  },
  {
    title: 'Startup Pitch Competition',
    summary: 'Witness innovative startups pitch their ideas to investors',
    description: 'Join us for an exciting day of startup pitches where entrepreneurs will present their innovative ideas to a panel of investors. Winners will receive funding and mentorship opportunities.',
    startDate: new Date('2025-11-20T10:00:00'),
    endDate: new Date('2025-11-20T18:00:00'),
    venue: {
      name: 'Innovation Hub',
      address: '456 Startup Street, Mumbai',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    category: 'conference',
    status: 'upcoming',
    capacity: 200,
    price: 999,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?startup-pitch',
    contractEventId: 1002
  },
  {
    title: 'Digital Marketing Workshop',
    summary: 'Master digital marketing strategies in this hands-on workshop',
    description: 'Learn the latest digital marketing strategies including SEO, social media marketing, content creation, and more in this comprehensive workshop designed for marketing professionals.',
    startDate: new Date('2025-11-25T13:00:00'),
    endDate: new Date('2025-11-25T17:00:00'),
    venue: {
      name: 'Digital Campus',
      address: '789 Digital Avenue, Delhi',
      coordinates: [77.1025, 28.7041] // Delhi coordinates
    },
    category: 'conference',
    status: 'upcoming',
    capacity: 100,
    price: 1499,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?digital-marketing',
    contractEventId: 1003
  },
  {
    title: 'Health & Wellness Expo',
    summary: 'Explore the latest in health, fitness, and wellness',
    description: 'Discover the latest trends in health and wellness with expert talks, workshops, and product demonstrations from leading health professionals and brands.',
    startDate: new Date('2025-12-05T10:00:00'),
    endDate: new Date('2025-12-07T19:00:00'),
    venue: {
      name: 'Wellness Center',
      address: '321 Health Street, Hyderabad',
      coordinates: [78.4867, 17.3850] // Hyderabad coordinates
    },
    category: 'charity',
    status: 'upcoming',
    capacity: 1000,
    price: 499,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?wellness-expo',
    contractEventId: 1004
  },
  {
    title: 'Culinary Arts Festival',
    summary: 'A celebration of culinary excellence with masterclasses and tastings',
    description: 'Experience the art of cooking with masterclasses, tastings, and competitions featuring renowned chefs from around the world.',
    startDate: new Date('2025-12-10T11:00:00'),
    endDate: new Date('2025-12-12T22:00:00'),
    venue: {
      name: 'Food Court',
      address: '159 Gourmet Road, Pune',
      coordinates: [73.8567, 18.5204] // Pune coordinates
    },
    category: 'art',
    status: 'upcoming',
    capacity: 800,
    price: 1999,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?culinary-arts',
    contractEventId: 1005
  },
  {
    title: 'Film Premiere Night',
    summary: 'Exclusive premiere of the most anticipated films of the year',
    description: 'Be among the first to watch the most anticipated films of the year with exclusive behind-the-scenes access and Q&A sessions with the cast and crew.',
    startDate: new Date('2025-12-15T18:00:00'),
    endDate: new Date('2025-12-15T23:00:00'),
    venue: {
      name: 'Cineplex',
      address: '753 Movie Lane, Mumbai',
      coordinates: [72.8777, 19.0760] // Mumbai coordinates
    },
    category: 'art',
    status: 'upcoming',
    capacity: 300,
    price: 1499,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?film-premiere',
    contractEventId: 1006
  },
  {
    title: 'Jazz & Blues Night',
    summary: 'An evening of smooth jazz and soulful blues performances',
    description: 'Enjoy an unforgettable evening of live jazz and blues performances by renowned artists in an intimate setting with great food and drinks.',
    startDate: new Date('2025-12-20T19:00:00'),
    endDate: new Date('2025-12-20T23:00:00'),
    venue: {
      name: 'Blue Note Club',
      address: '456 Jazz Street, Bangalore',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    category: 'music',
    status: 'upcoming',
    capacity: 150,
    price: 1299,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?jazz-blues',
    contractEventId: 1007,
    tags: ['jazz', 'blues', 'music']
  },
  {
    title: 'New Year\'s Eve Gala',
    summary: 'Ring in the New Year with an unforgettable celebration',
    description: 'Welcome the New Year in style with an unforgettable night of music, dancing, gourmet food, and spectacular fireworks at the most exclusive party in town.',
    startDate: new Date('2025-12-31T20:00:00'),
    endDate: new Date('2026-01-01T02:00:00'),
    venue: {
      name: 'The Leela Palace',
      address: '23 Airport Road, Bangalore',
      coordinates: [77.5946, 12.9716] // Bangalore coordinates
    },
    category: 'other',
    status: 'upcoming',
    capacity: 400,
    price: 3499,
    organizer: '65d245a136b07a8b5813cfb0',
    bannerImage: 'https://source.unsplash.com/random/800x400/?new-years-eve',
    contractEventId: 1008,
    tags: ['new year', 'gala', 'celebration']
  }
];

const seedFutureEvents = async () => {
  try {
    await connectDB();
    
    // Clear existing future events (optional)
    // await Event.deleteMany({ status: 'upcoming' });
    
    // Add new future events
    const createdEvents = await Event.insertMany(futureEvents);
    console.log(`Successfully added ${createdEvents.length} future events`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding future events:', error);
    process.exit(1);
  }
};

seedFutureEvents();
