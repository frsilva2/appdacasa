import express from 'express';
import {
  getAllLojas,
  getLojaById,
  createLoja,
  updateLoja,
  deleteLoja,
} from '../controllers/loja.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/lojas - Get all lojas (autenticado)
router.get('/', authenticate, getAllLojas);

// GET /api/lojas/:id - Get loja by ID (autenticado)
router.get('/:id', authenticate, getLojaById);

// POST /api/lojas - Create loja (admin only)
router.post('/', authenticate, isAdmin, createLoja);

// PUT /api/lojas/:id - Update loja (admin only)
router.put('/:id', authenticate, isAdmin, updateLoja);

// DELETE /api/lojas/:id - Delete loja (admin only)
router.delete('/:id', authenticate, isAdmin, deleteLoja);

export default router;
