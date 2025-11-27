import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Listar todos os fornecedores
export const getAllFornecedores = async (req, res) => {
  try {
    const { active } = req.query;

    const where = {};
    if (active !== undefined) {
      where.active = active === 'true';
    }

    const fornecedores = await prisma.fornecedor.findMany({
      where,
      orderBy: {
        nome: 'asc',
      },
    });

    res.json({
      success: true,
      data: fornecedores,
    });
  } catch (error) {
    logger.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar fornecedores',
    });
  }
};

// Buscar fornecedor por ID
export const getFornecedorById = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
      });
    }

    res.json({
      success: true,
      data: fornecedor,
    });
  } catch (error) {
    logger.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar fornecedor',
    });
  }
};

// Criar fornecedor (Admin)
export const createFornecedor = async (req, res) => {
  try {
    const { nome, email, telefone, cnpj, endereco, observacoes } = req.body;

    // Validação
    if (!nome || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios',
      });
    }

    // Verificar se email já existe
    const existingFornecedor = await prisma.fornecedor.findUnique({
      where: { email },
    });

    if (existingFornecedor) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome,
        email,
        telefone,
        cnpj,
        endereco,
        observacoes,
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE',
        entity: 'Fornecedor',
        entityId: fornecedor.id,
        newData: JSON.stringify({ nome: fornecedor.nome, email: fornecedor.email }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Fornecedor criado: ${fornecedor.nome} por ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Fornecedor criado com sucesso',
      data: fornecedor,
    });
  } catch (error) {
    logger.error('Erro ao criar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar fornecedor',
    });
  }
};

// Atualizar fornecedor (Admin)
export const updateFornecedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, telefone, cnpj, endereco, observacoes, active } = req.body;

    const currentFornecedor = await prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!currentFornecedor) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
      });
    }

    // Verificar email duplicado
    if (email && email !== currentFornecedor.email) {
      const existingFornecedor = await prisma.fornecedor.findUnique({
        where: { email },
      });

      if (existingFornecedor) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        });
      }
    }

    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(telefone !== undefined && { telefone }),
        ...(cnpj !== undefined && { cnpj }),
        ...(endereco !== undefined && { endereco }),
        ...(observacoes !== undefined && { observacoes }),
        ...(active !== undefined && { active }),
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE',
        entity: 'Fornecedor',
        entityId: fornecedor.id,
        oldData: JSON.stringify(currentFornecedor),
        newData: JSON.stringify(fornecedor),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Fornecedor atualizado: ${fornecedor.nome} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Fornecedor atualizado com sucesso',
      data: fornecedor,
    });
  } catch (error) {
    logger.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar fornecedor',
    });
  }
};

// Deletar fornecedor (Admin)
export const deleteFornecedor = async (req, res) => {
  try {
    const { id } = req.params;

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado',
      });
    }

    // Soft delete
    await prisma.fornecedor.update({
      where: { id },
      data: { active: false },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE',
        entity: 'Fornecedor',
        entityId: id,
        oldData: JSON.stringify({ nome: fornecedor.nome }),
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Fornecedor deletado: ${fornecedor.nome} por ${req.user.email}`);

    res.json({
      success: true,
      message: 'Fornecedor deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar fornecedor',
    });
  }
};
