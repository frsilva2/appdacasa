#!/usr/bin/env node
/**
 * Script para criar usuário admin
 * Execute: node create-admin-simple.js
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔑 Criando usuário admin...');

    // Hash da senha
    const senha = await bcrypt.hash('admin123', 10);

    // Criar admin
    const admin = await prisma.user.create({
      data: {
        id: 'admin-001',
        email: 'admin@emporio.com',
        password: senha,
        name: 'Administrador',
        type: 'ADMIN',
        active: true
      }
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email:', admin.email);
    console.log('🔒 Senha: admin123');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin já existe!');
      console.log('📧 Email: admin@emporio.com');
      console.log('🔒 Senha: admin123');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
