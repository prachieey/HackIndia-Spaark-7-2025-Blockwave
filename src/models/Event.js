import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    // On-chain data
    contractEventId: {
      type: Number,
      required: true,
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Event details
    title: {
      type: String,
      required: [true, 'An event must have a title'],
      trim: true,
      maxlength: [100, 'An event title must have less or equal than 100 characters'],
      minlength: [10, 'An event title must have more or equal than 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'An event must have a description'],
      trim: true,
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'An event must have a summary'],
    },
    category: {
      type: String,
      required: [true, 'An event must have a category'],
      enum: {
        values: ['music', 'sports', 'conference', 'art', 'charity', 'other'],
        message: 'Category is either: music, sports, conference, art, charity, other',
      },
    },

    // Media
    bannerImage: {
      type: String,
      required: [true, 'An event must have a banner image'],
    },
    gallery: [String],

    // Location
    venue: {
      name: {
        type: String,
        required: [true, 'Please provide a venue name'],
      },
      address: String,
      city: String,
      country: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere',
      },
      isVirtual: {
        type: Boolean,
        default: false,
      },
      meetingLink: {
        type: String,
        validate: {
          validator: function (val) {
            if (this.venue.isVirtual) return val;
            return true;
          },
          message: 'Meeting link is required for virtual events',
        },
      },
    },

    // Timing
    startDate: {
      type: Date,
      required: [true, 'An event must have a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'An event must have an end date'],
      validate: {
        validator: function (val) {
          return val > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },

    // Ticketing
    ticketTypes: [
      {
        name: {
          type: String,
          required: [true, 'A ticket type must have a name'],
        },
        description: String,
        price: {
          type: Number,
          required: [true, 'A ticket type must have a price'],
          min: [0, 'Price must be above 0'],
        },
        currency: {
          type: String,
          default: 'ETH',
          enum: {
            values: ['ETH', 'USDT', 'USDC', 'DAI'],
            message: 'Currency is either: ETH, USDT, USDC, DAI',
          },
        },
        quantity: {
          type: Number,
          required: [true, 'A ticket type must have a quantity'],
          min: [0, 'Quantity must be above 0'],
        },
        sold: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        perks: [String],
        saleStart: Date,
        saleEnd: {
          type: Date,
          validate: {
            validator: function (val) {
              if (!val) return true;
              return val < this.parent().endDate;
            },
            message: 'Sale end must be before event end date',
          },
        },
      },
    ],

    // Status
    status: {
      type: String,
      enum: {
        values: ['draft', 'upcoming', 'live', 'completed', 'cancelled'],
        message:
          'Status is either: draft, upcoming, live, completed, cancelled',
      },
      default: 'draft',
    },

    // Additional info
    tags: [String],
    termsConditions: String,
    refundPolicy: String,

    // Reviews
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate
// This creates a virtual field 'reviews' that isn't stored in the database
// but can be used to get all reviews for an event
eventSchema.virtual('reviews', {
  ref: 'Review', // The model to use
  foreignField: 'event', // The field in the Review model that we're populating from
  localField: '_id', // The field in the Event model that matches the foreignField
});

// Virtual for ticket availability
eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketTypes.every((type) => type.sold >= type.quantity);
});

// Indexes for faster queries
eventSchema.index({ 'venue.coordinates': '2dsphere' });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ organizer: 1 });

// Pre-save hook to update status based on dates
eventSchema.pre('save', function (next) {
  const now = new Date();

  if (this.startDate <= now) {
    this.status = 'live';
  }

  if (this.endDate <= now && this.status !== 'cancelled') {
    this.status = 'completed';
  }

  next();
});

// Populate organizer data when querying events
eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'organizer',
    select: 'name email profileImage',
  });
  next();
});

// Calculate ratings average when event is queried by ID
eventSchema.post(/^findOne/, async function (doc) {
  if (doc) {
    const stats = await this.model.aggregate([
      {
        $match: { event: doc._id },
      },
      {
        $group: {
          _id: '$event',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      doc.ratingsQuantity = stats[0].nRating;
      doc.ratingsAverage = stats[0].avgRating;
    } else {
      doc.ratingsQuantity = 0;
      doc.ratingsAverage = 4.5;
    }
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
