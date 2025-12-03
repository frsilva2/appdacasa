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
    preco: null,
    lote: null
  };

  // Normalizar texto para facilitar extração
  const textoNormalizado = texto.toLowerCase();
  const textoOriginal = texto;

  console.log('=== EXTRAINDO INFORMAÇÕES DA ETIQUETA ===');
  console.log('Texto original:', textoOriginal);

  // Padrões mais flexíveis para etiquetas de tecidos
  const padroes = {
    // Metragem: "100m", "100 m", "100 metros", "100,5m", "100.5 m", "MT: 100", "METRAGEM: 100"
    metragem: [
      /(?:metragem|mt|mts|metros?)[\s:]*(\d+[\.,]?\d*)/gi,
      /(\d+[\.,]?\d*)\s*(?:m|metros?|mts)\b/gi,
      /(\d{2,4}[\.,]?\d{0,2})\s*m\b/gi
    ],
    // Quantidade: "Qtd: 5", "QTD 10", "quantidade: 3", "pcs: 2", "peças: 4"
    quantidade: [
      /(?:qtd|qt|quantidade|pcs|pe[cç]as?)[\s:]*(\d+)/gi,
      /(\d+)\s*(?:un|und|unid|pcs|pe[cç]as?)/gi
    ],
    // Preço: "R$ 45,90", "R$100.00", "45,90", "VALOR: 100,00"
    preco: [
      /r\$\s*(\d+[\.,]\d{2})/gi,
      /(?:valor|pre[cç]o|vlr)[\s:]*r?\$?\s*(\d+[\.,]\d{2})/gi,
      /(\d+[\.,]\d{2})\s*(?:r\$|reais)/gi
    ],
    // Código: "Cód: ABC123", "codigo: XYZ", "REF: 12345", "SKU: ABC-123"
    codigo: [
      /(?:c[oó]d(?:igo)?|ref(?:er[eê]ncia)?|sku|art(?:igo)?)[\s.:]*([A-Z0-9\-]+)/gi,
      /\b([A-Z]{2,4}[\-]?\d{3,6})\b/g
    ],
    // Lote: "LOTE: 12345", "LT: ABC", "BATCH: XYZ"
    lote: [
      /(?:lote|lt|batch)[\s.:]*([A-Z0-9\-]+)/gi
    ],
    // Cor: "COR: AZUL", "cor azul", "BRANCO", procurar cores comuns
    cor: [
      /(?:cor)[\s:]+([A-ZÀ-Ú\s]+?)(?:\s|$|\n|,)/gi
    ],
    // Produto/Tecido: "TECIDO: ...", "PRODUTO: ...", "DESC: ..."
    produto: [
      /(?:tecido|produto|desc(?:ri[çc][aã]o)?|material)[\s:]+([A-ZÀ-Ú0-9\s]+?)(?:\n|$)/gi
    ]
  };

  // Cores comuns para tentar identificar no texto
  const coresConhecidas = [
    'branco', 'preto', 'azul', 'vermelho', 'verde', 'amarelo', 'rosa',
    'roxo', 'laranja', 'marrom', 'cinza', 'bege', 'nude', 'vinho',
    'azul marinho', 'azul royal', 'azul celeste', 'azul bebê',
    'verde musgo', 'verde militar', 'verde água', 'verde limão',
    'rosa bebê', 'rosa pink', 'rosa claro', 'rosa escuro',
    'vermelho escuro', 'vermelho vivo', 'bordô', 'marsala',
    'off white', 'off-white', 'cru', 'natural', 'caramelo',
    'terracota', 'salmão', 'coral', 'lilás', 'lavanda'
  ];

  // Tentar extrair metragem
  for (const padrao of padroes.metragem) {
    const match = padrao.exec(texto);
    if (match) {
      info.metragem = match[1].replace(',', '.');
      console.log('Metragem encontrada:', info.metragem);
      break;
    }
    padrao.lastIndex = 0; // Reset para próximo uso
  }

  // Tentar extrair quantidade
  for (const padrao of padroes.quantidade) {
    const match = padrao.exec(texto);
    if (match) {
      info.quantidade = parseInt(match[1]);
      console.log('Quantidade encontrada:', info.quantidade);
      break;
    }
    padrao.lastIndex = 0;
  }

  // Tentar extrair preço
  for (const padrao of padroes.preco) {
    const match = padrao.exec(texto);
    if (match) {
      info.preco = match[1].replace(',', '.');
      console.log('Preço encontrado:', info.preco);
      break;
    }
    padrao.lastIndex = 0;
  }

  // Tentar extrair código
  for (const padrao of padroes.codigo) {
    const match = padrao.exec(texto);
    if (match) {
      info.codigo = match[1].toUpperCase();
      console.log('Código encontrado:', info.codigo);
      break;
    }
    padrao.lastIndex = 0;
  }

  // Tentar extrair lote
  for (const padrao of padroes.lote) {
    const match = padrao.exec(texto);
    if (match) {
      info.lote = match[1].toUpperCase();
      console.log('Lote encontrado:', info.lote);
      break;
    }
    padrao.lastIndex = 0;
  }

  // Tentar identificar cor no texto
  for (const cor of coresConhecidas) {
    if (textoNormalizado.includes(cor)) {
      info.cor = cor.charAt(0).toUpperCase() + cor.slice(1);
      console.log('Cor identificada:', info.cor);
      break;
    }
  }

  // Tentar extrair cor por padrão
  if (!info.cor) {
    for (const padrao of padroes.cor) {
      const match = padrao.exec(texto);
      if (match) {
        info.cor = match[1].trim();
        console.log('Cor extraída por padrão:', info.cor);
        break;
      }
      padrao.lastIndex = 0;
    }
  }

  // Tentar extrair produto
  for (const padrao of padroes.produto) {
    const match = padrao.exec(texto);
    if (match) {
      info.produto = match[1].trim();
      console.log('Produto encontrado:', info.produto);
      break;
    }
    padrao.lastIndex = 0;
  }

  // Se não encontrou lote mas encontrou código, usar como lote
  if (!info.lote && info.codigo) {
    info.lote = info.codigo;
  }

  console.log('=== INFORMAÇÕES EXTRAÍDAS ===');
  console.log(info);

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
