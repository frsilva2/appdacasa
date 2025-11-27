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
  adicionarCor,
  adicionarCoresEmLote,
  removerCor,
  getCoresDisponiveis,
} from '../controllers/produto.controller.js';

const router = express.Router();

// Rotas públicas (autenticadas)
router.get('/cores/disponiveis', authenticate, getCoresDisponiveis); // ANTES das rotas com :id
router.get('/com-estoque', authenticate, getProdutosComEstoque);
router.get('/estoque', authenticate, getEstoqueCD);
router.get('/', authenticate, getAllProdutos);
router.get('/:id', authenticate, getProdutoById);

// Rotas admin - CRUD produtos
router.post('/', authenticate, createProduto);
router.put('/:id', authenticate, updateProduto);
router.delete('/:id', authenticate, deleteProduto);

// Rotas admin - Gerenciamento de cores
router.post('/:produtoId/cores', authenticate, adicionarCor);
router.post('/:produtoId/cores/lote', authenticate, adicionarCoresEmLote);
router.delete('/cores/:corId', authenticate, removerCor);

export default router;
