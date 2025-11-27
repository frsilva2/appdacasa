import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import prisma from '../src/config/database.js';
import logger from '../src/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXCEL_PATH = 'C:\\Projetos\\Emporio-Tecidos-Assets\\ultimopreco.xlsx';

async function importDEPARAFromExcel() {
  try {
    logger.info('Iniciando importação DEPARA do Excel...');

    // Ler arquivo Excel
    const workbook = XLSX.readFile(EXCEL_PATH);

    // Listar todas as abas disponíveis
    logger.info(`Abas encontradas: ${workbook.SheetNames.join(', ')}`);

    // Pegar a aba do meio (índice 1 se houver 3 abas, ou índice Math.floor(length/2))
    const middleSheetIndex = Math.floor(workbook.SheetNames.length / 2);
    const sheetName = workbook.SheetNames[middleSheetIndex];

    logger.info(`Usando aba do meio: "${sheetName}" (índice ${middleSheetIndex})`);

    const worksheet = workbook.Sheets[sheetName];

    // Converter para JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    logger.info(`Total de linhas encontradas: ${data.length}`);

    // Log das primeiras 5 linhas para entender a estrutura
    logger.info('Primeiras 5 linhas do Excel:');
    data.slice(0, 5).forEach((row, index) => {
      logger.info(`Linha ${index + 1}:`, JSON.stringify(row));
    });

    logger.info('\nColunas disponíveis:', Object.keys(data[0] || {}));

    // Contador de registros
    let imported = 0;
    let updated = 0;
    let errors = 0;

    // Processar cada linha
    for (const row of data) {
      try {
        // Colunas reais do Excel FORNECEDOR-EMPORIO
        const nomeFornecedor = row['NOME PRODUTO FORNECEDOR'];
        const nomeERP = row['NOME PRODUTO EMPORIO'];

        if (!nomeFornecedor || !nomeERP) {
          logger.warn('Linha ignorada - campos obrigatórios faltando:', JSON.stringify(row));
          continue;
        }

        // Verificar se já existe
        const existente = await prisma.dEPARA.findUnique({
          where: { nomeFornecedor: nomeFornecedor.trim() },
        });

        if (existente) {
          // Atualizar
          await prisma.dEPARA.update({
            where: { id: existente.id },
            data: {
              nomeERP: nomeERP.trim(),
            },
          });
          updated++;
          logger.info(`✓ Atualizado: ${nomeFornecedor} -> ${nomeERP}`);
        } else {
          // Criar novo
          await prisma.dEPARA.create({
            data: {
              nomeFornecedor: nomeFornecedor.trim(),
              nomeERP: nomeERP.trim(),
              produtoId: null, // Pode ser associado manualmente depois
            },
          });
          imported++;
          logger.info(`✓ Importado: ${nomeFornecedor} -> ${nomeERP}`);
        }
      } catch (error) {
        errors++;
        logger.error(`Erro ao processar linha:`, error);
      }
    }

    logger.info('\n=== RESUMO DA IMPORTAÇÃO ===');
    logger.info(`✓ Novos registros: ${imported}`);
    logger.info(`✓ Registros atualizados: ${updated}`);
    logger.info(`✗ Erros: ${errors}`);
    logger.info(`Total processado: ${imported + updated + errors}`);

  } catch (error) {
    logger.error('Erro ao importar DEPARA:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar importação
importDEPARAFromExcel()
  .then(() => {
    logger.info('Importação concluída com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Falha na importação:', error);
    process.exit(1);
  });
