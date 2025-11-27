import prisma from '../config/database.js';
import logger from '../config/logger.js';

// Helper: Validar CNPJ (apenas formato)
function validarFormatoCNPJ(cnpj) {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  return cnpjLimpo.length === 14;
}

// Criar ou buscar cliente B2B (aprovação automática)
export const createOrGetClienteB2B = async (req, res) => {
  try {
    const {
      razaoSocial,
      nomeFantasia,
      cnpj,
      inscricaoEstadual,
      cep,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      telefone,
      email,
      observacoes
    } = req.body;

    // Validações
    if (!razaoSocial || !cnpj || !inscricaoEstadual || !cep || !endereco ||
        !numero || !bairro || !cidade || !estado || !telefone || !email) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    // Validar formato CNPJ
    if (!validarFormatoCNPJ(cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido (deve ter 14 dígitos)'
      });
    }

    // Validar estado MG
    if (estado !== 'MG') {
      return res.status(400).json({
        success: false,
        message: 'Atendemos apenas empresas de Minas Gerais (MG)'
      });
    }

    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    const cepLimpo = cep.replace(/[^\d]/g, '');

    // Verificar se cliente já existe
    let cliente = await prisma.clienteB2B.findUnique({
      where: { cnpj: cnpjLimpo }
    });

    if (cliente) {
      // Cliente já existe, apenas retornar
      logger.info(`Cliente B2B já existe: ${cliente.razaoSocial}`);
      return res.json({
        success: true,
        data: cliente,
        message: 'Cliente já cadastrado'
      });
    }

    // Criar novo cliente com aprovação automática
    cliente = await prisma.clienteB2B.create({
      data: {
        razaoSocial,
        nomeFantasia: nomeFantasia || razaoSocial,
        cnpj: cnpjLimpo,
        inscricaoEstadual,
        cep: cepLimpo,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        telefone,
        email,
        observacoes,
        aprovado: true, // Aprovação automática
        aprovadoEm: new Date()
      }
    });

    logger.info(`Cliente B2B criado: ${cliente.razaoSocial} (${cliente.cnpj})`);

    res.status(201).json({
      success: true,
      data: cliente,
      message: 'Cliente cadastrado com sucesso'
    });
  } catch (error) {
    // Se for erro de CNPJ duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('cnpj')) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }

    // Se for erro de email duplicado
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    logger.error('Erro ao criar cliente B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cadastrar cliente'
    });
  }
};

// Listar todos os clientes B2B (admin)
export const getAllClientes = async (req, res) => {
  try {
    const { aprovado } = req.query;

    const where = {};
    if (aprovado !== undefined) {
      where.aprovado = aprovado === 'true';
    }

    const clientes = await prisma.clienteB2B.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: clientes
    });
  } catch (error) {
    logger.error('Erro ao buscar clientes B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar clientes'
    });
  }
};

// Buscar cliente por ID
export const getClienteById = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.clienteB2B.findUnique({
      where: { id },
      include: {
        pedidos: {
          take: 10,
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado'
      });
    }

    res.json({
      success: true,
      data: cliente
    });
  } catch (error) {
    logger.error('Erro ao buscar cliente B2B:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar cliente'
    });
  }
};

// Aprovar cliente (admin) - caso mude para aprovação manual no futuro
export const aprovarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.clienteB2B.update({
      where: { id },
      data: {
        aprovado: true,
        aprovadoEm: new Date()
      }
    });

    logger.info(`Cliente B2B aprovado: ${cliente.razaoSocial}`);

    res.json({
      success: true,
      data: cliente,
      message: 'Cliente aprovado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao aprovar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar cliente'
    });
  }
};

// Desativar cliente (admin)
export const desativarCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await prisma.clienteB2B.update({
      where: { id },
      data: {
        active: false
      }
    });

    logger.info(`Cliente B2B desativado: ${cliente.razaoSocial}`);

    res.json({
      success: true,
      data: cliente,
      message: 'Cliente desativado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao desativar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar cliente'
    });
  }
};
