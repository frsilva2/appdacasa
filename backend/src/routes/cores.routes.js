import express from 'express';
import {
  getCores,
  getCorById,
  searchCores,
  getFotosCores,
  getCorByHex
} from '../controllers/cores.controller.js';

const router = express.Router();

/**
 * @route   GET /api/cores
 * @desc    Listar todas as cores aprovadas
 * @access  Public
 */
router.get('/', getCores);

/**
 * @route   GET /api/cores/search
 * @desc    Buscar cores por nome (query parameter: ?q=nome)
 * @access  Public
 */
router.get('/search', searchCores);

/**
 * @route   GET /api/cores/fotos
 * @desc    Listar todas as fotos de cores disponíveis
 * @access  Public
 */
router.get('/fotos', getFotosCores);

/**
 * @route   GET /api/cores/hex/:hex
 * @desc    Buscar cor por código hexadecimal (ex: /api/cores/hex/FFFFFF ou /api/cores/hex/%23FFFFFF)
 * @access  Public
 */
router.get('/hex/:hex', getCorByHex);

/**
 * @route   GET /api/cores/:id
 * @desc    Buscar uma cor específica por ID
 * @access  Public
 */
router.get('/:id', getCorById);

export default router;
