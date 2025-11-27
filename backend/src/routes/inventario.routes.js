import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  getAllInventarios,
  getInventarioById,
  createInventario,
  adicionarItem,
  atualizarItem,
  removerItem,
  finalizarInventario,
  cancelarInventario,
  processarOCR,
  getDEPARA,
  createDEPARA,
  updateDEPARA,
} from '../controllers/inventario.controller.js';

const router = express.Router();

// Rotas de Inventário
router.get('/', authenticate, getAllInventarios);
router.get('/:id', authenticate, getInventarioById);
router.post('/', authenticate, createInventario);
router.post('/:id/items', authenticate, adicionarItem);
router.put('/items/:itemId', authenticate, atualizarItem);
router.delete('/items/:itemId', authenticate, removerItem);
router.post('/:id/finalizar', authenticate, finalizarInventario);
router.post('/:id/cancelar', authenticate, cancelarInventario);

// OCR
router.post('/ocr/processar', authenticate, processarOCR);

// Sistema DEPARA
router.get('/depara/mapeamentos', authenticate, getDEPARA);
router.post('/depara/mapeamentos', authenticate, createDEPARA);
router.put('/depara/mapeamentos/:id', authenticate, updateDEPARA);

export default router;
