import api from './api';

/**
 * Serviço para gerenciar assets (cores, etiquetas, logos)
 */

// ==========================================
// CORES
// ==========================================

/**
 * Buscar todas as cores aprovadas
 * @returns {Promise} Lista de cores
 */
export const getCores = async () => {
  const response = await api.get('/cores');
  return response.data;
};

/**
 * Buscar uma cor específica por ID
 * @param {number} id - ID da cor
 * @returns {Promise} Dados da cor
 */
export const getCorById = async (id) => {
  const response = await api.get(`/cores/${id}`);
  return response.data;
};

/**
 * Buscar cores por nome
 * @param {string} query - Termo de busca
 * @returns {Promise} Cores encontradas
 */
export const searchCores = async (query) => {
  const response = await api.get('/cores/search', {
    params: { q: query }
  });
  return response.data;
};

/**
 * Buscar cor por código hexadecimal
 * @param {string} hex - Código hexadecimal (com ou sem #)
 * @returns {Promise} Dados da cor
 */
export const getCorByHex = async (hex) => {
  // Remover # se existir
  const hexClean = hex.replace('#', '');
  const response = await api.get(`/cores/hex/${hexClean}`);
  return response.data;
};

/**
 * Listar todas as fotos de cores
 * @returns {Promise} Lista de fotos
 */
export const getFotosCores = async () => {
  const response = await api.get('/cores/fotos');
  return response.data;
};

/**
 * Obter URL completa da foto de uma cor
 * @param {string} nomeArquivo - Nome do arquivo da foto
 * @returns {string} URL completa
 */
export const getUrlFotoCor = (nomeArquivo) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}/assets/cores/fotos/${nomeArquivo}`;
};

// ==========================================
// ETIQUETAS
// ==========================================

/**
 * Buscar todas as etiquetas
 * @returns {Promise} Lista de etiquetas
 */
export const getEtiquetas = async () => {
  const response = await api.get('/etiquetas');
  return response.data;
};

/**
 * Buscar uma etiqueta específica
 * @param {string} nome - Nome do arquivo da etiqueta
 * @returns {Promise} Dados da etiqueta
 */
export const getEtiqueta = async (nome) => {
  const response = await api.get(`/etiquetas/${nome}`);
  return response.data;
};

/**
 * Processar OCR em uma etiqueta existente
 * @param {string} nomeArquivo - Nome do arquivo da etiqueta
 * @returns {Promise} Resultado do OCR
 */
export const processarOCREtiqueta = async (nomeArquivo) => {
  const response = await api.post('/etiquetas/ocr', {
    etiqueta: nomeArquivo
  });
  return response.data;
};

/**
 * Upload e processamento OCR de nova etiqueta
 * @param {File} arquivo - Arquivo de imagem
 * @returns {Promise} Resultado do OCR
 */
export const uploadEProcessarOCR = async (arquivo) => {
  const formData = new FormData();
  formData.append('etiqueta', arquivo);

  const response = await api.post('/etiquetas/ocr', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Obter URL completa de uma etiqueta
 * @param {string} nomeArquivo - Nome do arquivo da etiqueta
 * @returns {string} URL completa
 */
export const getUrlEtiqueta = (nomeArquivo) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseURL}/assets/etiquetas/${nomeArquivo}`;
};

// ==========================================
// LOGOS
// ==========================================

/**
 * Obter URL do logo em formato específico
 * @param {string} formato - 'svg', 'png', '192', '512'
 * @returns {string} URL completa
 */
export const getUrlLogo = (formato = 'svg') => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const logos = {
    svg: 'logo.svg',
    png: 'logo.png',
    '192': 'logo-192.png',
    '512': 'logo-512.png'
  };

  const arquivo = logos[formato] || logos.svg;
  return `${baseURL}/assets/logo/${arquivo}`;
};

// ==========================================
// HELPERS
// ==========================================

/**
 * Verificar se uma cor é clara ou escura (para contraste de texto)
 * @param {string} hex - Código hexadecimal da cor
 * @returns {boolean} true se for clara, false se for escura
 */
export const isCorClara = (hex) => {
  // Remover # se existir
  hex = hex.replace('#', '');

  // Converter para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calcular luminosidade
  const luminosidade = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminosidade > 0.5;
};

/**
 * Obter cor de texto ideal (preto ou branco) baseado na cor de fundo
 * @param {string} hexFundo - Código hexadecimal da cor de fundo
 * @returns {string} '#000000' ou '#FFFFFF'
 */
export const getCorTextoContraste = (hexFundo) => {
  return isCorClara(hexFundo) ? '#000000' : '#FFFFFF';
};

export default {
  // Cores
  getCores,
  getCorById,
  searchCores,
  getCorByHex,
  getFotosCores,
  getUrlFotoCor,

  // Etiquetas
  getEtiquetas,
  getEtiqueta,
  processarOCREtiqueta,
  uploadEProcessarOCR,
  getUrlEtiqueta,

  // Logos
  getUrlLogo,

  // Helpers
  isCorClara,
  getCorTextoContraste
};
