import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';
import multer from 'multer';
import { lerExcel } from './depara.controller.js';

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

    // Carregar lista de produtos do DEPARA
    let produtosDEPARA = [];
    try {
      const dadosExcel = await lerExcel();
      if (dadosExcel && dadosExcel.depara) {
        // Extrair nomes de produtos usando os cabeçalhos reais da planilha
        // Coluna A: "NOME PRODUTO FORNECEDOR"
        // Coluna B: "NOME PRODUTO EMPORIO"
        produtosDEPARA = dadosExcel.depara.map(item => {
          // Tentar com nomes exatos das colunas primeiro
          let nomeFornecedor = item['NOME PRODUTO FORNECEDOR'] || '';
          let nomeERP = item['NOME PRODUTO EMPORIO'] || '';

          // Fallback: buscar por colunas que contenham as palavras-chave
          if (!nomeFornecedor && !nomeERP) {
            const keys = Object.keys(item);
            for (const key of keys) {
              const keyUpper = key.toUpperCase();
              if (keyUpper.includes('FORNECEDOR') && !nomeFornecedor) {
                nomeFornecedor = item[key] || '';
              }
              if ((keyUpper.includes('EMPORIO') || keyUpper.includes('ERP')) && !nomeERP) {
                nomeERP = item[key] || '';
              }
            }
          }

          // Fallback final: usar primeiras duas colunas
          if (!nomeFornecedor && !nomeERP) {
            const keys = Object.keys(item);
            nomeFornecedor = item[keys[0]] || '';
            nomeERP = item[keys[1]] || '';
          }

          return { nomeFornecedor, nomeERP };
        }).filter(p => p.nomeFornecedor || p.nomeERP);

        console.log(`DEPARA carregado: ${produtosDEPARA.length} produtos`);
        if (produtosDEPARA.length > 0) {
          console.log('Exemplo:', JSON.stringify(produtosDEPARA[0]));
        }
      }
    } catch (err) {
      console.log('Aviso: Não foi possível carregar DEPARA:', err.message);
    }

    // Tentar extrair informações estruturadas da etiqueta
    const informacoes = extrairInformacoesEtiqueta(textoCompleto, produtosDEPARA);

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
 * ABORDAGEM: Normalização agressiva + busca por estrutura
 * Usa lista de produtos do DEPARA para identificação
 * @param {string} texto - Texto OCR bruto
 * @param {Array} produtosDEPARA - Lista de produtos do DEPARA [{nomeFornecedor, nomeERP}]
 */
