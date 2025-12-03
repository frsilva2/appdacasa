import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o diretório de assets
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(__dirname, '../../../../Emporio-Tecidos-Assets');
const ETIQUETAS_PATH = path.join(ASSETS_PATH, 'etiquetas');

// Configuração do multer para upload de etiquetas
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(ETIQUETAS_PATH, 'uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'etiqueta-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

/**
 * @route   GET /api/etiquetas
 * @desc    Listar todas as etiquetas disponíveis
 * @access  Public
 */
export const getEtiquetas = async (req, res) => {
  try {
    // Ler o diretório de etiquetas
    const arquivos = await fs.readdir(ETIQUETAS_PATH);

    // Filtrar apenas imagens (jpg, jpeg, png)
    const etiquetas = arquivos
      .filter(arquivo => /\.(jpg|jpeg|png)$/i.test(arquivo))
      .map(arquivo => ({
        nome: arquivo,
        url: `/assets/etiquetas/${arquivo}`
      }));

    res.json({
      success: true,
      data: {
        total: etiquetas.length,
        etiquetas
      },
      message: 'Etiquetas recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar etiquetas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar etiquetas',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/etiquetas/:nome
 * @desc    Buscar uma etiqueta específica por nome
 * @access  Public
 */
export const getEtiqueta = async (req, res) => {
  try {
    const { nome } = req.params;
    const etiquetaPath = path.join(ETIQUETAS_PATH, nome);

    // Verificar se arquivo existe
    try {
      await fs.access(etiquetaPath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Etiqueta não encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        nome,
        url: `/assets/etiquetas/${nome}`
      },
      message: 'Etiqueta recuperada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar etiqueta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar etiqueta',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/etiquetas/ocr
 * @desc    Processar OCR em uma etiqueta (via upload ou nome de arquivo)
 * @access  Public
 */
export const processarOCR = async (req, res) => {
  try {
    let imagePath;
    let isUpload = false;

    // Verificar se é upload ou nome de arquivo existente
    if (req.file) {
      imagePath = req.file.path;
      isUpload = true;
    } else if (req.body.etiqueta) {
      imagePath = path.join(ETIQUETAS_PATH, req.body.etiqueta);

      // Verificar se arquivo existe
      try {
        await fs.access(imagePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Etiqueta não encontrada'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'É necessário enviar um arquivo ou especificar o nome da etiqueta'
      });
    }

    // Processar OCR com Tesseract
    const result = await Tesseract.recognize(
      imagePath,
      'por', // Português
      {
        logger: info => console.log(info)
      }
    );

    // Extrair informações relevantes
    const textoCompleto = result.data.text;
    const linhas = textoCompleto.split('\n').filter(linha => linha.trim());
    const palavras = result.data.words.map(word => ({
      texto: word.text,
      confianca: word.confidence
    }));

    // Tentar extrair informações estruturadas da etiqueta
    const informacoes = extrairInformacoesEtiqueta(textoCompleto);

    res.json({
      success: true,
      data: {
        arquivo: isUpload ? req.file.filename : req.body.etiqueta,
        url: isUpload ? `/assets/etiquetas/uploads/${req.file.filename}` : `/assets/etiquetas/${req.body.etiqueta}`,
        ocr: {
          textoCompleto,
          linhas,
          palavras,
          confiancaMedia: result.data.confidence,
          informacoesExtraidas: informacoes
        }
      },
      message: 'OCR processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar OCR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar OCR',
      error: error.message
    });
  }
};

/**
 * Função auxiliar para extrair informações estruturadas da etiqueta
 * Extrai apenas: PRODUTO, COR e METRAGEM
 * O nome do produto será buscado no DEPARA pelo frontend
 */
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,      // Nome do produto lido na etiqueta
    cor: null,          // Nome da cor lido na etiqueta
    codigoCor: null,    // Código da cor (#00901, #460, etc)
    metragem: null      // Metragem em metros
  };

  console.log('=== EXTRAINDO INFORMAÇÕES DA ETIQUETA ===');
  console.log('Texto OCR:', texto);

  // ============================================
  // 1. EXTRAIR PRODUTO
  // ============================================
  // Formato: "PRODUTO: OXFORD TINTO 1,50L 100% POLYESTER"
  // Formato: "334103 - OXFORD TINTO 1,50L 100% POLY ESTER"

  // Padrão 1: "PRODUTO: ..."
  let matchProduto = /produto[\s:]+([^\n]+)/gi.exec(texto);
  if (matchProduto) {
    info.produto = matchProduto[1].trim();
  }

  // Padrão 2: "CÓDIGO - NOME DO PRODUTO" (ex: "334103 - OXFORD TINTO...")
  if (!info.produto) {
    matchProduto = /\d{6}\s*[-–]\s*([A-ZÀ-Ú0-9\s\.,/%]+?)(?=\n|$)/gi.exec(texto);
    if (matchProduto) {
      info.produto = matchProduto[1].trim();
    }
  }

  // Limpar produto: remover quebras e espaços extras
  if (info.produto) {
    info.produto = info.produto.replace(/\s+/g, ' ').trim();
    console.log('PRODUTO encontrado:', info.produto);
  }

  // ============================================
  // 2. EXTRAIR COR (código e nome)
  // ============================================
  // Formato: "COR: #00901 PRATA" ou "COR: #460 - RED" ou "COR:#814 - CAPUCCINO"

  const matchCor = /cor[\s:]*#(\d+)\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|po:|seq|$)/gi.exec(texto);
  if (matchCor) {
    info.codigoCor = matchCor[1].trim();
    info.cor = matchCor[2].trim().toUpperCase();
    console.log('COR encontrada:', `#${info.codigoCor} - ${info.cor}`);
  }

  // ============================================
  // 3. EXTRAIR METRAGEM
  // ============================================
  // Formato: "METRAGEM: 66,00 MT" ou "MEDIDA: 59,00 MT"

  const matchMetragem = /(?:metragem|medida)[\s:]*(\d+[\.,]\d{2})\s*(?:mt|m)?/gi.exec(texto);
  if (matchMetragem) {
    info.metragem = matchMetragem[1].replace(',', '.');
    console.log('METRAGEM encontrada:', info.metragem, 'MT');
  }

  // Fallback: tentar encontrar padrão "XX,XX MT" ou "XX.XX MT"
  if (!info.metragem) {
    const matchMetragemAlt = /(\d+[\.,]\d{2})\s*mt\b/gi.exec(texto);
    if (matchMetragemAlt) {
      info.metragem = matchMetragemAlt[1].replace(',', '.');
      console.log('METRAGEM (fallback) encontrada:', info.metragem, 'MT');
    }
  }

  console.log('=== RESULTADO FINAL ===');
  console.log('Produto:', info.produto || 'NÃO ENCONTRADO');
  console.log('Cor:', info.cor ? `#${info.codigoCor} ${info.cor}` : 'NÃO ENCONTRADA');
  console.log('Metragem:', info.metragem ? `${info.metragem} MT` : 'NÃO ENCONTRADA');

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
