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
 * Padrões flexíveis para lidar com erros de OCR
 */
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,
    cor: null,
    codigoCor: null,
    metragem: null
  };

  console.log('=== EXTRAINDO INFORMAÇÕES DA ETIQUETA ===');
  console.log('Texto OCR recebido:');
  console.log(texto);
  console.log('---');

  // Normalizar texto: remover caracteres estranhos do OCR
  const textoNormalizado = texto
    .replace(/[|]/g, 'I')  // OCR confunde | com I
    .replace(/[0O]/g, (m) => m)  // Manter como está
    .replace(/\r/g, '\n');  // Normalizar quebras de linha

  // ============================================
  // 1. EXTRAIR PRODUTO (múltiplos padrões)
  // ============================================
  const padroesProduto = [
    // Padrão 1: "PRODUTO: texto" ou "PRODUTO texto"
    /prod[uú]to[\s:]*([A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|cor|COR|$)/gi,
    // Padrão 2: "CÓDIGO - NOME" (ex: "334103 - OXFORD...")
    /(\d{5,6})\s*[-–]\s*([A-ZÀ-Ú0-9\s\.,/%]+?)(?=\n|cor|COR|$)/gi,
    // Padrão 3: Linha que começa com OXFORD, TACTEL, CREPE, etc
    /^((?:OXFORD|TACTEL|CREPE|CETIM|MALHA|TRICOLINE|VISCOLYCRA|LINHO|SARJA|BRIM|JEANS)[A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|$)/gim,
    // Padrão 4: Qualquer texto após número de 6 dígitos
    /\d{6}[^\n]*?([A-Z]{3,}[A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|cor|COR|$)/gi
  ];

  for (const padrao of padroesProduto) {
    const match = padrao.exec(textoNormalizado);
    if (match) {
      // Pegar o grupo correto (último grupo com texto)
      const resultado = match[match.length - 1] || match[1];
      if (resultado && resultado.trim().length > 3) {
        info.produto = resultado.replace(/\s+/g, ' ').trim();
        console.log('PRODUTO encontrado (padrão):', info.produto);
        break;
      }
    }
  }

  // ============================================
  // 2. EXTRAIR COR (múltiplos padrões)
  // ============================================
  const padroesCor = [
    // Padrão 1: "COR: #00901 PRATA" ou "COR:#814 - CAPUCCINO"
    /cor[\s:]*#?(\d{2,5})\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|po:|seq|$)/gi,
    // Padrão 2: "COR: NOME" (sem código)
    /cor[\s:]+([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|$)/gi,
    // Padrão 3: "#00502 AMARELO" (código e nome na mesma linha)
    /#(\d{2,5})\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|$)/gi,
    // Padrão 4: Linha com código 5 dígitos seguido de nome de cor
    /(\d{5})\s+([A-ZÀ-Ú]{3,}[A-ZÀ-Úa-zà-ú\s]*)(?=\n|$)/gi
  ];

  for (const padrao of padroesCor) {
    const match = padrao.exec(textoNormalizado);
    if (match) {
      if (match[2]) {
        // Tem código e nome
        info.codigoCor = match[1].trim();
        info.cor = match[2].trim().toUpperCase();
      } else if (match[1]) {
        // Só tem nome
        info.cor = match[1].trim().toUpperCase();
      }
      if (info.cor && info.cor.length > 2) {
        console.log('COR encontrada:', info.codigoCor ? `#${info.codigoCor} ${info.cor}` : info.cor);
        break;
      }
    }
  }

  // ============================================
  // 3. EXTRAIR METRAGEM (múltiplos padrões)
  // ============================================
  const padroesMetragem = [
    // Padrão 1: "METRAGEM: 66,00 MT" ou "MEDIDA: 59,00 MT"
    /(?:metragem|medida)[\s:]*(\d+[\.,]\d{1,2})\s*(?:mt|m|metros?)?/gi,
    // Padrão 2: "XX,XX MT" ou "XX.XX MT" (em qualquer lugar)
    /(\d{2,3}[\.,]\d{1,2})\s*(?:mt|m)\b/gi,
    // Padrão 3: "XX,XX" seguido de MT em outra linha
    /(\d{2,3}[\.,]\d{1,2})[\s\n]*mt/gi,
    // Padrão 4: Número no formato XX,XX perto de "MT" ou "metros"
    /(\d+[\.,]\d{2})\s*(?:mt|metros?|m\b)/gi
  ];

  for (const padrao of padroesMetragem) {
    const match = padrao.exec(textoNormalizado);
    if (match && match[1]) {
      const valor = match[1].replace(',', '.');
      const numero = parseFloat(valor);
      // Validar: metragem típica é entre 1 e 500 metros
      if (numero >= 1 && numero <= 500) {
        info.metragem = valor;
        console.log('METRAGEM encontrada:', info.metragem, 'MT');
        break;
      }
    }
  }

  // ============================================
  // FALLBACK: Busca genérica se não encontrou
  // ============================================

  // Se não encontrou produto, tentar pegar a primeira linha significativa
  if (!info.produto) {
    const linhas = textoNormalizado.split('\n').filter(l => l.trim().length > 5);
    for (const linha of linhas) {
      // Ignorar linhas que parecem ser cabeçalhos ou códigos
      if (!/^(eurotextil|cnpj|data|hora|seq|po:)/i.test(linha) && /[A-Z]{4,}/i.test(linha)) {
        info.produto = linha.replace(/\s+/g, ' ').trim().substring(0, 100);
        console.log('PRODUTO (fallback):', info.produto);
        break;
      }
    }
  }

  // Se não encontrou metragem, buscar qualquer número no formato XX,XX
  if (!info.metragem) {
    const matchNum = /(\d{2,3}[\.,]\d{2})/g.exec(textoNormalizado);
    if (matchNum) {
      const valor = matchNum[1].replace(',', '.');
      const numero = parseFloat(valor);
      if (numero >= 10 && numero <= 200) {
        info.metragem = valor;
        console.log('METRAGEM (fallback genérico):', info.metragem);
      }
    }
  }

  console.log('=== RESULTADO FINAL ===');
  console.log('Produto:', info.produto || 'NÃO ENCONTRADO');
  console.log('Cor:', info.cor ? (info.codigoCor ? `#${info.codigoCor} ${info.cor}` : info.cor) : 'NÃO ENCONTRADA');
  console.log('Metragem:', info.metragem ? `${info.metragem} MT` : 'NÃO ENCONTRADA');

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
