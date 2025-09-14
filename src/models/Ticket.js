import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  // On-chain data
  tokenId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  
  // Ticket details
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  ticketType: {
    name: String,
    price: Number,
    currency: String
  },
  
  // Owner information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerWallet: {
    type: String,
    required: true,
    lowercase: true
  },
  
  // Attendee information (can be different from owner)
  attendee: {
    name: String,
    email: String,
    phone: String
  },
  
  // Status and validation
  status: {
    type: String,
    enum: ['active', 'used', 'transferred', 'refunded', 'cancelled'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Transfer and resale
  isTransferable: {
    type: Boolean,
    default: true
  },
  transferHistory: [{
    from: String,
    to: String,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Additional data
  metadata: mongoose.Schema.Types.Mixed,
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
ticketSchema.index({ owner: 1, status: 1 });
ticketSchema.index({ event: 1, status: 1 });
ticketSchema.index({ tokenId: 1, contractAddress: 1 }, { unique: true });

// Virtual for ticket QR code URL
ticketSchema.virtual('qrCodeUrl').get(function() {
  return `/api/tickets/${this._id}/qrcode`;
});

// Pre-save hook to update status
ticketSchema.pre('save', function(next) {
  if (this.isModified('isVerified') && this.isVerified) {
    this.verifiedAt = new Date();
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
