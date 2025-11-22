import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log do erro
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Registro duplicado. Este item já existe.',
      field: err.meta?.target?.[0] || 'unknown',
    });
  }

  // Erro de registro não encontrado do Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado.',
    });
  }

  // Erro de validação (express-validator)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: err.errors,
    });
  }

  // Erro de autenticação JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
  }

  // Erro genérico
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
