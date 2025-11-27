import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

// Singleton pattern para o Prisma Client
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Logging de eventos
prisma.$on('warn', (e) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Teste de conexão
async function testConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Conexão com o banco de dados estabelecida');
  } catch (error) {
    logger.error('❌ Erro ao conectar com o banco de dados:', error);
    logger.warn('⚠️ Servidor continuará rodando sem conexão com banco (modo desenvolvimento)');
    // process.exit(1); // Comentado temporariamente para testes de assets
  }
}

testConnection();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Conexão com o banco de dados fechada');
});

export default prisma;
