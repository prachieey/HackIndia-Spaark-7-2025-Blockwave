import express from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { createDemoRequest, getAllDemoRequests } from '../controllers/demoRequestController.js';

const router = express.Router();

// Public route for submitting demo requests
router.post('/', createDemoRequest);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo('admin'));

// Get all demo requests (admin only)
router.get('/', getAllDemoRequests);

export default router;
