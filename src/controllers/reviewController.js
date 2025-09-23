import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';

// Middleware to set event and user data
const setReviewUserData = (req, res, next) => {
  // Allow nested routes
  if (!req.body.event) req.body.event = req.params.eventId;
  if (!req.body.user) {
    req.body.user = req.user.id;
    req.body.userName = req.user.name;
    req.body.userEmail = req.user.email;
  }
  // Set updatedAt timestamp
  req.body.updatedAt = Date.now();
  next();
};

// Get all reviews with pagination and filtering
const getAllReviews = catchAsync(async (req, res, next) => {
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
const getEventReviews = catchAsync(async (req, res, next) => {
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
const getEventReviewStats = catchAsync(async (req, res, next) => {
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

// Get all reviews for the currently logged-in user
const getMyReviews = catchAsync(async (req, res, next) => {
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
const getReview = catchAsync(async (req, res, next) => {
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
const createReview = catchAsync(async (req, res, next) => {
  const { rating, review, event, userName, userEmail } = req.body;
  const userId = req.user.id;
  
  // Validate required fields
  if (!rating || !review || !event || !userName || !userEmail) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // 1) Check if the user has already reviewed the event
  const existingReview = await Review.findOne({ user: userId, event });
  if (existingReview) {
    return next(new AppError('You have already reviewed this event', 400));
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

  // 2) Create new review with all required fields
  const newReview = await Review.create({
    rating,
    review,
    event,
    user: userId,
    userName,
    userEmail,
    isVerified: true, // Mark as verified since it's coming from authenticated user
    updatedAt: Date.now()
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// Update a review
const updateReview = catchAsync(async (req, res, next) => {
  const { rating, review, isHelpful } = req.body;
  
  // Handle helpful count update
  if (isHelpful !== undefined) {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }
    
    // Toggle helpful count (prevent duplicate votes in a real app)
    review.helpfulCount += isHelpful ? 1 : -1;
    await review.save();
    
    return res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  }
  
  // Regular review update
  const updateData = { 
    rating, 
    review,
    updatedAt: Date.now()
  };
  
  // 1) Find review and update it
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

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
const deleteReview = catchAsync(async (req, res, next) => {
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


// Mark a review as helpful
const markHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true, runValidators: true }
  );

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

// Get reviews for the current user

// Get a user's review for a specific event
const getMyReviewForEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  
  const review = await Review.findOne({
    user: req.user.id,
    event: eventId,
  }).populate('event', 'title');

  if (!review) {
    return res.status(200).json({
      status: 'success',
      data: {
        review: null,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Report a review
// Get rating statistics for a specific event
const getEventRatingStats = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  // 1) Get basic stats
  const stats = await Review.aggregate([
    {
      $match: { event: new mongoose.Types.ObjectId(eventId) }
    },
    {
      $group: {
        _id: '$event',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        ratings: { $push: '$rating' },
        reviews: { $push: { rating: '$rating', comment: '$review', user: '$user', createdAt: '$createdAt' } }
      }
    },
    {
      $addFields: {
        // Calculate rating distribution (1-5 stars)
        ratingDistribution: [
          { stars: 1, count: { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 1] } } } } },
          { stars: 2, count: { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 2] } } } } },
          { stars: 3, count: { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 3] } } } } },
          { stars: 4, count: { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 4] } } } } },
          { stars: 5, count: { $size: { $filter: { input: '$ratings', as: 'r', cond: { $eq: ['$$r', 5] } } } } }
        ]
      }
    },
    {
      $project: {
        _id: 0,
        event: '$_id',
        totalRatings: '$nRating',
        averageRating: { $round: ['$avgRating', 1] },
        ratingDistribution: 1,
        // Get most recent reviews
        recentReviews: { $slice: [{ $reverseArray: '$reviews' }, 5] }
      }
    }
  ]);

  if (stats.length === 0) {
    return next(new AppError('No reviews found for this event', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0]
    }
  });
});

// Get all reported reviews (Admin/Moderator only)
const getReportedReviews = catchAsync(async (req, res, next) => {
  // 1) Build the query for reported reviews
  const query = { 
    isFlagged: true,
    reportCount: { $gt: 0 }
  };

  // 2) Execute query with pagination and filtering
  const features = new APIFeatures(
    Review.find(query)
      .populate('user', 'name email')
      .populate('event', 'title'),
    req.query
  )
    .filter()
    .sort('-reportCount')
    .limitFields()
    .paginate();

  const reviews = await features.query;

  // 3) Get total count for pagination
  const total = await Review.countDocuments(query);
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const pages = Math.ceil(total / limit);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
      pagination: {
        total,
        page,
        pages,
        limit,
        hasNextPage: page < pages,
        hasPrevPage: page > 1
      }
    }
  });
});

