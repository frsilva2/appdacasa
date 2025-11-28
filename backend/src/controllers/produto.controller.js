import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Get all produtos with cores
export const getAllProdutos = async (req, res) => {
  try {
    const { curva, categoria, search } = req.query;

    const where = {
      active: true,
    };

    if (curva) where.curva = curva;
    if (categoria) where.categoria = categoria;
    if (search) {
      where.OR = [
        { nome: { contains: search } },
        { codigo: { contains: search } },
      ];
    }

    const produtos = await prisma.produto.findMany({
      where,
      include: {
        cores: {
          where: { active: true },
          orderBy: { nome: 'asc' },
        },
      },
      orderBy: [
        { curva: 'asc' },
        { nome: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    logger.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos',
    });
  }
};

// Get produto by ID with cores and estoque
export const getProdutoById = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        cores: {
          where: { active: true },
          include: {
            estoques: {
              where: { local: 'CD' },
            },
          },
          orderBy: { nome: 'asc' },
        },
      },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    res.json({
      success: true,
      data: produto,
    });
  } catch (error) {
    logger.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produto',
    });
  }
};

// Get estoque disponível no CD
export const getEstoqueCD = async (req, res) => {
  try {
    const { produtoId, corId } = req.query;

    const where = {
      local: 'CD',
    };

    if (produtoId) where.produtoId = produtoId;
    if (corId) where.corId = corId;

    const estoques = await prisma.estoque.findMany({
      where,
      include: {
        produto: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            curva: true,
            precoAtacado: true,
            precoVarejo: true,
          },
        },
        cor: {
          select: {
            id: true,
            nome: true,
            codigoHex: true,
          },
        },
      },
      orderBy: [
        { produto: { curva: 'asc' } },
        { produto: { nome: 'asc' } },
        { cor: { nome: 'asc' } },
      ],
    });

    res.json({
      success: true,
      data: estoques,
    });
  } catch (error) {
    logger.error('Erro ao buscar estoque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estoque',
    });
  }
};

// Get produtos com estoque disponível (para requisições)
export const getProdutosComEstoque = async (req, res) => {
  try {
    // Retorna todos os produtos ativos com suas cores (mesmo sem estoque)
    const produtos = await prisma.produto.findMany({
      where: {
        active: true,
      },
      include: {
        cores: {
          where: {
            active: true,
          },
          orderBy: { nome: 'asc' },
        },
      },
      orderBy: [
        { curva: 'asc' },
        { nome: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    logger.error('Erro ao buscar produtos com estoque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos com estoque',
    });
  }
};

// Create produto (Admin)
export const createProduto = async (req, res) => {
  try {
    const { codigo, nome, categoria, precoAtacado, precoVarejo, curva, larguraMetros, composicao } = req.body;

    // Validação
    if (!codigo || !nome || !categoria || !precoAtacado || !precoVarejo) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: código, nome, categoria, preço atacado e varejo',
      });
    }

    // Verificar se código já existe
    const existingProduto = await prisma.produto.findUnique({
      where: { codigo },
    });

    if (existingProduto) {
      return res.status(400).json({
        success: false,
        message: 'Código de produto já cadastrado',
      });
    }

    // Criar produto
    const produto = await prisma.produto.create({
      data: {
        codigo,
        nome,
        categoria,
        precoAtacado,
        precoVarejo,
        curva: curva || 'B',
        larguraMetros,
        composicao,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'Produto',
        entityId: produto.id,
        newData: JSON.stringify({ codigo: produto.codigo, nome: produto.nome }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Produto criado: ${produto.codigo} - ${produto.nome} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: produto,
    });
  } catch (error) {
    logger.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
    });
  }
};

// Update produto (Admin)
export const updateProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nome, categoria, precoAtacado, precoVarejo, curva, larguraMetros, composicao, active } = req.body;

    // Buscar produto atual
    const currentProduto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!currentProduto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Verificar se código já existe (se for diferente do atual)
    if (codigo && codigo !== currentProduto.codigo) {
      const existingProduto = await prisma.produto.findUnique({
        where: { codigo },
      });

      if (existingProduto) {
        return res.status(400).json({
          success: false,
          message: 'Código de produto já cadastrado',
        });
      }
    }

    // Atualizar produto
    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(codigo && { codigo }),
        ...(nome && { nome }),
        ...(categoria && { categoria }),
        ...(precoAtacado !== undefined && { precoAtacado }),
        ...(precoVarejo !== undefined && { precoVarejo }),
        ...(curva && { curva }),
        ...(larguraMetros !== undefined && { larguraMetros }),
        ...(composicao !== undefined && { composicao }),
        ...(active !== undefined && { active }),
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Produto',
        entityId: produto.id,
        oldData: JSON.stringify(currentProduto),
        newData: JSON.stringify(produto),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Produto atualizado: ${produto.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto,
    });
  } catch (error) {
    logger.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
    });
  }
};

