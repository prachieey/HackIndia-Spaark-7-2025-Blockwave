import express from 'express';
import * as eventController from '../controllers/eventController.js';
import * as authController from '../controllers/authController.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// Re-route into review router
router.use('/:eventId/reviews', reviewRouter);

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);
router.get('/category/:category', eventController.getEventsByCategory);
router.get('/organizer/:organizerId', eventController.getEventsByOrganizer);

// Protected routes (require authentication)
router.use(authController.protect);

// User-specific routes
router.get('/me/registered', eventController.getMyRegisteredEvents);
router.get('/me/organizing', eventController.getMyOrganizedEvents);

// Organizer and Admin routes
router.use(authController.restrictTo('organizer', 'admin'));

router.post('/', eventController.createEvent);
router.patch('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

// Admin-only routes
router.use(authController.restrictTo('admin'));

router.get('/admin/all', eventController.adminGetAllEvents);
router.patch('/admin/:id/status', eventController.adminUpdateEventStatus);

export default router;
