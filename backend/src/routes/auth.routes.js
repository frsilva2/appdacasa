import express from 'express';
import { login, me, changePassword, resetPassword } from '../controllers/auth.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// POST /api/auth/login - Login
router.post('/login', authRateLimiter, login);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, me);

// POST /api/auth/change-password - Change own password
router.post('/change-password', authenticate, changePassword);

// POST /api/auth/reset-password - Reset user password (admin only)
router.post('/reset-password', authenticate, isAdmin, resetPassword);

export default router;