// Delete produto (Admin)
export const deleteProduto = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Soft delete - apenas desativa
    await prisma.produto.update({
      where: { id },
      data: { active: false },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'Produto',
        entityId: id,
        oldData: JSON.stringify({ codigo: produto.codigo, nome: produto.nome }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Produto deletado: ${produto.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Produto deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
    });
  }
};

// =====================================================
// GERENCIAMENTO DE CORES
// =====================================================

// Adicionar cor ao produto
export const adicionarCor = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const { nome, codigoHex, arquivoImagem } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da cor é obrigatório',
      });
    }

    // Verificar se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Verificar se cor já existe para este produto
    const corExistente = await prisma.cor.findUnique({
      where: {
        produtoId_nome: {
          produtoId,
          nome,
        },
      },
    });

    if (corExistente) {
      return res.status(400).json({
        success: false,
        message: 'Cor já cadastrada para este produto',
      });
    }

    // Criar cor
    const cor = await prisma.cor.create({
      data: {
        produtoId,
        nome,
        codigoHex: codigoHex || null,
        arquivoImagem: arquivoImagem || null,
      },
    });

    logger.info(`Cor adicionada: ${nome} ao produto ${produto.codigo} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Cor adicionada com sucesso',
      data: cor,
    });
  } catch (error) {
    logger.error('Erro ao adicionar cor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar cor',
    });
  }
};

// Adicionar múltiplas cores ao produto (batch)
export const adicionarCoresEmLote = async (req, res) => {
  try {
    const { produtoId } = req.params;
    const { cores } = req.body; // Array de objetos { nome, codigoHex, arquivoImagem }

    if (!Array.isArray(cores) || cores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Array de cores é obrigatório',
      });
    }

    // Verificar se produto existe
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Buscar cores existentes
    const coresExistentes = await prisma.cor.findMany({
      where: {
        produtoId,
        nome: { in: cores.map(c => c.nome) },
      },
      select: { nome: true },
    });

    const nomesExistentes = new Set(coresExistentes.map(c => c.nome));

    // Filtrar apenas cores novas
    const coresNovas = cores.filter(c => !nomesExistentes.has(c.nome));

    if (coresNovas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Todas as cores já estão cadastradas',
      });
    }

    // Criar cores em lote
    const coresCriadas = await prisma.cor.createMany({
      data: coresNovas.map(c => ({
        produtoId,
        nome: c.nome,
        codigoHex: c.codigoHex || null,
        arquivoImagem: c.arquivoImagem || null,
      })),
      skipDuplicates: true,
    });

    logger.info(`${coresCriadas.count} cores adicionadas ao produto ${produto.codigo} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: `${coresCriadas.count} cores adicionadas com sucesso`,
      data: { count: coresCriadas.count },
    });
  } catch (error) {
    logger.error('Erro ao adicionar cores em lote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar cores em lote',
    });
  }
};

// Remover cor do produto
export const removerCor = async (req, res) => {
  try {
    const { corId } = req.params;

    const cor = await prisma.cor.findUnique({
      where: { id: corId },
      include: { produto: true },
    });

    if (!cor) {
      return res.status(404).json({
        success: false,
        message: 'Cor não encontrada',
      });
    }

    // Soft delete
    await prisma.cor.update({
      where: { id: corId },
      data: { active: false },
    });

    logger.info(`Cor removida: ${cor.nome} do produto ${cor.produto.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Cor removida com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao remover cor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover cor',
    });
  }
};

// Listar todas as cores disponíveis (das 46 cores do sistema)
export const getCoresDisponiveis = async (req, res) => {
  try {
    // Buscar cores únicas agrupadas por nome
    const cores = await prisma.cor.findMany({
      where: { active: true },
      distinct: ['nome'],
      select: {
        nome: true,
        codigoHex: true,
        arquivoImagem: true,
      },
      orderBy: { nome: 'asc' },
    });

    res.json({
      success: true,
      data: cores,
    });
  } catch (error) {
    logger.error('Erro ao buscar cores disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cores disponíveis',
    });
  }
};
