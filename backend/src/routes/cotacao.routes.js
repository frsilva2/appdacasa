import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllCotacoes,
  getCotacaoById,
  createCotacao,
  getCotacaoByToken,
  responderCotacao,
  fecharCotacao,
  aprovarFornecedor,
  cancelarCotacao,
} from '../controllers/cotacao.controller.js';

const router = express.Router();

// ⚠️ IMPORTANTE: Rotas específicas DEVEM vir ANTES de rotas genéricas com :id
// Caso contrário, Express trata 'public' como um ID e aplica autenticação

// Rotas públicas (fornecedor com token) - PRIMEIRO
router.get('/public/:token', getCotacaoByToken);
router.post('/public/:token/responder', responderCotacao);

// Rotas autenticadas (CD/Admin) - DEPOIS
router.get('/', authenticate, getAllCotacoes);
router.get('/:id', authenticate, getCotacaoById);
router.post('/', authenticate, createCotacao);
router.post('/:id/fechar', authenticate, fecharCotacao);
router.post('/:id/aprovar', authenticate, aprovarFornecedor);
router.delete('/:id', authenticate, cancelarCotacao);

export default router;
