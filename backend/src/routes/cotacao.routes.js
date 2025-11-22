import express from 'express';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Placeholder - será implementado
router.get('/', authenticate, (req, res) => {
  res.json({ success: true, data: [], message: 'Em desenvolvimento' });
});

export default router;
