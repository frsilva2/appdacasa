import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { type, active, lojaId } = req.query;

    const where = {};
    if (type) where.type = type;
    if (active !== undefined) where.active = active === 'true';
    if (lojaId) where.lojaId = lojaId;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        telefone: true,
        lojaId: true,
        loja: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        telefone: true,
        lojaId: true,
        loja: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { email, password, name, type, telefone, lojaId } = req.body;

    // Validação
    if (!email || !password || !name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha, nome e tipo são obrigatórios',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres',
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        type,
        telefone,
        lojaId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        telefone: true,
        lojaId: true,
        loja: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
        active: true,
        createdAt: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        newData: JSON.stringify({ email: user.email, name: user.name, type: user.type }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Usuário criado: ${user.email} (${user.type}) por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: user,
    });
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, type, telefone, lojaId, active } = req.body;

    // Buscar usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Verificar se email já existe (se for diferente do atual)
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(name && { name }),
        ...(type && { type }),
        ...(telefone !== undefined && { telefone }),
        ...(lojaId !== undefined && { lojaId }),
        ...(active !== undefined && { active }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        telefone: true,
        lojaId: true,
        loja: {
          select: {
            id: true,
            nome: true,
            codigo: true,
          },
        },
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'User',
        entityId: user.id,
        oldData: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          type: currentUser.type,
          active: currentUser.active,
        }),
        newData: JSON.stringify({
          email: user.email,
          name: user.name,
          type: user.type,
          active: user.active,
        }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Usuário atualizado: ${user.email} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user,
    });
  } catch (error) {
    logger.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Não permitir deletar a si mesmo
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar seu próprio usuário',
      });
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'User',
        entityId: id,
        oldData: JSON.stringify({ email: user.email, name: user.name, type: user.type }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Usuário deletado: ${user.email} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
    });
  }
};

// Toggle user active status
export const toggleUserActive = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    // Não permitir desativar a si mesmo
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar seu próprio usuário',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: {
        id: true,
        email: true,
        name: true,
        type: true,
        active: true,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: updatedUser.active ? 'ACTIVATE' : 'DEACTIVATE',
        entity: 'User',
        entityId: id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Usuário ${updatedUser.active ? 'ativado' : 'desativado'}: ${updatedUser.email} por ${req.user.email}`);

    res.json({
      success: true,
      message: `Usuário ${updatedUser.active ? 'ativado' : 'desativado'} com sucesso`,
      data: updatedUser,
    });
  } catch (error) {
    logger.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar status do usuário',
    });
  }
};
