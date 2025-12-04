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
 * Normaliza texto para comparação tolerante a erros de OCR
 * Aplica correções para confusões comuns de caracteres
 */
function normalizarParaMatch(texto) {
  if (!texto) return '';
  return texto
    .toUpperCase()
    // OCR confunde esses caracteres frequentemente
    .replace(/[0O]/g, 'O')           // 0 e O são iguais
    .replace(/[1ILl|!]/g, 'I')       // 1, I, L, l, |, ! são iguais
    .replace(/[5S]/g, 'S')           // 5 e S
    .replace(/[8B]/g, 'B')           // 8 e B
    .replace(/[6G]/g, 'G')           // 6 e G
    .replace(/[2Z]/g, 'Z')           // 2 e Z
    .replace(/[4A]/g, 'A')           // 4 e A (menos comum)
    .replace(/[9Q]/g, 'Q')           // 9 e Q (menos comum)
    // Remover acentos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Remover caracteres especiais
    .replace(/[^A-Z0-9\s]/g, ' ')
    // Múltiplos espaços → um espaço
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai palavras-chave significativas de um nome de produto
 * Remove medidas, percentuais, composições genéricas
 * Baseado em TODOS os 281 produtos da planilha DEPARA
 */
function extrairPalavrasChave(texto) {
  if (!texto) return [];

  const normalizado = normalizarParaMatch(texto);

  // Palavras a ignorar (medidas, composições, marcadores, etc.)
  // Baseado na análise completa da planilha DEPARA
  const ignorar = [
    // Medidas
    'L', 'M', 'CM', 'MT', 'MTR', 'METROS', 'G', 'KG', 'GSM',
    // Composições - fibras e materiais
    'POLYESTER', 'POLIESTER', 'POLYE', 'POLYES', 'POLIAMIDA', 'PES',
    'ALGODAO', 'ALG', 'VISCOSE', 'RAYON', 'ELASTANO', 'ELAST', 'SPANDEX',
    'LINHO', 'SEDA', 'RESN', 'PLAST', 'POLIURET',
    // Acabamentos e estados
    'TINTO', 'TINTA', 'BRANQUEADO', 'BRANCO', 'CRU', 'ALVEJADO',
    'ESTAMPADO', 'ESTAMPADA', 'ESTAMP', 'EST', 'LISO', 'LISA', 'SORTIDO',
    'DECORACAO', 'DECOR', 'RAMADO', 'LAVAVEL', 'BORDADO',
    // Qualificadores
    'PREMIUM', 'CLASSIC', 'LIGHT', 'HEAVY', 'PLUS', 'EXTRA', 'HIPER', 'SOFT',
    'NEW', 'FASHION', 'AIRJET',
    // Dimensões e tamanhos
    'TAM', 'TAMANHO', 'PESO', 'APROX', 'PECA', 'FIOS',
    // Padrões de medida que aparecem na planilha
    'IOO', 'ISO', 'IAT', 'ISO', 'IOT', 'IAI', 'IAZ', 'I47', 'I50', 'I60',
    'I45', 'I37', 'I38', 'I75', 'Z80', 'Z55', 'Z50', 'ZSO', 'ZZS', 'SOO',
    // Cores que não são parte do nome do produto
    'CINZA', 'BEGE', 'MARFIM', 'NEVE', 'OFF', 'WHITE'
  ];

  // Extrair palavras
  const palavras = normalizado.split(/\s+/).filter(p => {
    // Ignorar palavras muito curtas
    if (p.length < 3) return false;
    // Ignorar números puros ou medidas (ex: "100", "150", "280")
    if (/^[OI0-9]+$/.test(p)) return false;
    // Ignorar percentuais (ex: "100%", "97%")
    if (/^\d+%?$/.test(p)) return false;
    // Ignorar medidas com vírgula/ponto (ex: "1,50", "2.80", "I,SOI")
    if (/^[OI0-9,\.]+$/.test(p)) return false;
    // Ignorar palavras da lista
    if (ignorar.includes(p)) return false;
    return true;
  });

  return palavras;
}

/**
 * Calcula score de similaridade entre duas strings
 * Retorna valor entre 0 e 1
 */
function calcularSimilaridade(str1, str2) {
  const s1 = normalizarParaMatch(str1);
  const s2 = normalizarParaMatch(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0;

  // Match por palavras-chave
  const palavras1 = extrairPalavrasChave(str1);
  const palavras2 = extrairPalavrasChave(str2);

  if (palavras1.length === 0 || palavras2.length === 0) return 0;

  // Contar palavras em comum
  let matches = 0;
  for (const p1 of palavras1) {
    for (const p2 of palavras2) {
      // Match exato ou substring
      if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
        matches++;
        break;
      }
    }
  }

  // Score baseado na proporção de matches
  const totalPalavras = Math.max(palavras1.length, palavras2.length);
  return matches / totalPalavras;
}

/**
 * Função auxiliar para extrair informações estruturadas da etiqueta
 * ABORDAGEM: Normalização agressiva + busca por similaridade
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
  // NORMALIZAÇÃO AGRESSIVA DO TEXTO OCR
  // ============================================
  let textoLimpo = texto
    .toUpperCase()
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
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
    if (/EUROTEXTIL|EUR[O0]TEXTIL/i.test(linha)) continue;
    if (/CNPJ|LTDA|INDUSTRIA/i.test(linha)) continue;
    if (/^[0-9.\-\s]+$/.test(linha)) continue; // Só números (código de barras)
    if (/^SEQ|^PO:|^NF:/i.test(linha)) continue; // Campos administrativos

    // Verificar se linha contém PRODUTO (com variações de OCR)
    const matchProduto = linha.match(/PR[O0]DU[T7D][O0D]?[\s:]+(.+)/i);
    if (matchProduto && matchProduto[1] && matchProduto[1].length > 3) {
      produtoEtiqueta = matchProduto[1].trim();
      console.log('PRODUTO encontrado na etiqueta:', produtoEtiqueta);
      break;
    }
  }

  // Fallback: buscar linha que contenha palavras-chave de tecidos/produtos
  // Lista completa baseada em TODOS os 281 produtos da planilha DEPARA
  if (!produtoEtiqueta) {
    const produtosConhecidos = [
      // Alfaiatarias
      'ALFAIATARIA', 'BARBIE', 'KALI', 'TWILL', 'NEW LOOK', 'SENSORIALLE',
      // Atoalhados
      'ATOALHADO', 'MAGICO', 'TOALHA', 'FELPUDO',
      // Blackouts
      'BLACKOUT', 'LINEN',
      // Cambraias e Linhos
      'CAMBRAIA', 'LINHO', 'ITACARE', 'PANAMA', 'CARAIVA',
      // Cetins
      'CETIM', 'BUCOL', 'CHARMOUSSE', 'TWIST',
      // Crepes
      'CREPE', 'AMANDA', 'GEORGETE', 'GEORGETTE', 'GGT', 'SATIN', 'UNIQUE',
      // Chiffons e sedas
      'CHIFFON', 'CELINE', 'MUSSELINE', 'SEDA',
      // Chitão e Euroleen
      'CHITAO', 'EUROLEEN', 'TEXTOLEEN', 'ARTEDECOR', 'NATALINO',
      // Dunas e Cey
      'DUNA', 'DUNAS', 'CEY', 'AIR FLOW',
      // Fleeces e Flanelas
      'FLEECE', 'CORAL', 'FLANNEL', 'EMBOSSED',
      // Gabardines
      'GABARDINE', 'DOURO', 'MADRID', 'SINTRA', 'ORIENTEX', 'ELEGANT',
      // Helancas
      'HELANCA', 'HELANKA', 'HELANQUINHA',
      // Jacquards
      'JACQUARD', 'DAKOTA',
      // La Batida e outros
      'LA BATIDA', 'BATIDA',
      // Laises e Bordados
      'LAISE', 'COTTON', 'EMBROIDERY', 'NATURALE',
      // Malhas
      'MALHA', 'JERSEY', 'CLASSIC',
      // Microfibras
      'MICROFIBRA', 'MICRO', 'FORRO', 'CALIFORNIA', 'PLAYN',
      // Nudes e Pradas
      'NUDE', 'PRADA', 'SPAN',
      // Organzas
      'ORGANZA', 'CRISTAL',
      // Oxfords - importante!
      'OXFORD', 'OXFORDINE', 'CHECK', 'FLAME', 'MELANGE', 'SLUB',
      // Percais
      'PERCAL', 'PERCALE', 'BELLA', 'BRISA', 'EUROSTAR', 'TRESOR',
      // Poly e Voils
      'POLY', 'VOIL', 'VOAL', 'BORA BORA', 'CROSS', 'GAZE', 'SNOW',
      // Rayons e Viscoses
      'RAYON', 'POPLIN', 'VISCOSE', 'VISCOLINHO', 'TULUM',
      // Salinas e Super Soft
      'SALINA', 'SUPER SOFT', 'HIDROLIGHT',
      // Tactel
      'TACTEL', 'SPORT',
      // Tapetes
      'TAPETE', 'SHINE',
      // Tecidos Enfestados (TE)
      'TECIDO', 'ENFESTADO', 'LOGAN', 'PREMIUM',
      // Tematicos
      'TEMATICO', 'LAME', 'SERPENTINA',
      // Tules
      'TULE', 'TULLE', 'ARMACAO', 'FILO', 'GLITTER',
      // Two Way
      'TWO WAY', 'TWOWAY',
      // Zibelines
      'ZIBELINE', 'RAFFINE',
      // Outros
      'DENIM', 'JEANS', 'SARJA', 'BRIM', 'TRICOLINE'
    ];

    for (const linha of linhas) {
      if (/EUROTEXTIL|CNPJ|LTDA|INDUSTRIA/i.test(linha)) continue;

      const linhaUpper = linha.toUpperCase();
      for (const produto of produtosConhecidos) {
        // Normalizar para comparação (OCR pode ter erros)
        const produtoNorm = normalizarParaMatch(produto);
        const linhaNorm = normalizarParaMatch(linhaUpper);

        if (linhaNorm.includes(produtoNorm)) {
          produtoEtiqueta = linha.replace(/PR[O0]DU[T7D][O0D]?[\s:]*/gi, '').trim();
          console.log('PRODUTO encontrado (fallback):', produtoEtiqueta);
          break;
        }
      }
      if (produtoEtiqueta) break;
    }
  }

  // ============================================
  // BUSCAR NO DEPARA COM TOLERÂNCIA A RUÍDOS
  // ============================================
  if (produtoEtiqueta && produtosDEPARA.length > 0) {
    console.log(`Buscando match para: "${produtoEtiqueta}"`);

    let melhorMatch = null;
    let melhorScore = 0;
    const SCORE_MINIMO = 0.5; // 50% de similaridade mínima

    for (const item of produtosDEPARA) {
      if (!item.nomeFornecedor) continue;

      const score = calcularSimilaridade(produtoEtiqueta, item.nomeFornecedor);

      if (score > melhorScore) {
        melhorScore = score;
        melhorMatch = item;
      }

      // Match perfeito, não precisa continuar
      if (score === 1.0) break;
    }

    if (melhorMatch && melhorScore >= SCORE_MINIMO) {
      console.log(`DEPARA match (${(melhorScore * 100).toFixed(0)}%): "${melhorMatch.nomeFornecedor}" → "${melhorMatch.nomeERP}"`);
      info.produto = melhorMatch.nomeERP;
    } else {
      console.log(`Nenhum match no DEPARA (melhor score: ${(melhorScore * 100).toFixed(0)}%), usando texto original`);
      info.produto = produtoEtiqueta;
    }
  } else if (produtoEtiqueta) {
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
