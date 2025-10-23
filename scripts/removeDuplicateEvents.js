import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/database.js';

dotenv.config();

async function removeDuplicateEvents() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to MongoDB');

    // Get the events collection
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');

    // Find all events grouped by title and startDate
    const duplicates = await eventsCollection.aggregate([
      {
        $group: {
          _id: {
            title: "$title",
            startDate: "$startDate"
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 } // Only include groups with more than one event
        }
      }
    ]).toArray();

    console.log(`Found ${duplicates.length} sets of duplicate events`);

    let totalRemoved = 0;

    // For each group of duplicates, keep the first one and remove the rest
    for (const group of duplicates) {
      const idsToRemove = group.ids.slice(1); // Keep the first one, remove the rest
      
      if (idsToRemove.length > 0) {
        const result = await eventsCollection.deleteMany({
          _id: { $in: idsToRemove }
        });
        
        console.log(`Removed ${result.deletedCount} duplicates of "${group._id.title}" (${group._id.startDate})`);
        totalRemoved += result.deletedCount;
      }
    }

    console.log(`\nTotal duplicate events removed: ${totalRemoved}`);
    
    // Verify the final count
    const remainingCount = await eventsCollection.countDocuments();
    console.log(`Total unique events remaining: ${remainingCount}`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error removing duplicate events:', error);
    process.exit(1);
  }
}

// Run the function
removeDuplicateEvents();
