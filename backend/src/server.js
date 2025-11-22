import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Configurações
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import logger from './config/logger.js';

// Rotas
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import lojaRoutes from './routes/loja.routes.js';
import produtoRoutes from './routes/produto.routes.js';
import requisicaoAbastecimentoRoutes from './routes/requisicaoAbastecimento.routes.js';
import cotacaoRoutes from './routes/cotacao.routes.js';
import pedidoB2BRoutes from './routes/pedidoB2B.routes.js';
import inventarioRoutes from './routes/inventario.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =====================================================
// MIDDLEWARES GLOBAIS
// =====================================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
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

// Rate limiting
app.use(rateLimiter);

// Arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// =====================================================
// ROTAS DA API
// =====================================================

const API_PREFIX = '/api';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/lojas`, lojaRoutes);
app.use(`${API_PREFIX}/produtos`, produtoRoutes);
app.use(`${API_PREFIX}/requisicoes-abastecimento`, requisicaoAbastecimentoRoutes);
app.use(`${API_PREFIX}/cotacoes`, cotacaoRoutes);
app.use(`${API_PREFIX}/pedidos-b2b`, pedidoB2BRoutes);
app.use(`${API_PREFIX}/inventario`, inventarioRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);

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
