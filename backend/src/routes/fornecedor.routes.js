import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from '../controllers/fornecedor.controller.js';

const router = express.Router();

// Rotas autenticadas
router.get('/', authenticate, getAllFornecedores);
router.get('/:id', authenticate, getFornecedorById);

// Rotas admin
router.post('/', authenticate, createFornecedor);
router.put('/:id', authenticate, updateFornecedor);
router.delete('/:id', authenticate, deleteFornecedor);

export default router;
