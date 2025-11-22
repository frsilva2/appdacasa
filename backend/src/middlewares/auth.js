import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

// Verificar se usuário está autenticado
export const authenticate = async (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        loja: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado',
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
      lojaId: user.lojaId,
      loja: user.loja,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar autenticação',
    });
  }
};

// Verificar se usuário tem permissão baseado no tipo
export const authorize = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado',
      });
    }

    if (!allowedTypes.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este recurso',
      });
    }

    next();
  };
};

// Middleware específico para Admin
export const isAdmin = authorize('ADMIN');

// Middleware específico para Gerente de Loja
export const isGerenteLoja = authorize('ADMIN', 'GERENTE_LOJA');

// Middleware específico para Usuário CD
export const isUsuarioCD = authorize('ADMIN', 'USUARIO_CD');

// Middleware específico para Operador
export const isOperador = authorize('ADMIN', 'OPERADOR', 'USUARIO_CD');

// Middleware específico para Cliente B2B
export const isClienteB2B = authorize('ADMIN', 'CLIENTE_B2B');
