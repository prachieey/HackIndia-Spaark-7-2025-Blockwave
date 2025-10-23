import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/database.js';

dotenv.config();

async function addUniqueIndex() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to MongoDB');

    // Get the events collection
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // Check if the index already exists
    const indexes = await eventsCollection.indexes();
    const indexExists = indexes.some(
      index => 
        JSON.stringify(index.key) === JSON.stringify({ title: 1, startDate: 1 }) && 
        index.unique === true
    );

    if (indexExists) {
      console.log('Unique index on {title: 1, startDate: 1} already exists');
    } else {
      // Create the unique index
      await eventsCollection.createIndex(
        { title: 1, startDate: 1 },
        { unique: true, name: 'unique_event_title_startDate' }
      );
      console.log('Successfully created unique index on {title: 1, startDate: 1}');
    }

    // Verify the index was created
    const newIndexes = await eventsCollection.indexes();
    console.log('\nCurrent indexes on events collection:');
    console.log(newIndexes.map(idx => ({
      name: idx.name,
      key: idx.key,
      unique: idx.unique || false
    })));

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error adding unique index:', error);
    process.exit(1);
  }
}

// Run the function
addUniqueIndex();
