import express from 'express';
import {
  getDEPARA,
  searchDEPARA,
  buscarProdutoUnificado,
  getPrecos,
  getNotas,
  limparCache
} from '../controllers/depara.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/depara
 * @desc    Obter toda a tabela DEPARA
 * @access  Public
 */
router.get('/', getDEPARA);

/**
 * @route   GET /api/depara/search
 * @desc    Buscar produto na tabela DEPARA (query: ?q=termo)
 * @access  Public
 */
router.get('/search', searchDEPARA);

/**
 * @route   GET /api/depara/precos
 * @desc    Obter tabela de preços (Aba 1: FORNECEDOR-EMPORIO)
 * @access  Public
 */
router.get('/precos', getPrecos);

/**
 * @route   GET /api/depara/notas
 * @desc    Obter notas detalhadas (Aba 3)
 * @access  Public
 */
router.get('/notas', getNotas);

/**
 * @route   GET /api/depara/produto/:nomeFornecedor
 * @desc    Buscar produto unificado pelo nome do fornecedor
 * @access  Public
 */
router.get('/produto/:nomeFornecedor', buscarProdutoUnificado);

/**
 * @route   POST /api/depara/limpar-cache
 * @desc    Limpar cache do Excel (forçar releitura) - Requer autenticação
 * @access  Private (Admin)
 */
router.post('/limpar-cache', authenticate, limparCache);

export default router;
