import express from 'express';
import {
  getEtiquetas,
  getEtiqueta,
  processarOCR,
  uploadMiddleware
} from '../controllers/etiquetas.controller.js';

const router = express.Router();

/**
 * @route   GET /api/etiquetas
 * @desc    Listar todas as etiquetas disponíveis
 * @access  Public
 */
router.get('/', getEtiquetas);

/**
 * @route   POST /api/etiquetas/ocr
 * @desc    Processar OCR em uma etiqueta
 *          - Enviar arquivo: multipart/form-data com campo "etiqueta"
 *          - Usar existente: JSON com { "etiqueta": "nome-do-arquivo.jpg" }
 * @access  Public
 */
router.post('/ocr', uploadMiddleware, processarOCR);

/**
 * @route   GET /api/etiquetas/:nome
 * @desc    Buscar uma etiqueta específica por nome
 * @access  Public
 */
router.get('/:nome', getEtiqueta);

export default router;
