import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} from '../controllers/user.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Todas as rotas de usuário requerem autenticação e permissão de admin
router.use(authenticate);
router.use(isAdmin);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

// POST /api/users - Create user
router.post('/', createUser);

// PUT /api/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', deleteUser);

// PATCH /api/users/:id/toggle-active - Toggle user active status
router.patch('/:id/toggle-active', toggleUserActive);

export default router;
