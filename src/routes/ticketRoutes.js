import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.get('/event/:eventId', ticketController.getTicketsForEvent);
router.get('/:id', ticketController.getTicket);

// Protected routes (require authentication)
router.use(authController.protect);

// User-specific routes
router.get('/my-tickets', ticketController.getMyTickets);
router.post('/purchase', ticketController.purchaseTicket);
router.patch('/:id/transfer', ticketController.transferTicket);
router.get('/:id/validate', ticketController.validateTicket);

// Organizer and Admin routes
router.use(authController.restrictTo('organizer', 'admin'));

router.get('/event/:eventId/all', ticketController.getAllTicketsForEvent);
router.patch('/:id/verify', ticketController.verifyTicket);

// Admin-only routes
router.use(authController.restrictTo('admin'));

router.get('/', ticketController.getAllTickets);
router.delete('/:id', ticketController.voidTicket);

export default router;
