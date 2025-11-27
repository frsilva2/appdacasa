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
    const produtos = await prisma.produto.findMany({
      where: {
        active: true,
        estoques: {
          some: {
            local: 'CD',
            quantidade: { gt: 0 },
          },
        },
      },
      include: {
        cores: {
          where: {
            active: true,
            estoques: {
              some: {
                local: 'CD',
                quantidade: { gt: 0 },
              },
            },
          },
          include: {
            estoques: {
              where: { local: 'CD' },
              select: {
                quantidade: true,
                quantidadeMin: true,
              },
            },
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
