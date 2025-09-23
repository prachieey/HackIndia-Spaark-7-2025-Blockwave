import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env') });

// Database connection configuration
const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/scantyx-dev';

async function testConnection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if events collection exists
    const eventsCollection = db.collection('events');
    const eventCount = await eventsCollection.countDocuments();
    console.log(`\nFound ${eventCount} documents in 'events' collection`);
    
    // Show a sample event if available
    if (eventCount > 0) {
      console.log('\nSample event:');
      const sampleEvent = await eventsCollection.findOne();
      console.log(JSON.stringify(sampleEvent, null, 2));
    }
    
    // Check if the Event model is registered
    if (mongoose.modelNames().includes('Event')) {
      console.log('\nEvent model is registered with Mongoose');
      
      // Try to fetch events using the model
      try {
        const events = await mongoose.model('Event').find().limit(2);
        console.log('\nFetched events using Mongoose model:');
        console.log(JSON.stringify(events, null, 2));
      } catch (error) {
        console.error('Error fetching events with Mongoose model:', error);
      }
    } else {
      console.log('\nEvent model is NOT registered with Mongoose');
    }
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

testConnection().catch(console.error);
