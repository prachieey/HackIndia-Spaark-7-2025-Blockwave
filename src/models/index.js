import mongoose from 'mongoose';
import User from './User.js';
import Event from './Event.js';
import Ticket from './Ticket.js';

// Export all models
const connection = mongoose.connection;

export {
  User,
  Event,
  Ticket,
  connection,
};

// Disable auto index creation to prevent conflicts
mongoose.set('autoIndex', false);

// Create indexes in non-production environments - disabled to prevent conflicts
if (process.env.NODE_ENV !== 'production' && process.env.CREATE_INDEXES === 'true') {
  const createIndexes = async () => {
    try {
      console.log('Creating database indexes...');
      await User.syncIndexes();
      await Event.syncIndexes();
      await Ticket.syncIndexes();
      console.log('Database indexes created/verified');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  };

  // Only run if explicitly enabled
  if (process.env.NODE_ENV === 'development') {
    createIndexes();
  }
}
