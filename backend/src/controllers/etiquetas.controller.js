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
 * Otimizado para etiquetas EUROTEXTIL e formatos similares
 */
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,
    cor: null,
    codigoCor: null,
    quantidade: null,
    metragem: null,
    fornecedor: null,
    codigo: null,
    preco: null,
    lote: null,
    po: null,
    seq: null,
    desenho: null
  };

  // Normalizar texto para facilitar extração
  const textoNormalizado = texto.toLowerCase();
  const textoOriginal = texto;

  console.log('=== EXTRAINDO INFORMAÇÕES DA ETIQUETA ===');
  console.log('Texto original:', textoOriginal);

  // ============================================
  // PADRÕES ESPECÍFICOS PARA EUROTEXTIL
  // ============================================

  // METRAGEM: "METRAGEM: 66,00 MT" ou "MEDIDA: 59,00 MT" ou "50,00 MT"
  const padraoMetragemEurotextil = /(?:metragem|medida)[\s:]*(\d+[\.,]\d{2})\s*(?:mt|m)/gi;
  let matchMetragem = padraoMetragemEurotextil.exec(texto);
  if (matchMetragem) {
    info.metragem = matchMetragem[1].replace(',', '.');
    console.log('Metragem EUROTEXTIL encontrada:', info.metragem);
  }

  // COR: "COR: #00901 PRATA" ou "COR: #460 - RED" ou "COR: #814 - CAPUCCINO"
  const padraoCorEurotextil = /cor[\s:]*#(\d+)\s*[-\s]*([A-ZÀ-Úa-zà-ú]+)/gi;
  let matchCor = padraoCorEurotextil.exec(texto);
  if (matchCor) {
    info.codigoCor = matchCor[1];
    info.cor = matchCor[2].trim().toUpperCase();
    console.log('Cor EUROTEXTIL encontrada:', info.codigoCor, '-', info.cor);
  }

  // PRODUTO: "PRODUTO: OXFORD TINTO 1,50L 100% POLYESTER" ou "334103 - OXFORD TINTO..."
  const padraoProdutoEurotextil = /(?:produto[\s:]*|(\d{6})\s*[-–]\s*)([A-ZÀ-Ú0-9\s\.,/%]+?)(?=\n|cor:|metragem|medida|po:|$)/gi;
  let matchProduto = padraoProdutoEurotextil.exec(texto);
  if (matchProduto) {
    if (matchProduto[1]) {
      info.codigo = matchProduto[1]; // Código do produto (334103)
    }
    info.produto = matchProduto[2].trim().replace(/\s+/g, ' ');
    console.log('Produto EUROTEXTIL encontrado:', info.codigo, '-', info.produto);
  }

  // PO (Purchase Order): "PO: 242494"
  const padraoPO = /po[\s:]*(\d+)/gi;
  let matchPO = padraoPO.exec(texto);
  if (matchPO) {
    info.po = matchPO[1];
    console.log('PO encontrado:', info.po);
  }

  // SEQ (Sequência): "SEQ: 939" ou "SEQ.: 1918"
  const padraoSEQ = /seq[\s.:]*(\d+)/gi;
  let matchSEQ = padraoSEQ.exec(texto);
  if (matchSEQ) {
    info.seq = matchSEQ[1];
    console.log('SEQ encontrado:', info.seq);
  }

  // DESENHO: "DESENHO: #0SDE" ou "DESENHO: #0"
  const padraoDesenho = /desenho[\s:]*#?([A-Z0-9]+)/gi;
  let matchDesenho = padraoDesenho.exec(texto);
  if (matchDesenho) {
    info.desenho = matchDesenho[1];
    console.log('Desenho encontrado:', info.desenho);
  }

  // Código de barras no formato EUROTEXTIL: "0000000334103.000066000.000SDE901"
  const padraoCodigoBarras = /(\d{13})\.(\d{9})\.(\d{3})([A-Z0-9]+)/gi;
  let matchCodigoBarras = padraoCodigoBarras.exec(texto);
  if (matchCodigoBarras) {
    // Extrair código do produto dos primeiros dígitos (334103)
    const codigoCompleto = matchCodigoBarras[1];
    const codigoProduto = codigoCompleto.replace(/^0+/, '').substring(0, 6);
    if (!info.codigo && codigoProduto) {
      info.codigo = codigoProduto;
      console.log('Código extraído do código de barras:', info.codigo);
    }
  }

  // ============================================
  // PADRÕES GENÉRICOS (FALLBACK)
  // ============================================

  // Se não encontrou metragem com padrão EUROTEXTIL, tentar padrões genéricos
  if (!info.metragem) {
    const padroesMetragemGenericos = [
      /(\d+[\.,]\d{2})\s*(?:mt|m)\b/gi,
      /(?:metragem|medida|mt|mts)[\s:]*(\d+[\.,]?\d*)/gi,
      /(\d+[\.,]?\d*)\s*(?:metros?)\b/gi
    ];

    for (const padrao of padroesMetragemGenericos) {
      const match = padrao.exec(texto);
      if (match) {
        info.metragem = match[1].replace(',', '.');
        console.log('Metragem genérica encontrada:', info.metragem);
        break;
      }
      padrao.lastIndex = 0;
    }
  }

  // Se não encontrou cor, tentar padrões genéricos e cores conhecidas
  if (!info.cor) {
    const coresConhecidas = [
      // Cores básicas
      'branco', 'preto', 'azul', 'vermelho', 'verde', 'amarelo', 'rosa',
      'roxo', 'laranja', 'marrom', 'cinza', 'bege', 'nude', 'vinho',
      'prata', 'dourado', 'gold', 'silver', 'red', 'blue', 'green',
      // Cores EUROTEXTIL específicas
      'titanio', 'titânio', 'ferrugem', 'capuccino', 'cappuccino',
      'maça verde', 'maca verde', 'maçã verde',
      // Tons de azul
      'azul marinho', 'azul royal', 'azul celeste', 'azul bebê',
      // Tons de verde
      'verde musgo', 'verde militar', 'verde água', 'verde limão',
      // Tons de rosa
      'rosa bebê', 'rosa pink', 'rosa claro', 'rosa escuro',
      // Tons de vermelho/marrom
      'vermelho escuro', 'vermelho vivo', 'bordô', 'marsala',
      // Neutros e outros
      'off white', 'off-white', 'cru', 'natural', 'black', 'white',
      'caramelo', 'chocolate', 'café', 'caqui', 'khaki', 'mostarda'
    ];

    for (const cor of coresConhecidas) {
      if (textoNormalizado.includes(cor.toLowerCase())) {
        info.cor = cor.charAt(0).toUpperCase() + cor.slice(1);
        console.log('Cor identificada por lista:', info.cor);
        break;
      }
    }
  }

  // Se não encontrou produto, tentar padrões genéricos
  if (!info.produto) {
    const padraoProdutoGenerico = /(?:produto|tecido|material|desc)[\s:]+([A-ZÀ-Ú0-9\s\.,/%]+?)(?:\n|$)/gi;
    const matchProdutoGen = padraoProdutoGenerico.exec(texto);
    if (matchProdutoGen) {
      info.produto = matchProdutoGen[1].trim();
      console.log('Produto genérico encontrado:', info.produto);
    }
  }

  // Código genérico: "Cód: ABC123", "REF: 12345"
  if (!info.codigo) {
    const padraoCodigoGenerico = /(?:c[oó]d(?:igo)?|ref|sku)[\s.:]*([A-Z0-9\-]+)/gi;
    const matchCodigoGen = padraoCodigoGenerico.exec(texto);
    if (matchCodigoGen) {
      info.codigo = matchCodigoGen[1].toUpperCase();
      console.log('Código genérico encontrado:', info.codigo);
    }
  }

  // Preço: "R$ 45,90"
  const padraoPreco = /r\$\s*(\d+[\.,]\d{2})/gi;
  const matchPreco = padraoPreco.exec(texto);
  if (matchPreco) {
    info.preco = matchPreco[1].replace(',', '.');
    console.log('Preço encontrado:', info.preco);
  }

  // Quantidade: "Qtd: 5"
  const padraoQtd = /(?:qtd|qt|quantidade)[\s:]*(\d+)/gi;
  const matchQtd = padraoQtd.exec(texto);
  if (matchQtd) {
    info.quantidade = parseInt(matchQtd[1]);
    console.log('Quantidade encontrada:', info.quantidade);
  }

  // Lote: "LOTE: 12345"
  const padraoLote = /(?:lote|lt|batch)[\s.:]*([A-Z0-9\-]+)/gi;
  const matchLote = padraoLote.exec(texto);
  if (matchLote) {
    info.lote = matchLote[1].toUpperCase();
    console.log('Lote encontrado:', info.lote);
  }

  // Usar SEQ como lote se não tiver lote
  if (!info.lote && info.seq) {
    info.lote = `SEQ-${info.seq}`;
  }

  // Usar PO + SEQ como código único se disponível
  if (info.po && info.seq && !info.lote) {
    info.lote = `${info.po}-${info.seq}`;
  }

  console.log('=== INFORMAÇÕES EXTRAÍDAS ===');
  console.log(info);

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
