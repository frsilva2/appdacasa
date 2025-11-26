import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o diretório de assets
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(__dirname, '../../../../Emporio-Tecidos-Assets');
const CORES_METADATA_PATH = path.join(ASSETS_PATH, 'cores', 'cores-metadata.json');
const CORES_FOTOS_PATH = path.join(ASSETS_PATH, 'cores', 'fotos');

/**
 * @route   GET /api/cores
 * @desc    Listar todas as cores aprovadas
 * @access  Public
 */
export const getCores = async (req, res) => {
  try {
    // Ler o arquivo JSON de cores
    const coresData = await fs.readFile(CORES_METADATA_PATH, 'utf-8');
    const cores = JSON.parse(coresData);

    res.json({
      success: true,
      data: cores,
      message: 'Cores recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar cores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cores',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/cores/:id
 * @desc    Buscar uma cor específica por ID
 * @access  Public
 */
export const getCorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ler o arquivo JSON de cores
    const coresData = await fs.readFile(CORES_METADATA_PATH, 'utf-8');
    const cores = JSON.parse(coresData);

    // Buscar cor por ID
    const cor = cores.aprovadas.find(c => c.id === parseInt(id));

    if (!cor) {
      return res.status(404).json({
        success: false,
        message: 'Cor não encontrada'
      });
    }

    res.json({
      success: true,
      data: cor,
      message: 'Cor recuperada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar cor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cor',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/cores/search
 * @desc    Buscar cores por nome
 * @access  Public
 */
export const searchCores = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca "q" é obrigatório'
      });
    }

    // Ler o arquivo JSON de cores
    const coresData = await fs.readFile(CORES_METADATA_PATH, 'utf-8');
    const cores = JSON.parse(coresData);

    // Buscar cores que contenham o termo no nome
    const resultados = cores.aprovadas.filter(cor =>
      cor.nome_cor.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        total: resultados.length,
        cores: resultados
      },
      message: `${resultados.length} cores encontradas`
    });
  } catch (error) {
    console.error('Erro ao buscar cores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cores',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/cores/fotos
 * @desc    Listar todas as fotos de cores disponíveis
 * @access  Public
 */
export const getFotosCores = async (req, res) => {
  try {
    // Ler o diretório de fotos
    const arquivos = await fs.readdir(CORES_FOTOS_PATH);

    // Filtrar apenas imagens (jpg, jpeg, png)
    const fotos = arquivos.filter(arquivo =>
      /\.(jpg|jpeg|png)$/i.test(arquivo)
    );

    // Criar URLs completas para as fotos
    const fotosComUrl = fotos.map(foto => ({
      nome: foto,
      url: `/assets/cores/fotos/${foto}`
    }));

    res.json({
      success: true,
      data: {
        total: fotosComUrl.length,
        fotos: fotosComUrl
      },
      message: 'Fotos recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar fotos',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/cores/hex/:hex
 * @desc    Buscar cor por código hexadecimal
 * @access  Public
 */
export const getCorByHex = async (req, res) => {
  try {
    let { hex } = req.params;

    // Remover # se existir e adicionar de volta
    hex = hex.replace('#', '');
    hex = `#${hex.toUpperCase()}`;

    // Ler o arquivo JSON de cores
    const coresData = await fs.readFile(CORES_METADATA_PATH, 'utf-8');
    const cores = JSON.parse(coresData);

    // Buscar cor por hex
    const cor = cores.aprovadas.find(c => c.hex.toUpperCase() === hex);

    if (!cor) {
      return res.status(404).json({
        success: false,
        message: 'Cor não encontrada para o código hexadecimal fornecido'
      });
    }

    res.json({
      success: true,
      data: cor,
      message: 'Cor recuperada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar cor por hex:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cor',
      error: error.message
    });
  }
};
