import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllRequisicoes,
  getRequisicaoById,
  createRequisicao,
  aprovarRequisicao,
  atenderRequisicao,
  marcarComoEnviada,
  deleteRequisicao,
} from '../controllers/requisicaoAbastecimento.controller.js';

const router = express.Router();

// Rotas para todos os usuários autenticados
router.get('/', authenticate, getAllRequisicoes);
router.get('/:id', authenticate, getRequisicaoById);

// Rotas para GERENTE_LOJA
router.post('/', authenticate, createRequisicao);
router.delete('/:id', authenticate, deleteRequisicao);

// Rotas para USUARIO_CD
router.post('/:id/aprovar', authenticate, aprovarRequisicao);
router.post('/:id/atender', authenticate, atenderRequisicao);
router.post('/:id/enviar', authenticate, marcarComoEnviada);

export default router;
