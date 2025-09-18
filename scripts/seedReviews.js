require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const User = require('../src/models/User');
const Event = require('../src/models/Event');
const bcrypt = require('bcryptjs');

// Sample user data
const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Mike Brown',
    email: 'mike.brown@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@example.com',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    password: 'password123',
    role: 'user'
  }
];

// Sample review data with more variety
const sampleReviews = [
  {
    rating: 5,
    review: "Absolutely mind-blowing experience! The production value was incredible and the performances were out of this world. Can't wait for the next one! 🎉",
    helpfulCount: 12,
    isVerified: true
  },
  {
    rating: 4,
    review: "Great event overall! The venue was well-organized and the sound quality was excellent. My only complaint is that the food options were quite limited.",
    helpfulCount: 8,
    isVerified: true
  },
  {
    rating: 3,
    review: "The event had its ups and downs. The main act was amazing but the opening acts were just okay. Also, the event started an hour late which was frustrating.",
    helpfulCount: 5,
    isVerified: true
  },
  {
    rating: 5,
    review: "Best night of my life! The energy was electric and the performances were top-notch. Will definitely be coming back next year! 💯",
    helpfulCount: 15,
    isVerified: true
  },
  {
    rating: 2,
    review: "Disappointed with the event. The sound system had issues and the staff seemed disorganized. Expected better for the price.",
    helpfulCount: 3,
    isVerified: true
  },
  {
    rating: 4,
    review: "Really enjoyed the performances! The light show was spectacular. The only downside was the long lines at the bar.",
    helpfulCount: 7,
    isVerified: true
  },
  {
    rating: 5,
    review: "Incredible experience from start to finish! The artists gave it their all and the crowd was amazing. 10/10 would recommend!",
    helpfulCount: 20,
    isVerified: true
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// Hash password for users
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedReviews = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing reviews and users...');
    await Review.deleteMany({});
    await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });

    // Get events to associate with reviews
    const events = await Event.find().limit(3);
    if (events.length === 0) {
      console.error('No events found in the database. Please create events first.');
      process.exit(1);
    }

    console.log(`Found ${events.length} events to add reviews to`);

    // Create sample users
    console.log('Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // Create reviews for each event
    console.log('Creating sample reviews...');
    let reviewCount = 0;
    
    for (const event of events) {
      // Create multiple reviews per event
      for (let i = 0; i < 5; i++) {
        const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const reviewData = {
          ...sampleReviews[Math.floor(Math.random() * sampleReviews.length)],
          event: event._id,
          user: user._id,
          userName: user.name,
          userEmail: user.email,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Random date in the last 30 days
        };

        const review = new Review(reviewData);
        await review.save();
        reviewCount++;
        console.log(`Added review by ${user.name} for event: ${event.title}`);
      }
    }

    console.log(`\n✅ Successfully seeded ${reviewCount} reviews across ${events.length} events!`);
    console.log(`Sample users created (all with password 'password123'):`);
    createdUsers.forEach(user => console.log(`- ${user.email}`));
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedReviews();
