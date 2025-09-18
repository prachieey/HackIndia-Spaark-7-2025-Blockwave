import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
      trim: true,
      maxlength: [2000, 'A review must have less or equal than 2000 characters'],
      minlength: [10, 'A review must have more or equal than 10 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be below or equal to 5'],
      required: [true, 'A review must have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: [true, 'Review must belong to an event'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    userName: {
      type: String,
      required: [true, 'Review must have a user name'],
    },
    userEmail: {
      type: String,
      required: [true, 'Review must have a user email'],
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews from same user on same event
reviewSchema.index({ event: 1, user: 1 }, { unique: true });

// Populate user data when querying reviews
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Calculate average ratings on the event when a review is saved
reviewSchema.statics.calcAverageRatings = async function (eventId) {
  const stats = await this.aggregate([
    {
      $match: { event: eventId },
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
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5, // Default value
    });
  }
};

// Call calcAverageRatings after save
reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.event);
});

// Call calcAverageRatings after update or delete
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.event);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
