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

// Rotas autenticadas (CD/Admin)
router.get('/', authenticate, getAllCotacoes);
router.get('/:id', authenticate, getCotacaoById);
router.post('/', authenticate, createCotacao);
router.post('/:id/fechar', authenticate, fecharCotacao);
router.post('/:id/aprovar', authenticate, aprovarFornecedor);
router.delete('/:id', authenticate, cancelarCotacao);

// Rotas públicas (fornecedor com token)
router.get('/public/:token', getCotacaoByToken);
router.post('/public/:token/responder', responderCotacao);

export default router;
