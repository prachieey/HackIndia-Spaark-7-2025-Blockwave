import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  lastEmailSent: Date,
  source: {
    type: String,
    default: 'website',
    enum: ['website', 'landing-page', 'signup']
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, { timestamps: true });

// Add index for faster lookups
subscriptionSchema.index({ email: 1 }, { unique: true });
subscriptionSchema.index({ isActive: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
