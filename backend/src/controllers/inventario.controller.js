import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Helper: Gerar número de inventário
async function gerarNumeroInventario() {
  const ano = new Date().getFullYear();

  const ultimoInventario = await prisma.inventario.findFirst({
    where: {
      numero: {
        startsWith: `INV-${ano}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequencial = 1;
  if (ultimoInventario) {
    const partes = ultimoInventario.numero.split('-');
    sequencial = parseInt(partes[2]) + 1;
  }

  return `INV-${ano}-${sequencial.toString().padStart(4, '0')}`;
}

// Listar todos os inventários
export const getAllInventarios = async (req, res) => {
  // TODO: Implementar modelo Inventario no schema Prisma
  res.status(501).json({
    success: false,
    message: 'Funcionalidade de inventário ainda não implementada no banco de dados',
  });
};

// Buscar inventário por ID
export const getInventarioById = async (req, res) => {
  // TODO: Implementar modelo Inventario no schema Prisma
  res.status(501).json({
    success: false,
    message: 'Funcionalidade de inventário ainda não implementada no banco de dados',
  });
};

// Criar inventário
export const createInventario = async (req, res) => {
  // TODO: Implementar modelo Inventario no schema Prisma
  res.status(501).json({
    success: false,
    message: 'Funcionalidade de inventário ainda não implementada no banco de dados',
  });
};

// Adicionar item ao inventário (OCR ou manual)
export const adicionarItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { produtoId, corId, quantidadeContada, lote, observacoes, ocrData } = req.body;

    const inventario = await prisma.inventario.findUnique({
      where: { id },
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventário não encontrado',
      });
    }

    if (inventario.status !== 'EM_ANDAMENTO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas inventários em andamento podem receber novos itens',
      });
    }

    // Validações
    if (!produtoId || !corId || quantidadeContada === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Produto, cor e quantidade contada são obrigatórios',
      });
    }

    // Buscar estoque atual (quantidade no sistema)
    const estoqueAtual = await prisma.estoque.findUnique({
      where: {
        produtoId_corId_localizacao: {
          produtoId,
          corId,
          localizacao: 'CD',
        },
      },
    });

    const quantidadeSistema = estoqueAtual ? parseFloat(estoqueAtual.quantidade) : 0;
    const quantidadeContadaFloat = parseFloat(quantidadeContada);
    const divergencia = quantidadeContadaFloat - quantidadeSistema;

    const item = await prisma.inventarioItem.create({
      data: {
        inventarioId: id,
        produtoId,
        corId,
        quantidadeSistema: quantidadeSistema.toString(),
        quantidadeContada: quantidadeContadaFloat.toString(),
        divergencia: divergencia.toString(),
        lote,
        observacoes,
        ocrData: ocrData ? JSON.stringify(ocrData) : null,
      },
      include: {
        produto: true,
        cor: true,
      },
    });

    logger.info(`Item adicionado ao inventário ${inventario.numero}: ${item.produto.nome} - ${item.cor.nome}`);

    res.status(201).json({
      success: true,
      message: 'Item adicionado com sucesso',
      data: item,
    });
  } catch (error) {
    logger.error('Erro ao adicionar item ao inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar item ao inventário',
    });
  }
};

// Atualizar item do inventário
export const atualizarItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantidadeContada, lote, observacoes } = req.body;

    const item = await prisma.inventarioItem.findUnique({
      where: { id: itemId },
      include: {
        inventario: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    if (item.inventario.status !== 'EM_ANDAMENTO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas itens de inventários em andamento podem ser editados',
      });
    }

    const updateData = {};

    if (quantidadeContada !== undefined) {
      const quantidadeContadaFloat = parseFloat(quantidadeContada);
      const quantidadeSistema = parseFloat(item.quantidadeSistema);
      const divergencia = quantidadeContadaFloat - quantidadeSistema;

      updateData.quantidadeContada = quantidadeContadaFloat.toString();
      updateData.divergencia = divergencia.toString();
    }

    if (lote !== undefined) updateData.lote = lote;
    if (observacoes !== undefined) updateData.observacoes = observacoes;

    const itemAtualizado = await prisma.inventarioItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        produto: true,
        cor: true,
      },
    });

    logger.info(`Item atualizado no inventário: ${itemAtualizado.id}`);

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      data: itemAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao atualizar item do inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar item do inventário',
    });
  }
};

// Remover item do inventário
export const removerItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.inventarioItem.findUnique({
      where: { id: itemId },
      include: {
        inventario: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    if (item.inventario.status !== 'EM_ANDAMENTO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas itens de inventários em andamento podem ser removidos',
      });
    }

    await prisma.inventarioItem.delete({
      where: { id: itemId },
    });

    logger.info(`Item removido do inventário: ${itemId}`);

    res.json({
      success: true,
      message: 'Item removido com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao remover item do inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover item do inventário',
    });
  }
};

// Finalizar inventário (aceitar divergências e atualizar estoque)
export const finalizarInventario = async (req, res) => {
  try {
    const { id } = req.params;

    const inventario = await prisma.inventario.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventário não encontrado',
      });
    }

    if (inventario.status !== 'EM_ANDAMENTO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas inventários em andamento podem ser finalizados',
      });
    }

    if (inventario.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Inventário não possui itens. Adicione pelo menos um item antes de finalizar',
      });
    }

    // Atualizar estoque com base nas contagens
    for (const item of inventario.items) {
      const quantidadeContada = parseFloat(item.quantidadeContada);

      // Atualizar ou criar registro de estoque
      await prisma.estoque.upsert({
        where: {
          produtoId_corId_localizacao: {
            produtoId: item.produtoId,
            corId: item.corId,
            localizacao: 'CD',
          },
        },
        update: {
          quantidade: quantidadeContada.toString(),
          updatedAt: new Date(),
        },
        create: {
          produtoId: item.produtoId,
          corId: item.corId,
          localizacao: 'CD',
          quantidade: quantidadeContada.toString(),
        },
      });

      // Criar movimento de estoque
      await prisma.movimentacaoEstoque.create({
        data: {
          produtoId: item.produtoId,
          corId: item.corId,
          tipo: 'AJUSTE_INVENTARIO',
          quantidade: parseFloat(item.divergencia).toString(),
          localizacao: 'CD',
          userId: req.user.id,
          observacoes: `Inventário ${inventario.numero} - Ajuste de estoque`,
        },
      });
    }

    // Atualizar status do inventário
    const inventarioFinalizado = await prisma.inventario.update({
      where: { id },
      data: {
        status: 'FINALIZADO',
        dataFinalizacao: new Date(),
      },
      include: {
        responsavel: true,
        items: {
          include: {
            produto: true,
            cor: true,
          },
        },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Inventario',
        entityId: id,
        newData: JSON.stringify({ status: 'FINALIZADO' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Inventário finalizado: ${inventario.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Inventário finalizado e estoque atualizado com sucesso',
      data: inventarioFinalizado,
    });
  } catch (error) {
    logger.error('Erro ao finalizar inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao finalizar inventário',
    });
  }
};

// Cancelar inventário
export const cancelarInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!motivo) {
      return res.status(400).json({
        success: false,
        message: 'Motivo do cancelamento é obrigatório',
      });
    }

    const inventario = await prisma.inventario.findUnique({
      where: { id },
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventário não encontrado',
      });
    }

    if (inventario.status !== 'EM_ANDAMENTO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas inventários em andamento podem ser cancelados',
      });
    }

    const inventarioCancelado = await prisma.inventario.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        observacoes: `${inventario.observacoes || ''}\n\nMotivo do cancelamento: ${motivo}`,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Inventario',
        entityId: id,
        newData: JSON.stringify({ status: 'CANCELADO', motivo }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Inventário cancelado: ${inventario.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Inventário cancelado com sucesso',
      data: inventarioCancelado,
    });
  } catch (error) {
    logger.error('Erro ao cancelar inventário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar inventário',
    });
  }
};

// Processar OCR de etiqueta (placeholder para integração com Tesseract)
export const processarOCR = async (req, res) => {
  try {
    const { imagemBase64 } = req.body;

    if (!imagemBase64) {
      return res.status(400).json({
        success: false,
        message: 'Imagem é obrigatória',
      });
    }

    // TODO: Integração com Tesseract OCR
    // Por enquanto, retorna um placeholder
    const ocrResult = {
      codigoProduto: 'PRODUTO-001',
      cor: 'AZUL',
      lote: 'L123456',
      quantidade: 100,
      confianca: 0.85,
    };

    logger.info('OCR processado (placeholder)');

    res.json({
      success: true,
      message: 'OCR processado com sucesso',
      data: ocrResult,
    });
  } catch (error) {
    logger.error('Erro ao processar OCR:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar OCR',
    });
  }
};

// Sistema DEPARA - Buscar mapeamentos
export const getDEPARA = async (req, res) => {
  try {
    const { termo } = req.query;

    const where = {};
    if (termo) {
      where.OR = [
        { nomeFornecedor: { contains: termo } },
        { nomeERP: { contains: termo } },
      ];
    }

    const mapeamentos = await prisma.dEPARA.findMany({
      where,
      orderBy: {
        nomeFornecedor: 'asc',
      },
    });

    res.json({
      success: true,
      data: mapeamentos,
    });
  } catch (error) {
    logger.error('Erro ao buscar DEPARA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar DEPARA',
    });
  }
};

// Sistema DEPARA - Criar mapeamento
export const createDEPARA = async (req, res) => {
  try {
    const { nomeFornecedor, nomeERP, produtoId } = req.body;

    if (!nomeFornecedor || !nomeERP) {
      return res.status(400).json({
        success: false,
        message: 'Nome do fornecedor e nome ERP são obrigatórios',
      });
    }

    // Verificar se nome do fornecedor já existe
    const existente = await prisma.dEPARA.findUnique({
      where: { nomeFornecedor },
    });

    if (existente) {
      return res.status(400).json({
        success: false,
        message: 'Nome do fornecedor já cadastrado',
      });
    }

    const mapeamento = await prisma.dEPARA.create({
      data: {
        nomeFornecedor,
        nomeERP,
        produtoId: produtoId || null,
      },
    });

    logger.info(`DEPARA criado: ${nomeFornecedor} -> ${nomeERP}`);

    res.status(201).json({
      success: true,
      message: 'Mapeamento DEPARA criado com sucesso',
      data: mapeamento,
    });
  } catch (error) {
    logger.error('Erro ao criar DEPARA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar DEPARA',
    });
  }
};

// Sistema DEPARA - Atualizar mapeamento
export const updateDEPARA = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeFornecedor, nomeERP, produtoId } = req.body;

    const mapeamento = await prisma.dEPARA.update({
      where: { id },
      data: {
        ...(nomeFornecedor !== undefined && { nomeFornecedor }),
        ...(nomeERP !== undefined && { nomeERP }),
        ...(produtoId !== undefined && { produtoId }),
      },
    });

    logger.info(`DEPARA atualizado: ${id}`);

    res.json({
      success: true,
      message: 'Mapeamento DEPARA atualizado com sucesso',
      data: mapeamento,
    });
  } catch (error) {
    logger.error('Erro ao atualizar DEPARA:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar DEPARA',
    });
  }
};
