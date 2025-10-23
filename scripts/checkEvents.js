import mongoose from 'mongoose';
import Event from '../src/models/Event.js';
import { getMongoURI } from '../src/config/database.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');  
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Check events in the database
const checkEvents = async () => {
  try {
    // Get total count of events
    const totalEvents = await Event.countDocuments();
    console.log(`\nTotal events in database: ${totalEvents}`);
    
    // Get list of all events with basic info (limited to 10 for brevity)
    const events = await Event.find({}, 'title startDate venue.city category status tags')
      .sort({ startDate: 1 })
      .limit(10);
    
    console.log('\nSample of events (first 10):');
    console.log('--------------------------');
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Date: ${event.startDate.toLocaleDateString()}`);
      console.log(`   Location: ${event.venue.city}`);
      console.log(`   Category: ${event.category}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Tags: ${event.tags.join(', ')}`);
      console.log('--------------------------');
    });
    
    // Get count of comedy events
    const comedyCount = await Event.countDocuments({ tags: 'comedy' });
    console.log(`\nTotal comedy events: ${comedyCount}`);
    
    // Get list of all comedy events
    const comedyEvents = await Event.find(
      { tags: 'comedy' }, 
      'title startDate venue.city'
    ).sort({ startDate: 1 });
    
    console.log('\nList of all comedy events:');
    console.log('------------------------');
    comedyEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   Date: ${event.startDate.toLocaleDateString()}`);
      console.log(`   Location: ${event.venue.city}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking events:', err);
    process.exit(1);
  }
};

// Run the check
(async () => {
  try {
    await connectDB();
    await checkEvents();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
