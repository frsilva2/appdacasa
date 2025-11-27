import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllPedidos,
  getPedidoById,
  createPedido,
  createPedidoPublico,
  aprovarPedido,
  recusarPedido,
  confirmarPagamento,
  iniciarSeparacao,
  marcarComoEnviado,
  marcarComoEntregue,
  cancelarPedido,
} from '../controllers/pedidoB2B.controller.js';

const router = express.Router();

// Rota pública - Criar pedido B2B (checkout)
router.post('/publico', createPedidoPublico);

// Rotas autenticadas - Todos os tipos de usuário
router.get('/', authenticate, getAllPedidos);
router.get('/:id', authenticate, getPedidoById);
router.post('/', authenticate, createPedido);

// Rotas de gerenciamento - Admin e Operador
router.post('/:id/aprovar', authenticate, aprovarPedido);
router.post('/:id/recusar', authenticate, recusarPedido);
router.post('/:id/confirmar-pagamento', authenticate, confirmarPagamento);
router.post('/:id/iniciar-separacao', authenticate, iniciarSeparacao);
router.post('/:id/enviar', authenticate, marcarComoEnviado);
router.post('/:id/entregar', authenticate, marcarComoEntregue);
router.post('/:id/cancelar', authenticate, cancelarPedido);

export default router;
