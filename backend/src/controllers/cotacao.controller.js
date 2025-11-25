import prisma from '../config/database.js';
import logger from '../config/logger.js';
import { randomBytes } from 'crypto';

// Gerar token único para fornecedor acessar cotação
function gerarTokenFornecedor() {
  return randomBytes(32).toString('hex');
}

// Gerar número da cotação
async function gerarNumeroCotacao() {
  const ano = new Date().getFullYear();
  const ultimaCotacao = await prisma.cotacao.findFirst({
    where: {
      numero: {
        startsWith: `COT-${ano}-`,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let sequencial = 1;
  if (ultimaCotacao) {
    const partes = ultimaCotacao.numero.split('-');
    sequencial = parseInt(partes[2]) + 1;
  }

  return `COT-${ano}-${sequencial.toString().padStart(4, '0')}`;
}

// Listar todas as cotações
export const getAllCotacoes = async (req, res) => {
  try {
    const { status } = req.query;
    const userType = req.user.type;

    const where = {};
    if (status) where.status = status;

    const cotacoes = await prisma.cotacao.findMany({
      where,
      include: {
        criador: {
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
        },
        respostas: {
          include: {
            fornecedor: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: cotacoes,
    });
  } catch (error) {
    logger.error('Erro ao buscar cotações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cotações',
    });
  }
};

// Buscar cotação por ID
export const getCotacaoById = async (req, res) => {
  try {
    const { id } = req.params;

    const cotacao = await prisma.cotacao.findUnique({
      where: { id },
      include: {
        criador: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        fornecedorEscolhido: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        items: {
          include: {
            produto: true,
            cor: true,
            respostas: {
              include: {
                fornecedor: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        respostas: {
          include: {
            fornecedor: true,
          },
        },
        tokens: {
          include: {
            fornecedor: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
      },
    });

    // Mapear respostas para formato esperado pelo frontend
    if (cotacao) {
      cotacao.items = cotacao.items.map(item => ({
        ...item,
        respostasFornecedor: (item.respostas || []).map(r => ({
          id: r.id,
          fornecedorId: r.fornecedorId,
          fornecedor: r.fornecedor,
          precoUnitario: r.preco,
          preco: r.preco,
          prazoEntrega: r.prazoEntrega,
          observacoes: r.observacoes,
          createdAt: r.createdAt,
        })),
      }));
    }

    if (!cotacao) {
      return res.status(404).json({
        success: false,
        message: 'Cotação não encontrada',
      });
    }

    res.json({
      success: true,
      data: cotacao,
    });
  } catch (error) {
    logger.error('Erro ao buscar cotação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cotação',
    });
  }
};

// Criar nova cotação (USUARIO_CD)
export const createCotacao = async (req, res) => {
  try {
    const { items, observacoes, prazoExpiracao } = req.body;

    // Validação
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário incluir pelo menos um item',
      });
    }

    for (const item of items) {
      if (!item.produtoId || !item.corId || !item.quantidade || item.quantidade <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Todos os itens devem ter produto, cor e quantidade válida',
        });
      }
    }

    // Gerar número
    const numero = await gerarNumeroCotacao();

    // Validar prazo de expiração
    if (!prazoExpiracao) {
      return res.status(400).json({
        success: false,
        message: 'Prazo de expiração é obrigatório',
      });
    }

    const prazoRespostaDate = new Date(prazoExpiracao);

    // Buscar todos os fornecedores ativos
    const fornecedores = await prisma.fornecedor.findMany({
      where: { active: true },
    });

    if (fornecedores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum fornecedor cadastrado',
      });
    }

    // Criar cotação com items
    const cotacao = await prisma.cotacao.create({
      data: {
        numero,
        criadorId: req.user.id,
        observacoes,
        prazoResposta: prazoRespostaDate,
        items: {
          create: items.map(item => ({
            produtoId: item.produtoId,
            corId: item.corId,
            quantidadeSolicitada: item.quantidade,
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

    // Criar tokens para cada fornecedor
    const tokens = [];
    for (const fornecedor of fornecedores) {
      const token = gerarTokenFornecedor();

      await prisma.cotacaoFornecedorToken.create({
        data: {
          cotacaoId: cotacao.id,
          fornecedorId: fornecedor.id,
          token,
        },
      });

      tokens.push({
        fornecedor: fornecedor.nome,
        email: fornecedor.email,
        telefone: fornecedor.telefone,
        link: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cotacao/${token}`,
      });
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'Cotacoes',
        entityId: cotacao.id,
        newData: JSON.stringify({
          numero: cotacao.numero,
          items: items.length,
          fornecedores: fornecedores.length,
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Cotação criada: ${cotacao.numero} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Cotação criada com sucesso',
      data: {
        cotacao,
        tokens,
      },
    });
  } catch (error) {
    logger.error('Erro ao criar cotação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar cotação',
    });
  }
};

// Buscar cotação por token (fornecedor)
export const getCotacaoByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const cotacaoToken = await prisma.cotacaoFornecedorToken.findUnique({
      where: { token },
      include: {
        cotacao: {
          include: {
            items: {
              include: {
                produto: true,
                cor: true,
              },
            },
          },
        },
        fornecedor: true,
      },
    });

    if (!cotacaoToken) {
      return res.status(404).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Verificar se já expirou
    const agora = new Date();
    if (cotacaoToken.cotacao.prazoResposta < agora && cotacaoToken.cotacao.status === 'ENVIADA') {
      return res.status(400).json({
        success: false,
        message: 'Prazo de resposta expirado',
      });
    }

    // Buscar respostas deste fornecedor
    const respostas = await prisma.cotacaoItemResposta.findMany({
      where: {
        cotacaoItemId: {
          in: cotacaoToken.cotacao.items.map(i => i.id),
        },
        fornecedorId: cotacaoToken.fornecedorId,
      },
    });

    // Mapear respostas por item (retornar como array para o frontend)
    const respostasMap = {};
    respostas.forEach(r => {
      if (!respostasMap[r.cotacaoItemId]) {
        respostasMap[r.cotacaoItemId] = [];
      }
      respostasMap[r.cotacaoItemId].push({
        id: r.id,
        fornecedorId: r.fornecedorId,
        preco: r.preco,
        prazoEntrega: r.prazoEntrega,
        observacoes: r.observacoes,
        precoUnitario: r.preco, // alias para compatibilidade
      });
    });

    // Adicionar respostas aos items
    const itemsComRespostas = cotacaoToken.cotacao.items.map(item => ({
      ...item,
      respostasFornecedor: respostasMap[item.id] || [],
    }));

    res.json({
      success: true,
      data: {
        cotacao: {
          ...cotacaoToken.cotacao,
          items: itemsComRespostas,
        },
        fornecedor: cotacaoToken.fornecedor,
        respondido: cotacaoToken.respondido,
        dataResposta: cotacaoToken.dataResposta,
      },
    });
  } catch (error) {
    logger.error('Erro ao buscar cotação por token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cotação',
    });
  }
};

// Fornecedor responder cotação
export const responderCotacao = async (req, res) => {
  try {
    const { token } = req.params;
    const { respostas } = req.body;

    const cotacaoToken = await prisma.cotacaoFornecedorToken.findUnique({
      where: { token },
      include: {
        cotacao: true,
      },
    });

    if (!cotacaoToken) {
      return res.status(404).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Verificar se já respondeu
    if (cotacaoToken.respondido) {
      return res.status(400).json({
        success: false,
        message: 'Esta cotação já foi respondida',
      });
    }

    // Verificar prazo
    const agora = new Date();
    if (cotacaoToken.cotacao.prazoResposta < agora) {
      return res.status(400).json({
        success: false,
        message: 'Prazo de resposta expirado',
      });
    }

    // Validar respostas
    if (!respostas || respostas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'É necessário responder pelo menos um item',
      });
    }

    // Salvar respostas
    await prisma.$transaction(async (tx) => {
      for (const resposta of respostas) {
        if (resposta.preco && resposta.preco > 0) {
          await tx.cotacaoItemResposta.create({
            data: {
              cotacaoItemId: resposta.itemId,
              fornecedorId: cotacaoToken.fornecedorId,
              tokenId: cotacaoToken.id,
              preco: resposta.preco,
              prazoEntrega: resposta.prazoEntrega || null,
              observacoes: resposta.observacoes || null,
            },
          });
        }
      }

      // Marcar como respondido
      await tx.cotacaoFornecedorToken.update({
        where: { id: cotacaoToken.id },
        data: {
          respondido: true,
          dataResposta: new Date(),
        },
      });
    });

    logger.info(`Cotação respondida: ${cotacaoToken.cotacao.numero} por fornecedor ${cotacaoToken.fornecedorId}`);

    res.json({
      success: true,
      message: 'Resposta enviada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao responder cotação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar resposta',
    });
  }
};

// Fechar cotação (USUARIO_CD)
export const fecharCotacao = async (req, res) => {
  try {
    const { id } = req.params;

    const cotacao = await prisma.cotacao.findUnique({
      where: { id },
    });

    if (!cotacao) {
      return res.status(404).json({
        success: false,
        message: 'Cotação não encontrada',
      });
    }

    if (cotacao.status !== 'ABERTA') {
      return res.status(400).json({
        success: false,
        message: 'Apenas cotações abertas podem ser fechadas',
      });
    }

    await prisma.cotacao.update({
      where: { id },
      data: {
        status: 'FECHADA',
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Cotacoes',
        entityId: id,
        newData: JSON.stringify({ status: 'FECHADA' }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Cotação fechada: ${cotacao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Cotação fechada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao fechar cotação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fechar cotação',
    });
  }
};

// Aprovar fornecedor vencedor (USUARIO_CD / Gerente Compras)
export const aprovarFornecedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { fornecedorId, items } = req.body;

    const cotacao = await prisma.cotacao.findUnique({
      where: { id },
    });

    if (!cotacao) {
      return res.status(404).json({
        success: false,
        message: 'Cotação não encontrada',
      });
    }

    // Atualizar cotação
    await prisma.cotacao.update({
      where: { id },
      data: {
        status: 'APROVADA',
        fornecedorEscolhidoId: fornecedorId,
      },
    });

    // TODO: Gerar pedido de compra aqui
    // Será implementado quando integrar com o sistema

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'APPROVE',
        entity: 'Cotacoes',
        entityId: id,
        newData: JSON.stringify({
          status: 'APROVADA',
          fornecedorEscolhidoId: fornecedorId,
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Cotação aprovada: ${cotacao.numero} - Fornecedor: ${fornecedorId} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Fornecedor aprovado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao aprovar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar fornecedor',
    });
  }
};

// Cancelar cotação (USUARIO_CD / Admin)
export const cancelarCotacao = async (req, res) => {
  try {
    const { id } = req.params;

    const cotacao = await prisma.cotacao.findUnique({
      where: { id },
    });

    if (!cotacao) {
      return res.status(404).json({
        success: false,
        message: 'Cotação não encontrada',
      });
    }

    if (cotacao.status === 'APROVADA') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma cotação já aprovada',
      });
    }

    // Deletar cotação e todos os dados relacionados (cascade)
    await prisma.cotacao.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'Cotacoes',
        entityId: id,
        oldData: JSON.stringify({ numero: cotacao.numero, status: cotacao.status }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Cotação cancelada: ${cotacao.numero} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Cotação cancelada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao cancelar cotação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar cotação',
    });
  }
};



 