const reportReview = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason) {
    return next(new AppError('Please provide a reason for reporting this review', 400));
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { 
      $inc: { reportCount: 1 },
      $push: { 
        reports: { 
          user: req.user.id, 
          reason,
          reportedAt: new Date()
        } 
      },
      $set: { isFlagged: true }
    },
    { new: true, runValidators: true }
  );

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

// Resolve a reported review (Admin/Moderator only)
const resolveReport = catchAsync(async (req, res, next) => {
  const { action, reason } = req.body;
  const { id: reviewId } = req.params;

  // Validate required fields
  if (!action || !['keep', 'remove'].includes(action)) {
    return next(
      new AppError(
        'Please provide a valid action (keep/remove) and reason',
        400
      )
    );
  }

  // Find the review
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Update based on action
  if (action === 'remove') {
    // Soft delete the review
    review.isActive = false;
    review.deletedAt = new Date();
    review.deletedBy = req.user.id;
    review.deletionReason = reason || 'Removed by moderator';
  }

  // Reset report flags
  review.isFlagged = false;
  review.reportCount = 0;
  review.reports = [];
  review.resolvedBy = req.user.id;
  review.resolvedAt = new Date();
  review.resolution = {
    action,
    reason: reason || 'Resolved by moderator',
    resolvedBy: req.user.id,
    resolvedAt: new Date()
  };

  await review.save({ validateBeforeSave: false });

  // If review was removed, update event rating stats
  if (action === 'remove') {
    await updateEventRatingStats(review.event);
  }

  res.status(200).json({
    status: 'success',
    message: `Review ${action === 'remove' ? 'removed' : 'kept'} successfully`,
    data: {
      review
    }
  });
});

// Get review statistics (Admin only)
const getReviewStats = catchAsync(async (req, res, next) => {
  const stats = await Review.aggregate([
    {
      $facet: {
        // Total reviews
        total: [{ $count: 'count' }],
        // Average rating
        averageRating: [{ $group: { _id: null, avg: { $avg: '$rating' } } }],
        // Reviews by rating
        byRating: [
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: -1 } }
        ],
        // Reviews by month
        byMonth: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        // Reviews with reports
        reported: [
          { $match: { reportCount: { $gt: 0 } } },
          { $count: 'count' }
        ],
        // Recent reviews
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              rating: 1,
              review: 1,
              createdAt: 1,
              'user.name': 1,
              'user.email': 1
            }
          }
        ]
      }
    }
  ]);

  // Format the response
  const result = {
    total: stats[0].total[0]?.count || 0,
    averageRating: stats[0].averageRating[0]?.avg?.toFixed(2) || 0,
    byRating: stats[0].byRating.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    byMonth: stats[0].byMonth,
    reported: stats[0].reported[0]?.count || 0,
    recent: stats[0].recent
  };

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// Get top rated events based on reviews
const getTopRatedEvents = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const topEvents = await Review.aggregate([
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        lastReview: { $max: '$createdAt' }
      }
    },
    { $sort: { averageRating: -1, reviewCount: -1 } },
    { $limit: parseInt(limit, 10) },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'event'
      }
    },
    { $unwind: '$event' },
    {
      $project: {
        _id: 0,
        event: {
          _id: '$event._id',
          title: '$event.title',
          startDate: '$event.startDate',
          venue: '$event.venue',
          imageCover: '$event.imageCover'
        },
        averageRating: { $round: ['$averageRating', 2] },
        reviewCount: 1,
        lastReview: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: topEvents.length,
    data: {
      events: topEvents
    }
  });
});

// Helper function to update event rating stats
const updateEventRatingStats = async (eventId) => {
  const stats = await Review.aggregate([
    {
      $match: { 
        event: new mongoose.Types.ObjectId(eventId),
        isActive: true 
      }
    },
    {
      $group: {
        _id: '$event',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        n5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        n4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        n3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        n2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        n1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
      ratings: {
        5: stats[0].n5,
        4: stats[0].n4,
        3: stats[0].n3,
        2: stats[0].n2,
        1: stats[0].n1
      }
    });
  }
};

// getEventReviewStats is already defined above, removing duplicate

// Export all controller functions
export {
  setReviewUserData,
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  reportReview,
  getReportedReviews,
  resolveReport,
  getReviewStats,
  getTopRatedEvents,
  getEventRatingStats,
  getEventReviewStats,
  markHelpful,
  getMyReviewForEvent
};
