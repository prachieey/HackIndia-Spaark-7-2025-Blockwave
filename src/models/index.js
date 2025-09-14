const mongoose = require('mongoose');
const User = require('./User');
const Event = require('./Event');
const Ticket = require('./Ticket');

// Export all models
module.exports = {
  User,
  Event,
  Ticket,
  connection: mongoose.connection,
};

// Create indexes in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const createIndexes = async () => {
    try {
      await User.ensureIndexes();
      await Event.ensureIndexes();
      await Ticket.ensureIndexes();
      console.log('Database indexes created/verified');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  };

  // Only run in development
  if (process.env.NODE_ENV === 'development') {
    createIndexes();
  }
}
