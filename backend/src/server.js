import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configurações
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import logger from './config/logger.js';
import prisma from './config/database.js';

// Rotas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import lojaRoutes from './routes/loja.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import fornecedorRoutes from './routes/fornecedor.routes.js';
import requisicaoAbastecimentoRoutes from './routes/requisicaoAbastecimento.routes.js';
import cotacaoRoutes from './routes/cotacao.routes.js';
import pedidoB2BRoutes from './routes/pedidoB2B.routes.js';
import clienteB2BRoutes from './routes/clienteB2B.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import coresRoutes from './routes/cores.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js';
import deparaRoutes from './routes/depara.routes.js';

// Carregar variáveis de ambiente
dotenv.config();

// Obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Caminho para o diretório de assets
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(__dirname, '../../../Emporio-Tecidos-Assets');

// =====================================================
// MIDDLEWARES GLOBAIS
// =====================================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - Aceitar múltiplas origens
// FRONTEND_URL pode ser uma única URL ou múltiplas separadas por vírgula
// Exemplo: https://app.vercel.app,https://app2.vercel.app
const frontendUrls = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  ...frontendUrls
].filter(Boolean);

// Padrões permitidos (wildcards) - útil para ambientes de preview do Vercel
const allowedPatterns = [
  /^https:\/\/.*\.vercel\.app$/,  // Qualquer subdomínio .vercel.app
  /^https:\/\/.*\.netlify\.app$/  // Qualquer subdomínio .netlify.app
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    // Em desenvolvimento, aceitar qualquer localhost
    if (NODE_ENV === 'development' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    // Verificar lista de origens permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Verificar padrões permitidos (wildcards)
    if (allowedPatterns.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    // Log de origem bloqueada para debug
    logger.warn(`🚫 CORS bloqueou origem: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Arquivos estáticos (uploads) - ANTES do rate limiter para não limitar imagens
app.use('/uploads', express.static('uploads'));

// Arquivos estáticos (public - assets integrados ao projeto)
const PUBLIC_PATH = path.join(__dirname, '../public');
app.use('/assets', express.static(path.join(PUBLIC_PATH, 'assets')));

// TAMBÉM servir assets em /api/assets para compatibilidade com URLs antigas
app.use('/api/assets', express.static(path.join(PUBLIC_PATH, 'assets')));

// Arquivos estáticos (assets do Google Drive) - FALLBACK para desenvolvimento local
if (fs.existsSync(ASSETS_PATH)) {
  app.use('/assets', express.static(ASSETS_PATH));
  app.use('/assets/cores/fotos', express.static(path.join(ASSETS_PATH, 'cores', 'fotos')));
  app.use('/assets/etiquetas', express.static(path.join(ASSETS_PATH, 'etiquetas')));
  app.use('/assets/logo', express.static(path.join(ASSETS_PATH, 'logo')));
  // Também em /api/assets para compatibilidade
  app.use('/api/assets', express.static(ASSETS_PATH));
  app.use('/api/assets/cores/fotos', express.static(path.join(ASSETS_PATH, 'cores', 'fotos')));
  app.use('/api/assets/etiquetas', express.static(path.join(ASSETS_PATH, 'etiquetas')));
  app.use('/api/assets/logo', express.static(path.join(ASSETS_PATH, 'logo')));
}

// Rate limiting (aplicado apenas às rotas da API, não aos assets)
app.use(rateLimiter);

// Carregar metadata JSON das cores (cache em memória)
let coresMetadata = null;
function loadCoresMetadata() {
  if (!coresMetadata) {
    try {
      const metadataPath = path.join(ASSETS_PATH, 'cores', 'cores-metadata.json');
      const data = fs.readFileSync(metadataPath, 'utf8');
      coresMetadata = JSON.parse(data);
      logger.info(`✅ Metadata de cores carregado: ${coresMetadata.total} cores`);
    } catch (error) {
      logger.error('❌ Erro ao carregar cores-metadata.json:', error);
      coresMetadata = { aprovadas: [] };
    }
  }
  return coresMetadata;
}

// Endpoint para buscar imagem da cor (usa metadata JSON)
app.get('/api/cores/:corId/imagem', async (req, res) => {
  try {
    const { corId } = req.params;
    const corIdNumerico = parseInt(corId);

    // Carregar metadata
    const metadata = loadCoresMetadata();

    // Buscar cor no metadata pelo ID numérico
    logger.info(`🔍 Buscando imagem para cor ID: ${corIdNumerico}`);

    const corMeta = metadata.aprovadas.find(c => c.id === corIdNumerico);

    if (!corMeta || !corMeta.arquivo_imagem) {
      logger.warn(`❌ Cor ${corIdNumerico} não encontrada no metadata`);
      return res.status(404).json({
        error: 'Cor não encontrada no metadata',
        corId: corIdNumerico,
        coresDisponiveis: metadata.aprovadas.map(c => `${c.id}: ${c.nome_cor}`).slice(0, 10)
      });
    }

    logger.info(`✅ Cor encontrada: "${corMeta.nome_cor}" - Arquivo: ${corMeta.arquivo_imagem}`);

    // Caminho exato da imagem
    const filePath = path.join(ASSETS_PATH, 'cores', 'fotos', corMeta.arquivo_imagem);

    if (!fs.existsSync(filePath)) {
      logger.error(`❌ Arquivo físico não encontrado: ${corMeta.arquivo_imagem}`);
      logger.error(`   Caminho procurado: ${filePath}`);
      return res.status(404).json({
        error: 'Arquivo de imagem não encontrado no disco',
        arquivo: corMeta.arquivo_imagem,
        caminho: filePath
      });
    }

    logger.info(`📸 Servindo imagem: ${corMeta.arquivo_imagem}`);
    return res.sendFile(filePath);
  } catch (error) {
    logger.error('Erro ao buscar imagem da cor:', error);
    res.status(500).json({ error: 'Erro ao buscar imagem' });
  }
});

// =====================================================
// HEALTH CHECK
// =====================================================

const healthResponse = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
};

app.get('/health', healthResponse);
app.get('/api/health', healthResponse);

// =====================================================
// ROTAS DA API
// =====================================================

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/lojas`, lojaRoutes);
app.use(`${API_PREFIX}/produtos`, produtoRoutes);
app.use(`${API_PREFIX}/fornecedores`, fornecedorRoutes);
app.use(`${API_PREFIX}/requisicoes-abastecimento`, requisicaoAbastecimentoRoutes);
app.use(`${API_PREFIX}/cotacoes`, cotacaoRoutes);
app.use(`${API_PREFIX}/pedidos-b2b`, pedidoB2BRoutes);
app.use(`${API_PREFIX}/clientes-b2b`, clienteB2BRoutes);
app.use(`${API_PREFIX}/inventario`, inventarioRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/cores`, coresRoutes);
app.use(`${API_PREFIX}/etiquetas`, etiquetasRoutes);
app.use(`${API_PREFIX}/depara`, deparaRoutes);

// =====================================================
// ERROR HANDLERS
// =====================================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================

server.listen(PORT, () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📍 Ambiente: ${NODE_ENV}`);
  logger.info(`🔗 API: http://localhost:${PORT}${API_PREFIX}`);
  logger.info(`💊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Fechando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor fechado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Fechando servidor gracefully...');
  server.close(() => {
    logger.info('Servidor fechado.');
    process.exit(0);
  });
});

export default app;
// trigger restart

