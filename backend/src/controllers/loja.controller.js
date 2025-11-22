import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Get all lojas
export const getAllLojas = async (req, res) => {
  try {
    const { active } = req.query;

    const where = {};
    if (active !== undefined) where.active = active === 'true';

    const lojas = await prisma.loja.findMany({
      where,
      orderBy: {
        prioridade: 'asc',
      },
    });

    res.json({
      success: true,
      data: lojas,
    });
  } catch (error) {
    logger.error('Erro ao buscar lojas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar lojas',
    });
  }
};

// Get loja by ID
export const getLojaById = async (req, res) => {
  try {
    const { id } = req.params;

    const loja = await prisma.loja.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            active: true,
          },
        },
      },
    });

    if (!loja) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada',
      });
    }

    res.json({
      success: true,
      data: loja,
    });
  } catch (error) {
    logger.error('Erro ao buscar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar loja',
    });
  }
};

// Create loja
export const createLoja = async (req, res) => {
  try {
    const { codigo, nome, prioridade, endereco, telefone } = req.body;

    // Validação
    if (!codigo || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Código e nome são obrigatórios',
      });
    }

    // Verificar se código já existe
    const existingLoja = await prisma.loja.findUnique({
      where: { codigo },
    });

    if (existingLoja) {
      return res.status(400).json({
        success: false,
        message: 'Código de loja já cadastrado',
      });
    }

    // Criar loja
    const loja = await prisma.loja.create({
      data: {
        codigo,
        nome,
        prioridade: prioridade || 5,
        endereco,
        telefone,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'Loja',
        entityId: loja.id,
        newData: JSON.stringify({ codigo: loja.codigo, nome: loja.nome }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Loja criada: ${loja.codigo} - ${loja.nome} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Loja criada com sucesso',
      data: loja,
    });
  } catch (error) {
    logger.error('Erro ao criar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar loja',
    });
  }
};

// Update loja
export const updateLoja = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigo, nome, prioridade, endereco, telefone, active } = req.body;

    // Buscar loja atual
    const currentLoja = await prisma.loja.findUnique({
      where: { id },
    });

    if (!currentLoja) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada',
      });
    }

    // Verificar se código já existe (se for diferente do atual)
    if (codigo && codigo !== currentLoja.codigo) {
      const existingLoja = await prisma.loja.findUnique({
        where: { codigo },
      });

      if (existingLoja) {
        return res.status(400).json({
          success: false,
          message: 'Código de loja já cadastrado',
        });
      }
    }

    // Atualizar loja
    const loja = await prisma.loja.update({
      where: { id },
      data: {
        ...(codigo && { codigo }),
        ...(nome && { nome }),
        ...(prioridade !== undefined && { prioridade }),
        ...(endereco !== undefined && { endereco }),
        ...(telefone !== undefined && { telefone }),
        ...(active !== undefined && { active }),
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Loja',
        entityId: loja.id,
        oldData: JSON.stringify(currentLoja),
        newData: JSON.stringify(loja),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Loja atualizada: ${loja.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Loja atualizada com sucesso',
      data: loja,
    });
  } catch (error) {
    logger.error('Erro ao atualizar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar loja',
    });
  }
};

// Delete loja
export const deleteLoja = async (req, res) => {
  try {
    const { id } = req.params;

    const loja = await prisma.loja.findUnique({
      where: { id },
    });

    if (!loja) {
      return res.status(404).json({
        success: false,
        message: 'Loja não encontrada',
      });
    }

    // Deletar loja
    await prisma.loja.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'Loja',
        entityId: id,
        oldData: JSON.stringify({ codigo: loja.codigo, nome: loja.nome }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Loja deletada: ${loja.codigo} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Loja deletada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar loja:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar loja',
    });
  }
};
