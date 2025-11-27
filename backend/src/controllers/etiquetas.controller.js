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
 */
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,
    cor: null,
    quantidade: null,
    metragem: null,
    fornecedor: null,
    codigo: null,
    preco: null
  };

  // Padrões comuns em etiquetas de tecidos
  const padroes = {
    metragem: /(\d+[\.,]?\d*)\s*(m|metros?)/gi,
    quantidade: /qtd?:?\s*(\d+)/gi,
    preco: /r\$?\s*(\d+[\.,]?\d{2})/gi,
    codigo: /c[óo]d(?:igo)?:?\s*(\w+)/gi
  };

  // Tentar extrair metragem
  const matchMetragem = padroes.metragem.exec(texto);
  if (matchMetragem) {
    info.metragem = matchMetragem[1].replace(',', '.');
  }

  // Tentar extrair quantidade
  const matchQuantidade = padroes.quantidade.exec(texto);
  if (matchQuantidade) {
    info.quantidade = parseInt(matchQuantidade[1]);
  }

  // Tentar extrair preço
  const matchPreco = padroes.preco.exec(texto);
  if (matchPreco) {
    info.preco = matchPreco[1].replace(',', '.');
  }

  // Tentar extrair código
  const matchCodigo = padroes.codigo.exec(texto);
  if (matchCodigo) {
    info.codigo = matchCodigo[1];
  }

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
