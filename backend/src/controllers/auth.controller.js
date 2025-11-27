import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import logger from '../config/logger.js';

// Login
export const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validação
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        loja: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado',
      });
    }

    // Verificar tipo de usuário se especificado
    if (userType && user.type !== userType) {
      return res.status(401).json({
        success: false,
        message: 'Tipo de usuário incorreto',
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Gerar token
    const token = generateToken(user.id);

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Login realizado: ${user.email} (${user.type})`);

    // Retornar dados do usuário (sem senha) e token
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          type: user.type,
          lojaId: user.lojaId,
          loja: user.loja,
        },
        token,
      },
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
    });
  }
};

// Get current user (me)
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
            prioridade: true,
          },
        },
        active: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados do usuário',
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validação
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no mínimo 6 caracteres',
      });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta',
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHANGE_PASSWORD',
        entity: 'User',
        entityId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Senha alterada: ${user.email}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha',
    });
  }
};

// Reset password (admin only)
export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    // Validação
    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário e nova senha são obrigatórios',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter no mínimo 6 caracteres',
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESET_PASSWORD',
        entity: 'User',
        entityId: userId,
        newData: JSON.stringify({ resetBy: req.user.id }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Senha resetada por admin: ${user.email} (por ${req.user.email})`);

    res.json({
      success: true,
      message: 'Senha resetada com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar senha',
    });
  }
};
