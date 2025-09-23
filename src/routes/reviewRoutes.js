import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

// Public routes (no authentication required)
router.get('/event/:eventId', reviewController.getEventReviews);
router.get('/event/:eventId/stats', reviewController.getEventReviewStats);

// Protect all routes after this middleware
router.use(authController.protect);

// POST /events/eventId/reviews
// GET /events/eventId/reviews
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setReviewUserData,
    reviewController.createReview
  );

// GET /reviews
router.get('/all', reviewController.getAllReviews);

// GET /reviews/me
router.get('/my-reviews', reviewController.getMyReviews);

// GET /event/:eventId/my-review
router.get('/event/:eventId/my-review', reviewController.getMyReviewForEvent);

// Helpful vote on a review
router.post(
  '/:id/helpful', 
  authController.protect,
  reviewController.markHelpful
);

// Report a review
router.post(
  '/:id/report', 
  authController.protect,
  reviewController.reportReview
);

// GET /reviews/:id
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.setReviewUserData,
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

export default router;
