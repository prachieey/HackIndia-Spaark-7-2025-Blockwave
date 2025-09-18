import express from 'express';
import * as ticketController from '../controllers/ticketController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Debug middleware to log all incoming requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

console.log('Ticket routes initialized with the following endpoints:');
console.log('  GET    /api/v1/tickets/my-tickets');
console.log('  POST   /api/v1/tickets/purchase');
console.log('  GET    /api/v1/tickets/event/:eventId/all (organizer+admin)');
console.log('  GET    /api/v1/tickets/:id/validate');
console.log('  PATCH  /api/v1/tickets/:id/transfer');
console.log('  PATCH  /api/v1/tickets/:id/verify');
console.log('  GET    /api/v1/tickets/:id');
console.log('  GET    /api/v1/tickets/ (admin)');
console.log('  DELETE /api/v1/tickets/:id (admin)');

// Public routes
router.get('/event/:eventId', ticketController.getTicketsForEvent);

// Protected routes (require authentication)
router.use(authController.protect);

// =====================================
// USER ROUTES
// =====================================
// These routes must come before any parameterized routes to avoid conflicts

// Get current user's tickets - must come before any :id routes
router.route('/my-tickets')
  .get(ticketController.getMyTickets);

// Purchase a new ticket
router.route('/purchase')
  .post(ticketController.purchaseTicket);

// =====================================
// ORGANIZER & ADMIN ROUTES
// =====================================
router.use(authController.restrictTo('organizer', 'admin'));

// Get all tickets for a specific event (organizer view)
router.route('/event/:eventId/all')
  .get(ticketController.getAllTicketsForEvent);

// =====================================
// TICKET OPERATIONS
// =====================================
// These are parameterized routes that should come after specific routes

// Validate a ticket
router.route('/:id/validate')
  .get(ticketController.validateTicket);

// Transfer a ticket
router.route('/:id/transfer')
  .patch(ticketController.transferTicket);

// Verify a ticket
router.route('/:id/verify')
  .patch(ticketController.verifyTicket);

// Get a specific ticket
router.route('/:id')
  .get(ticketController.getTicket);

// =====================================
// ADMIN-ONLY ROUTES
// =====================================
router.use(authController.restrictTo('admin'));

// Get all tickets (admin only)
router.route('/')
  .get(ticketController.getAllTickets);

// Delete/void a ticket (admin only)
router.route('/:id')
  .delete(ticketController.voidTicket);

export default router;
