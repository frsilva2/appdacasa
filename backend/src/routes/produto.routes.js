import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllProdutos,
  getProdutoById,
  getEstoqueCD,
  getProdutosComEstoque,
  createProduto,
  updateProduto,
  deleteProduto,
} from '../controllers/produto.controller.js';

const router = express.Router();

// Rotas públicas (autenticadas)
router.get('/', authenticate, getAllProdutos);
router.get('/com-estoque', authenticate, getProdutosComEstoque);
router.get('/estoque', authenticate, getEstoqueCD);
router.get('/:id', authenticate, getProdutoById);

// Rotas admin
router.post('/', authenticate, createProduto);
router.put('/:id', authenticate, updateProduto);
router.delete('/:id', authenticate, deleteProduto);

export default router;
