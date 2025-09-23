import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../src/models/Event.js';
import User from '../src/models/User.js';

dotenv.config();

async function publishDraftEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all draft events
    const draftEvents = await Event.find({ status: 'draft' });
    console.log(`Found ${draftEvents.length} draft events`);

    // Update status to 'published' for each event
    const updatePromises = draftEvents.map(event => {
      return Event.findByIdAndUpdate(
        event._id,
        { status: 'upcoming' },
        { new: true, runValidators: true }
      );
    });

    // Wait for all updates to complete
    const updatedEvents = await Promise.all(updatePromises);
    console.log(`Successfully published ${updatedEvents.length} events`);

    // Verify the update
    const remainingDrafts = await Event.countDocuments({ status: 'draft' });
    console.log(`Remaining draft events: ${remainingDrafts}`);

  } catch (error) {
    console.error('Error publishing draft events:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  }
}

publishDraftEvents();
