import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { randomBytes } from 'crypto';

// Helper: Gerar número de pedido B2B
async function gerarNumeroPedido() {
  const ano = new Date().getFullYear();

  const ultimoPedido = await prisma.pedidoB2B.findFirst({
    where: {
      numero: {
        startsWith: `B2B-${ano}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequencial = 1;
  if (ultimoPedido) {
    const partes = ultimoPedido.numero.split('-');
    sequencial = parseInt(partes[2]) + 1;
  }

  return `B2B-${ano}-${sequencial.toString().padStart(4, '0')}`;
}

// Helper: Validar CNPJ (apenas formato)
function validarFormatoCNPJ(cnpj) {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.length === 14;
}

// Helper: Validar IE (apenas formato básico)
function validarFormatoIE(ie) {
  if (!ie) return true; // IE é opcional
  const ieLimpo = ie.replace(/[^\d]/g, '');
  return ieLimpo.length >= 9 && ieLimpo.length <= 14;
}

// Helper: Validar quantidade mínima (múltiplos de 60m por cor)
function validarQuantidades(items) {
  for (const item of items) {
    if (item.quantidade % 60 !== 0) {
      return {
        valido: false,
        mensagem: `Item ${item.produtoId}: quantidade deve ser múltiplo de 60m (informado: ${item.quantidade}m)`,
      };
    }
  }
  return { valido: true };
}

// Helper: Calcular valor total
function calcularValorTotal(items) {
  return items.reduce((acc, item) => {
    return acc + parseFloat(item.precoUnitario) * item.quantidade;
  }, 0);
}

// Listar todos os pedidos B2B
export const getAllPedidos = async (req, res) => {
  try {
    const { status, clienteId } = req.query;
    const userId = req.user.id;
    const userType = req.user.type;

    const where = {};

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por cliente (se fornecido)
    if (clienteId) {
      where.clienteId = clienteId;
    }

    // Se for cliente B2B, só mostra seus próprios pedidos
    if (userType === 'CLIENTE_B2B') {
      where.clienteId = userId;
    }

    const pedidos = await prisma.pedidoB2B.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    logger.error('Erro ao buscar pedidos B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedidos B2B',
    });
  }
};

// Buscar pedido B2B por ID
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            email: true,
            cnpj: true,
            inscricaoEstadual: true,
            telefone: true,
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

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    // Se for cliente B2B, só pode ver seus próprios pedidos
    if (userType === 'CLIENTE_B2B' && pedido.clienteId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado',
      });
    }

    res.json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    logger.error('Erro ao buscar pedido B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar pedido B2B',
    });
  }
};

// Criar pedido B2B
export const createPedido = async (req, res) => {
  try {
    const { items, observacoes, enderecoEntrega, formaPagamento } = req.body;
    const userId = req.user.id;

    // Validações básicas
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário incluir pelo menos um item no pedido',
      });
    }

    if (!enderecoEntrega) {
      return res.status(400).json({
        success: false,
        message: 'Endereço de entrega é obrigatório',
      });
    }

    if (!formaPagamento) {
      return res.status(400).json({
        success: false,
        message: 'Forma de pagamento é obrigatória',
      });
    }

    // Buscar dados do cliente
    const cliente = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado',
      });
    }

    // Validar CNPJ e IE
    if (!validarFormatoCNPJ(cliente.cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido. Formato esperado: 00.000.000/0000-00',
      });
    }

    if (cliente.ie && !validarFormatoIE(cliente.ie)) {
      return res.status(400).json({
        success: false,
        message: 'IE inválido',
      });
    }

    // Validar quantidades (múltiplos de 60m)
    const validacaoQtd = validarQuantidades(items);
    if (!validacaoQtd.valido) {
      return res.status(400).json({
        success: false,
        message: validacaoQtd.mensagem,
      });
    }

    // Validar que todos os itens têm preço unitário
    for (const item of items) {
      if (!item.precoUnitario || parseFloat(item.precoUnitario) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Todos os itens devem ter preço unitário informado',
        });
      }
    }

    // Calcular valor total
    const valorTotal = calcularValorTotal(items);

    // Validar valor mínimo de R$500
    if (valorTotal < 500) {
      return res.status(400).json({
        success: false,
        message: `Valor mínimo do pedido é R$ 500,00. Valor atual: R$ ${valorTotal.toFixed(2)}`,
      });
    }

    // Gerar número do pedido
    const numero = await gerarNumeroPedido();

    // Calcular prazo de entrega (15 dias corridos a partir da aprovação, por enquanto null)
    const dataPrevisaoEntrega = null;

    // Criar pedido
    const pedido = await prisma.pedidoB2B.create({
      data: {
        numero,
        clienteId: userId,
        status: 'PENDENTE',
        valorTotal: valorTotal.toString(),
        observacoes,
        enderecoEntrega,
        formaPagamento,
        dataPrevisaoEntrega,
        items: {
          create: items.map((item) => ({
            produtoId: item.produtoId,
            corId: item.corId,
            quantidade: parseInt(item.quantidade),
            precoUnitario: item.precoUnitario.toString(),
          })),
        },
      },
      include: {
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
        entity: 'PedidoB2B',
        entityId: pedido.id,
        newData: JSON.stringify({ numero: pedido.numero, valorTotal }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido B2B criado: ${pedido.numero} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: pedido,
    });
  } catch (error) {
    logger.error('Erro ao criar pedido B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pedido B2B',
    });
  }
};

// Aprovar pedido B2B (Admin/Operador)
export const aprovarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status !== 'PENDENTE') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pedidos pendentes podem ser aprovados',
      });
    }

    // Calcular prazo de entrega (15 dias corridos a partir de agora)
    const dataPrevisaoEntrega = new Date();
    dataPrevisaoEntrega.setDate(dataPrevisaoEntrega.getDate() + 15);

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'APROVADA',
        dataAprovacao: new Date(),
        dataPrevisaoEntrega,
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'APROVADA' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido B2B aprovado: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Pedido aprovado com sucesso',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao aprovar pedido B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar pedido B2B',
    });
  }
};

// Recusar pedido B2B (Admin/Operador)
export const recusarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoRecusa } = req.body;

    if (!motivoRecusa) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da recusa é obrigatório',
      });
    }

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status !== 'PENDENTE') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pedidos pendentes podem ser recusados',
      });
    }

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'RECUSADA',
        motivoRecusa,
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'RECUSADA', motivoRecusa }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido B2B recusado: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Pedido recusado com sucesso',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao recusar pedido B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao recusar pedido B2B',
    });
  }
};

// Iniciar separação (Admin/Operador)
export const iniciarSeparacao = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status !== 'APROVADA') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pedidos aprovados podem iniciar separação',
      });
    }

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'EM_SEPARACAO',
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'EM_SEPARACAO' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Separação iniciada: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Separação iniciada com sucesso',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao iniciar separação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar separação',
    });
  }
};

// Marcar como enviado (Admin/Operador)
export const marcarComoEnviado = async (req, res) => {
  try {
    const { id } = req.params;
    const { numeroRastreio, transportadora } = req.body;

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status !== 'EM_SEPARACAO') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pedidos em separação podem ser enviados',
      });
    }

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'ENVIADA',
        dataEnvio: new Date(),
        numeroRastreio: numeroRastreio || null,
        transportadora: transportadora || null,
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'ENVIADA', numeroRastreio, transportadora }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido enviado: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Pedido marcado como enviado',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao marcar pedido como enviado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar pedido como enviado',
    });
  }
};

// Marcar como entregue (Admin/Operador)
export const marcarComoEntregue = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status !== 'ENVIADA') {
      return res.status(400).json({
        success: false,
        message: 'Apenas pedidos enviados podem ser marcados como entregues',
      });
    }

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'ENTREGUE',
        dataEntrega: new Date(),
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'ENTREGUE' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido entregue: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Pedido marcado como entregue',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao marcar pedido como entregue:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar pedido como entregue',
    });
  }
};

// Cancelar pedido (Admin/Cliente antes de aprovação)
export const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelamento } = req.body;
    const userId = req.user.id;
    const userType = req.user.type;

    if (!motivoCancelamento) {
      return res.status(400).json({
        success: false,
        message: 'Motivo do cancelamento é obrigatório',
      });
    }

    const pedido = await prisma.pedidoB2B.findUnique({
      where: { id },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    // Cliente só pode cancelar seus próprios pedidos pendentes
    if (userType === 'CLIENTE_B2B') {
      if (pedido.clienteId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Você não pode cancelar pedidos de outros clientes',
        });
      }
      if (pedido.status !== 'PENDENTE') {
        return res.status(400).json({
          success: false,
          message: 'Apenas pedidos pendentes podem ser cancelados pelo cliente',
        });
      }
    }

    // Admin/Operador pode cancelar em qualquer status exceto ENTREGUE
    if (pedido.status === 'ENTREGUE') {
      return res.status(400).json({
        success: false,
        message: 'Pedidos já entregues não podem ser cancelados',
      });
    }

    const pedidoAtualizado = await prisma.pedidoB2B.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        motivoCancelamento,
      },
      include: {
        cliente: true,
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
        entity: 'PedidoB2B',
        entityId: id,
        newData: JSON.stringify({ status: 'CANCELADA', motivoCancelamento }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Pedido B2B cancelado: ${pedidoAtualizado.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      data: pedidoAtualizado,
    });
  } catch (error) {
    logger.error('Erro ao cancelar pedido B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar pedido B2B',
    });
  }
};
