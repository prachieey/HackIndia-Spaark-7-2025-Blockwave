import Review from '../models/Review.js';
import Event from '../models/Event.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

// Middleware to set event and user IDs
export const setEventUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.eventId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Get all reviews with pagination and filtering
export const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.eventId) filter = { event: req.params.eventId };

  // Execute query with pagination and filtering
  const features = new APIFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const reviews = await features.query.populate({
    path: 'user',
    select: 'name photo'
  });

  // Get total count for pagination
  const total = await Review.countDocuments(filter);
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      docs: reviews,
      total,
      page,
      pages,
      hasNextPage,
    },
  });
});

// Get reviews for a specific event
export const getEventReviews = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ event: eventId })
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: 'user',
      select: 'name photo'
    });
    
  const total = await Review.countDocuments({ event: eventId });
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  
  res.status(200).json({
    status: 'success',
    data: {
      docs: reviews,
      total,
      page: parseInt(page),
      pages,
      hasNextPage,
      limit: parseInt(limit)
    }
  });
});

// Get review statistics for an event
export const getReviewStats = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  
  const stats = await Review.aggregate([
    {
      $match: { event: mongoose.Types.ObjectId(eventId) }
    },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: {
            rating: '$rating'
          }
        }
      }
    },
    {
      $project: {
        averageRating: { $round: ['$averageRating', 1] },
        totalReviews: 1,
        ratingCounts: {
          $arrayToObject: {
            $map: {
              input: [5, 4, 3, 2, 1],
              as: 'r',
              in: {
                k: { $toString: '$$r' },
                v: {
                  $size: {
                    $filter: {
                      input: '$ratingCounts',
                      as: 'rc',
                      cond: { $eq: ['$$rc.rating', '$$r'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);
  
  // Format the response
  const result = stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

// Get a user's review for a specific event
export const getMyReviewForEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;

  const review = await Review.findOne({
    event: eventId,
    user: userId
  }).populate({
    path: 'event',
    select: 'name imageCover'
  });

  if (!review) {
    return res.status(200).json({
      status: 'success',
      data: {
        review: null
      }
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Get all reviews for the currently logged-in user
export const getMyReviews = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  
  const reviews = await Review.find({ user: req.user.id })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate({
      path: 'event',
      select: 'name imageCover'
    });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Get a single review
export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Create a new review
export const createReview = catchAsync(async (req, res, next) => {
  const { rating, review, event } = req.body;
  const userId = req.user.id;

  // 1) Check if the user has already reviewed the event
  const existingReview = await Review.findOne({ user: userId, event });
  if (existingReview) {
    return next(
      new AppError('You have already reviewed this event', 400)
    );
  }

  // 2) Check if the user has attended the event
  const hasTicket = await Ticket.findOne({
    event,
    user: userId,
    status: 'used',
  });

  if (!hasTicket) {
    return next(
      new AppError('You can only review events you have attended', 400)
    );
  }

  // 3) Create the review
  const newReview = await Review.create({
    review,
    rating,
    event,
    user: userId,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// Update a review
export const updateReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const reviewId = req.params.id;
  const userId = req.user.id;

  // 1) Find the review
  const existingReview = await Review.findById(reviewId);
  if (!existingReview) {
    return next(new AppError('No review found with that ID', 404));
  }

  // 2) Check if the user is the author or an admin
  if (
    existingReview.user.toString() !== userId &&
    req.user.role !== 'admin'
  ) {
    return next(
      new AppError('You are not authorized to update this review', 403)
    );
  }

  // 3) Update the review
  existingReview.rating = rating || existingReview.rating;
  existingReview.review = review || existingReview.review;
  await existingReview.save();

  res.status(200).json({
    status: 'success',
    data: {
      review: existingReview,
    },
  });
});

// Delete a review
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if the user is the author or an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('You are not authorized to delete this review', 403)
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


// This function is already defined above, so we don't need it here

// All functions are already exported individually at their definition
// No need for additional exports here
