import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createClienteB2B() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const cliente = await prisma.user.create({
      data: {
        name: 'Cliente B2B Teste',
        email: 'cliente@b2b.com',
        password: hashedPassword,
        type: 'CLIENTE_B2B',
      },
    });

    console.log('✅ Cliente B2B criado com sucesso!');
    console.log('');
    console.log('📧 Email: cliente@b2b.com');
    console.log('🔑 Senha: 123456');
    console.log('');
    console.log('Agora você pode fazer login com este usuário e criar pedidos B2B!');
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createClienteB2B();
