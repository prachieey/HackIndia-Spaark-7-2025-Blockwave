import mongoose from 'mongoose';

const demoRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed', 'cancelled'],
      default: 'pending'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
demoRequestSchema.index({ email: 1 });
demoRequestSchema.index({ status: 1 });
demoRequestSchema.index({ createdAt: -1 });

const DemoRequest = mongoose.model('DemoRequest', demoRequestSchema);

export default DemoRequest;
