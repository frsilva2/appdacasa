import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o diretório de assets
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(__dirname, '../../../../Emporio-Tecidos-Assets');
const EXCEL_PATH = path.join(ASSETS_PATH, 'ultimopreco.xlsx');

/**
 * Ler e cachear o conteúdo do Excel
 */
let cacheExcel = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const lerExcel = async () => {
  // Verificar cache
  if (cacheExcel && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    return cacheExcel;
  }

  try {
    // Ler arquivo Excel
    const workbook = xlsx.readFile(EXCEL_PATH);

    // Processar as 3 abas
    const dados = {
      fornecedorEmporio: [],
      depara: [],
      notasDetalhadas: []
    };

    // Aba 1: FORNECEDOR-EMPORIO
    if (workbook.SheetNames[0]) {
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      dados.fornecedorEmporio = xlsx.utils.sheet_to_json(sheet);
    }

    // Aba 2: TABELA (DEPARA)
    if (workbook.SheetNames[1]) {
      const sheet = workbook.Sheets[workbook.SheetNames[1]];
      dados.depara = xlsx.utils.sheet_to_json(sheet);
    }

    // Aba 3: Notas Detalhadas
    if (workbook.SheetNames[2]) {
      const sheet = workbook.Sheets[workbook.SheetNames[2]];
      dados.notasDetalhadas = xlsx.utils.sheet_to_json(sheet);
    }

    // Atualizar cache
    cacheExcel = dados;
    cacheTimestamp = Date.now();

    return dados;
  } catch (error) {
    console.error('Erro ao ler Excel:', error);
    throw new Error('Erro ao processar arquivo Excel');
  }
};

/**
 * @route   GET /api/depara
 * @desc    Obter toda a tabela DEPARA
 * @access  Public
 */
export const getDEPARA = async (req, res) => {
  try {
    const dados = await lerExcel();

    res.json({
      success: true,
      data: {
        total: dados.depara.length,
        depara: dados.depara
      },
      message: 'Tabela DEPARA recuperada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar DEPARA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tabela DEPARA',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/depara/search
 * @desc    Buscar produto na tabela DEPARA
 * @query   q - termo de busca
 * @access  Public
 */
export const searchDEPARA = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca "q" é obrigatório'
      });
    }

    const dados = await lerExcel();
    const termoBusca = q.toLowerCase();

    // Buscar em todos os campos da tabela DEPARA
    const resultados = dados.depara.filter(item => {
      return Object.values(item).some(valor => {
        if (valor && typeof valor === 'string') {
          return valor.toLowerCase().includes(termoBusca);
        }
        return false;
      });
    });

    res.json({
      success: true,
      data: {
        total: resultados.length,
        resultados
      },
      message: `${resultados.length} produtos encontrados`
    });
  } catch (error) {
    console.error('Erro ao buscar no DEPARA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar no DEPARA',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/depara/produto/:nomeFornecedor
 * @desc    Buscar produto unificado pelo nome do fornecedor
 * @access  Public
 */
export const buscarProdutoUnificado = async (req, res) => {
  try {
    const { nomeFornecedor } = req.params;

    const dados = await lerExcel();

    // Buscar produto na tabela DEPARA que corresponda ao nome do fornecedor
    const produto = dados.depara.find(item => {
      // Assumindo que a coluna do fornecedor se chama 'Nome Fornecedor' ou similar
      // Ajuste conforme estrutura real da planilha
      const nomeColuna = Object.keys(item).find(key =>
        key.toLowerCase().includes('fornecedor') ||
        key.toLowerCase().includes('original')
      );

      if (nomeColuna) {
        return item[nomeColuna]?.toLowerCase() === nomeFornecedor.toLowerCase();
      }
      return false;
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado na tabela DEPARA'
      });
    }

    res.json({
      success: true,
      data: produto,
      message: 'Produto unificado encontrado'
    });
  } catch (error) {
    console.error('Erro ao buscar produto unificado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto unificado',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/depara/precos
 * @desc    Obter tabela de preços (Aba FORNECEDOR-EMPORIO)
 * @access  Public
 */
export const getPrecos = async (req, res) => {
  try {
    const dados = await lerExcel();

    res.json({
      success: true,
      data: {
        total: dados.fornecedorEmporio.length,
        precos: dados.fornecedorEmporio
      },
      message: 'Tabela de preços recuperada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar tabela de preços',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/depara/notas
 * @desc    Obter notas detalhadas (Aba 3)
 * @access  Public
 */
export const getNotas = async (req, res) => {
  try {
    const dados = await lerExcel();

    res.json({
      success: true,
      data: {
        total: dados.notasDetalhadas.length,
        notas: dados.notasDetalhadas
      },
      message: 'Notas detalhadas recuperadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notas detalhadas',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/depara/limpar-cache
 * @desc    Limpar cache do Excel (forçar releitura)
 * @access  Private (Admin)
 */
export const limparCache = async (req, res) => {
  try {
    cacheExcel = null;
    cacheTimestamp = null;

    res.json({
      success: true,
      message: 'Cache limpo com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache',
      error: error.message
    });
  }
};
