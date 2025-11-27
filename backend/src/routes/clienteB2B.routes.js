import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  createOrGetClienteB2B,
  getAllClientes,
  getClienteById,
  aprovarCliente,
  desativarCliente
} from '../controllers/clienteB2B.controller.js';

const router = express.Router();

// Rota pública - Criar ou buscar cliente B2B
router.post('/', createOrGetClienteB2B);

// Rotas admin - Gerenciar clientes
router.get('/', authenticate, getAllClientes);
router.get('/:id', authenticate, getClienteById);
router.post('/:id/aprovar', authenticate, aprovarCliente);
router.post('/:id/desativar', authenticate, desativarCliente);

export default router;
