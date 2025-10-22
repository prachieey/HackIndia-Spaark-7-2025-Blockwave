import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Log all requests to auth routes
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/verify', authController.verifyToken);

// Protected routes (require authentication)
router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', authController.getMe, authController.getUser);

// Debug route to list all auth routes
router.get('/_routes', (req, res) => {
  const routes = [];
  router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json({ routes });
});

// Log all registered auth routes when the router is loaded
console.log('Auth routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`  ${Object.keys(r.route.methods).join(',').toUpperCase()} ${r.route.path}`);
  }
});

export default router;