function extrairInformacoesEtiqueta(texto, produtosDEPARA = []) {
  const info = {
    produto: null,
    cor: null,
    codigoCor: null,
    metragem: null
  };

  console.log('=== EXTRAINDO INFORMAÇÕES DA ETIQUETA ===');
  console.log('Texto OCR bruto:');
  console.log(texto);
  console.log(`Produtos DEPARA disponíveis: ${produtosDEPARA.length}`);

  // ============================================
  // NORMALIZAÇÃO AGRESSIVA
  // ============================================
  let textoLimpo = texto
    .toUpperCase()
    // Caracteres que OCR confunde frequentemente
    .replace(/[|!1Il]/g, 'I')      // Variações de I
    .replace(/[{}[\]()]/g, '')      // Remover brackets
    .replace(/[`´''""]/g, '')       // Remover aspas
    .replace(/[@#]/g, '#')          // Normalizar hashtag
    // Normalizar quebras de linha
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Múltiplos espaços -> um espaço
    .replace(/[ \t]+/g, ' ')
    // Múltiplas quebras -> uma quebra
    .replace(/\n+/g, '\n')
    .trim();

  // Separar em linhas
  const linhas = textoLimpo.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  console.log('Linhas:', linhas);

  // ============================================
  // 1. EXTRAIR PRODUTO
  // ============================================

  // Primeiro, extrair o texto bruto do produto da etiqueta
  let produtoEtiqueta = null;

  for (const linha of linhas) {
    // Pular linhas de cabeçalho
    if (linha.includes('EUROTEXTIL') || linha.includes('EUR0TEXTIL')) continue;
    if (linha.includes('CNPJ') || linha.includes('LTDA')) continue;
    if (/^[0-9.\-\s]+$/.test(linha)) continue; // Só números (código de barras)

    // Verificar se linha contém PRODU (PRODUTO, PRODUTD, PR0DUTO, etc)
    if (/PR[O0]DU/.test(linha)) {
      const match = linha.match(/PR[O0]DU[T7D][O0D]?[\s:]+(.+)/);
      if (match && match[1] && match[1].length > 3) {
        produtoEtiqueta = match[1].trim();
        console.log('PRODUTO encontrado na etiqueta:', produtoEtiqueta);
        break;
      }
    }
  }

  // Fallback: buscar linha que contenha palavras-chave de tecidos
  if (!produtoEtiqueta) {
    const tecidosBasicos = ['OXFORD', 'TACTEL', 'CREPE', 'CETIM', 'MALHA', 'TRICOLINE',
                           'VISCOLYCRA', 'LINHO', 'SARJA', 'BRIM', 'JEANS', 'TINTO', 'POLYESTER',
                           'GABARDINE', 'HELANCA', 'BLACKOUT', 'VOIL', 'CHIFFON', 'ZIBELINE'];
    for (const linha of linhas) {
      if (linha.includes('EUROTEXTIL') || linha.includes('CNPJ')) continue;
      for (const tecido of tecidosBasicos) {
        if (linha.includes(tecido)) {
          produtoEtiqueta = linha.replace(/PR[O0]DU[T7D][O0D]?[\s:]*/g, '').trim();
          console.log('PRODUTO encontrado (fallback):', produtoEtiqueta);
          break;
        }
      }
      if (produtoEtiqueta) break;
    }
  }

  // Agora buscar no DEPARA: Coluna A (nomeFornecedor) → Coluna B (nomeERP)
  if (produtoEtiqueta && produtosDEPARA.length > 0) {
    const produtoUpper = produtoEtiqueta.toUpperCase();
    console.log(`Buscando "${produtoUpper}" no DEPARA (${produtosDEPARA.length} registros)...`);

    // Ordenar DEPARA por tamanho do nome (maior primeiro para match mais específico)
    const deparaOrdenado = [...produtosDEPARA].sort((a, b) =>
      (b.nomeFornecedor?.length || 0) - (a.nomeFornecedor?.length || 0)
    );

    for (const item of deparaOrdenado) {
      const nomeFornecedor = item.nomeFornecedor?.toUpperCase() || '';

      // Match exato ou o texto da etiqueta contém o nome do fornecedor
      if (nomeFornecedor && (
        produtoUpper === nomeFornecedor ||
        produtoUpper.includes(nomeFornecedor) ||
        nomeFornecedor.includes(produtoUpper)
      )) {
        // Encontrou! Usar o nome ERP (Coluna B)
        if (item.nomeERP) {
          console.log(`DEPARA match: "${nomeFornecedor}" → "${item.nomeERP}"`);
          info.produto = item.nomeERP;
          break;
        }
      }
    }

    // Se não encontrou no DEPARA, usar o texto original da etiqueta
    if (!info.produto) {
      console.log('Não encontrou no DEPARA, usando texto original');
      info.produto = produtoEtiqueta;
    }
  } else if (produtoEtiqueta) {
    // Sem DEPARA disponível, usar texto original
    info.produto = produtoEtiqueta;
  }

  // ============================================
  // 2. EXTRAIR COR
  // ============================================

  for (const linha of linhas) {
    // Padrão: COR: #00502 AMARELO (ou variações C0R, #OO5O2, etc)
    // Aceita: COR #00502 AMARELO, COR: 00502 AMARELO, COR:#00502-AMARELO
    const matchCor = linha.match(/C[O0]R[\s:#]*([O0-9]{3,5})[\s\-]*([A-Z]{3,})/);
    if (matchCor) {
      // Normalizar código (trocar O por 0)
      info.codigoCor = matchCor[1].replace(/O/g, '0');
      info.cor = matchCor[2];
      console.log('COR encontrada:', `#${info.codigoCor} ${info.cor}`);
      break;
    }

    // Padrão alternativo: #XXXXX NOME (sem COR: na frente)
    const matchHash = linha.match(/#([O0-9]{3,5})[\s\-]*([A-Z]{3,})/);
    if (matchHash && !info.cor) {
      info.codigoCor = matchHash[1].replace(/O/g, '0');
      info.cor = matchHash[2];
      console.log('COR encontrada (hash):', `#${info.codigoCor} ${info.cor}`);
      break;
    }

    // Padrão: COR: NOME (sem código)
    const matchCorSimples = linha.match(/C[O0]R[\s:]+([A-Z]{4,})/);
    if (matchCorSimples && !info.cor) {
      info.cor = matchCorSimples[1];
      console.log('COR encontrada (simples):', info.cor);
    }
  }

  // ============================================
  // 3. EXTRAIR METRAGEM
  // ============================================

  for (const linha of linhas) {
    // Pular linhas que claramente não são metragem
    if (linha.includes('SEQ') || linha.includes('PO:') || linha.includes('DESENHO')) continue;
    if (linha.includes('CHINA') || linha.includes('ORIGEM')) continue;

    // Padrão: METRAGEM: 50,00 MT (ou METR4GEM, M3TRAGEM, etc)
    const matchMetr = linha.match(/M[E3]TR[A4]?G[E3]?M[\s:]*([0-9]+[,\.][0-9]{1,2})/);
    if (matchMetr) {
      info.metragem = matchMetr[1].replace(',', '.');
      console.log('METRAGEM encontrada (label):', info.metragem);
      break;
    }

    // Padrão: XX,XX MT ou XX.XX MT
    const matchMT = linha.match(/([0-9]{1,3}[,\.][0-9]{1,2})[\s]*M[T]?\b/);
    if (matchMT) {
      const valor = parseFloat(matchMT[1].replace(',', '.'));
      if (valor >= 1 && valor <= 500) {
        info.metragem = matchMT[1].replace(',', '.');
        console.log('METRAGEM encontrada (MT):', info.metragem);
        break;
      }
    }
  }

  // Fallback metragem: buscar número no formato XX,XX
  if (!info.metragem) {
    for (const linha of linhas) {
      if (linha.includes('SEQ') || linha.includes('PO:')) continue;
      const matchNum = linha.match(/\b([0-9]{2,3}[,\.][0-9]{2})\b/);
      if (matchNum) {
        const valor = parseFloat(matchNum[1].replace(',', '.'));
        if (valor >= 10 && valor <= 200) {
          info.metragem = matchNum[1].replace(',', '.');
          console.log('METRAGEM encontrada (fallback):', info.metragem);
          break;
        }
      }
    }
  }

  // ============================================
  // LIMPEZA FINAL
  // ============================================
  if (info.produto) {
    info.produto = info.produto.replace(/\s+/g, ' ').trim();
  }
  if (info.cor) {
    info.cor = info.cor.replace(/[^A-ZÀ-Ú\s]/g, '').trim();
  }

  console.log('=== RESULTADO FINAL ===');
  console.log('Produto:', info.produto || 'NÃO ENCONTRADO');
  console.log('Cor:', info.cor ? (info.codigoCor ? `#${info.codigoCor} ${info.cor}` : info.cor) : 'NÃO ENCONTRADA');
  console.log('Metragem:', info.metragem ? `${info.metragem} MT` : 'NÃO ENCONTRADA');

  return info;
}

// Exportar middleware de upload
export const uploadMiddleware = upload.single('etiqueta');
