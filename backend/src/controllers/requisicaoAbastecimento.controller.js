import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Função auxiliar para gerar número da requisição
async function gerarNumeroRequisicao() {
  const ano = new Date().getFullYear();
  const ultimaRequisicao = await prisma.requisicoesAbastecimento.findFirst({
    where: {
      numero: {
        startsWith: `REQ-${ano}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequencial = 1;
  if (ultimaRequisicao) {
    const partes = ultimaRequisicao.numero.split('-');
    sequencial = parseInt(partes[2]) + 1;
  }

  return `REQ-${ano}-${sequencial.toString().padStart(4, '0')}`;
}

// Get all requisições (com filtros e ordenação por prioridade)
export const getAllRequisicoes = async (req, res) => {
  try {
    const { status, lojaId } = req.query;
    const userType = req.user.type;
    const userLojaId = req.user.lojaId;

    const where = {};

    // Filtro de status
    if (status) where.status = status;

    // Gerente de loja só vê requisições da própria loja
    if (userType === 'GERENTE_LOJA' && userLojaId) {
      where.lojaId = userLojaId;
    }

    // Filtro opcional por loja (para CD e Admin)
    if (lojaId && (userType === 'USUARIO_CD' || userType === 'ADMIN')) {
      where.lojaId = lojaId;
    }

    const requisicoes = await prisma.requisicoesAbastecimento.findMany({
      where,
      include: {
        loja: {
          select: {
            id: true,
            codigo: true,
            nome: true,
            prioridade: true,
          },
        },
        solicitante: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
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
          ],
        },
      },
      orderBy: [
        { loja: { prioridade: 'asc' } }, // Prioridade da loja (G1 = 1 primeiro)
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: requisicoes,
    });
  } catch (error) {
    logger.error('Erro ao buscar requisições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar requisições',
    });
  }
};

// Get requisição by ID
export const getRequisicaoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.user.type;
    const userLojaId = req.user.lojaId;

    const requisicao = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
      include: {
        loja: true,
        solicitante: {
          select: {
            id: true,
            name: true,
            email: true,
            telefone: true,
          },
        },
        items: {
          include: {
            produto: true,
            cor: true,
          },
          orderBy: [
            { produto: { curva: 'asc' } },
            { produto: { nome: 'asc' } },
          ],
        },
        romaneios: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!requisicao) {
      return res.status(404).json({
        success: false,
        message: 'Requisição não encontrada',
      });
    }

    // Gerente de loja só pode ver requisições da própria loja
    if (userType === 'GERENTE_LOJA' && requisicao.lojaId !== userLojaId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
      });
    }

    res.json({
      success: true,
      data: requisicao,
    });
  } catch (error) {
    logger.error('Erro ao buscar requisição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar requisição',
    });
  }
};

// Create requisição (GERENTE_LOJA)
export const createRequisicao = async (req, res) => {
  try {
    const { items, observacoes } = req.body;
    const userLojaId = req.user.lojaId;

    // Validação
    if (!userLojaId) {
      return res.status(400).json({
        success: false,
        message: 'Usuário não está vinculado a uma loja',
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário incluir pelo menos um item',
      });
    }

    // Validar items
    for (const item of items) {
      if (!item.produtoId || !item.corId || !item.quantidadeSolicitada || item.quantidadeSolicitada <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Todos os itens devem ter produto, cor e quantidade válida',
        });
      }
    }

    // Gerar número da requisição
    const numero = await gerarNumeroRequisicao();

    // Criar requisição com items
    const requisicao = await prisma.requisicoesAbastecimento.create({
      data: {
        numero,
        lojaId: userLojaId,
        solicitanteId: req.user.id,
        observacoes,
        items: {
          create: items.map(item => ({
            produtoId: item.produtoId,
            corId: item.corId,
            quantidadeSolicitada: item.quantidadeSolicitada,
          })),
        },
      },
      include: {
        loja: true,
        solicitante: {
          select: {
            name: true,
            email: true,
          },
        },
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
        action: 'CREATE',
        entity: 'RequisicoesAbastecimento',
        entityId: requisicao.id,
        newData: JSON.stringify({
          numero: requisicao.numero,
          loja: requisicao.loja.nome,
          items: items.length,
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Requisição criada: ${requisicao.numero} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Requisição criada com sucesso',
      data: requisicao,
    });
  } catch (error) {
    logger.error('Erro ao criar requisição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar requisição',
    });
  }
};

// Aprovar requisição (USUARIO_CD)
export const aprovarRequisicao = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, justificativaRecusa } = req.body;

    const requisicao = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!requisicao) {
      return res.status(404).json({
        success: false,
        message: 'Requisição não encontrada',
      });
    }

    if (requisicao.status !== 'PENDENTE') {
      return res.status(400).json({
        success: false,
        message: 'Apenas requisições pendentes podem ser aprovadas',
      });
    }

    // Validar items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário informar os itens aprovados',
      });
    }

    // Determinar status final
    let novoStatus = 'APROVADA';
    let todasAprovadas = true;
    let todasRecusadas = true;

    for (const item of items) {
      const quantidadeAprovada = parseFloat(item.quantidadeAprovada || 0);
      const itemOriginal = requisicao.items.find(i => i.id === item.itemId);

      if (!itemOriginal) continue;

      const quantidadeSolicitada = parseFloat(itemOriginal.quantidadeSolicitada);

      if (quantidadeAprovada > 0) {
        todasRecusadas = false;
        if (quantidadeAprovada < quantidadeSolicitada) {
          todasAprovadas = false;
        }
      } else {
        todasAprovadas = false;
      }
    }

    if (todasRecusadas) {
      novoStatus = 'RECUSADA';
      if (!justificativaRecusa) {
        return res.status(400).json({
          success: false,
          message: 'Justificativa é obrigatória para recusa total',
        });
      }
    } else if (!todasAprovadas) {
      novoStatus = 'APROVADA_PARCIAL';
    }

    // Atualizar requisição e items
    await prisma.$transaction(async (tx) => {
      // Atualizar requisição
      await tx.requisicoesAbastecimento.update({
        where: { id },
        data: {
          status: novoStatus,
          aprovadoEm: new Date(),
          justificativaRecusa: novoStatus === 'RECUSADA' ? justificativaRecusa : null,
        },
      });

      // Atualizar items
      for (const item of items) {
        await tx.requisicoesAbastecimentoItem.update({
          where: { id: item.itemId },
          data: {
            quantidadeAprovada: item.quantidadeAprovada || 0,
          },
        });
      }
    });

    // Buscar requisição atualizada
    const requisicaoAtualizada = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
      include: {
        loja: true,
        solicitante: {
          select: {
            name: true,
            email: true,
          },
        },
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
        action: novoStatus === 'RECUSADA' ? 'REJECT' : 'APPROVE',
        entity: 'RequisicoesAbastecimento',
        entityId: id,
        newData: JSON.stringify({ status: novoStatus }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Requisição ${novoStatus.toLowerCase()}: ${requisicao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: `Requisição ${novoStatus === 'APROVADA' ? 'aprovada' : novoStatus === 'APROVADA_PARCIAL' ? 'aprovada parcialmente' : 'recusada'} com sucesso`,
      data: requisicaoAtualizada,
    });
  } catch (error) {
    logger.error('Erro ao aprovar requisição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar requisição',
    });
  }
};

// Atender requisição (USUARIO_CD)
export const atenderRequisicao = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    const requisicao = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!requisicao) {
      return res.status(404).json({
        success: false,
        message: 'Requisição não encontrada',
      });
    }

    if (!['APROVADA', 'APROVADA_PARCIAL', 'ATENDIDA_PARCIAL'].includes(requisicao.status)) {
      return res.status(400).json({
        success: false,
        message: 'Apenas requisições aprovadas podem ser atendidas',
      });
    }

    // Validar items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário informar os itens atendidos',
      });
    }

    // Determinar status final
    let novoStatus = 'ATENDIDA';
    let todasAtendidas = true;

    for (const item of items) {
      const quantidadeAtendida = parseFloat(item.quantidadeAtendida || 0);
      const itemOriginal = requisicao.items.find(i => i.id === item.itemId);

      if (!itemOriginal) continue;

      const quantidadeAprovada = parseFloat(itemOriginal.quantidadeAprovada || itemOriginal.quantidadeSolicitada);

      if (quantidadeAtendida < quantidadeAprovada) {
        todasAtendidas = false;
      }
    }

    if (!todasAtendidas) {
      novoStatus = 'ATENDIDA_PARCIAL';
    }

    // Atualizar requisição e items
    await prisma.$transaction(async (tx) => {
      // Atualizar requisição
      await tx.requisicoesAbastecimento.update({
        where: { id },
        data: {
          status: novoStatus,
        },
      });

      // Atualizar items
      for (const item of items) {
        await tx.requisicoesAbastecimentoItem.update({
          where: { id: item.itemId },
          data: {
            quantidadeAtendida: item.quantidadeAtendida || 0,
          },
        });
      }
    });

    // Buscar requisição atualizada
    const requisicaoAtualizada = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
      include: {
        loja: true,
        solicitante: {
          select: {
            name: true,
            email: true,
          },
        },
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
        action: 'FULFILL',
        entity: 'RequisicoesAbastecimento',
        entityId: id,
        newData: JSON.stringify({ status: novoStatus }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Requisição atendida: ${requisicao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: `Requisição ${novoStatus === 'ATENDIDA' ? 'totalmente atendida' : 'parcialmente atendida'} com sucesso`,
      data: requisicaoAtualizada,
    });
  } catch (error) {
    logger.error('Erro ao atender requisição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atender requisição',
    });
  }
};

// Marcar requisição como enviada (USUARIO_CD)
export const marcarComoEnviada = async (req, res) => {
  try {
    const { id } = req.params;

    const requisicao = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
    });

    if (!requisicao) {
      return res.status(404).json({
        success: false,
        message: 'Requisição não encontrada',
      });
    }

    if (!['ATENDIDA', 'ATENDIDA_PARCIAL'].includes(requisicao.status)) {
      return res.status(400).json({
        success: false,
        message: 'Apenas requisições atendidas podem ser marcadas como enviadas',
      });
    }

    const requisicaoAtualizada = await prisma.requisicoesAbastecimento.update({
      where: { id },
      data: {
        status: 'ENVIADA',
      },
      include: {
        loja: true,
        solicitante: {
          select: {
            name: true,
            email: true,
          },
        },
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
        action: 'SEND',
        entity: 'RequisicoesAbastecimento',
        entityId: id,
        newData: JSON.stringify({ status: 'ENVIADA' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Requisição enviada: ${requisicao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Requisição marcada como enviada',
      data: requisicaoAtualizada,
    });
  } catch (error) {
    logger.error('Erro ao marcar requisição como enviada:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar requisição',
    });
  }
};

// Delete requisição (apenas PENDENTE)
export const deleteRequisicao = async (req, res) => {
  try {
    const { id } = req.params;
    const userType = req.user.type;
    const userLojaId = req.user.lojaId;

    const requisicao = await prisma.requisicoesAbastecimento.findUnique({
      where: { id },
    });

    if (!requisicao) {
      return res.status(404).json({
        success: false,
        message: 'Requisição não encontrada',
      });
    }

    // Apenas gerente da própria loja ou admin pode deletar
    if (userType === 'GERENTE_LOJA' && requisicao.lojaId !== userLojaId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
      });
    }

    // Apenas requisições pendentes podem ser deletadas
    if (requisicao.status !== 'PENDENTE') {
      return res.status(400).json({
        success: false,
        message: 'Apenas requisições pendentes podem ser excluídas',
      });
    }

    await prisma.requisicoesAbastecimento.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'RequisicoesAbastecimento',
        entityId: id,
        oldData: JSON.stringify({ numero: requisicao.numero }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Requisição deletada: ${requisicao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Requisição excluída com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar requisição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir requisição',
    });
  }
};
