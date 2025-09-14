import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

// Public routes (no authentication required)
router.get('/event/:eventId', reviewController.getEventReviews);
router.get('/event/:eventId/stats', reviewController.getReviewStats);

// Protect all routes after this middleware
router.use(authController.protect);

// POST /events/eventId/reviews
// GET /events/eventId/reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setEventUserIds,
    reviewController.createReview
  );

// GET /reviews
router.get('/all', reviewController.getAllReviews);

// GET /reviews/me
router.get('/my-reviews', reviewController.getMyReviews);

// GET /event/:eventId/my-review
router.get('/event/:eventId/my-review', reviewController.getMyReviewForEvent);

// GET /reviews/:id
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

export default router;
