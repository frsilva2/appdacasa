import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
    });

    console.log('\n📋 Usuários cadastrados:\n');
    users.forEach(u => {
      console.log(`   ${u.type} | ${u.name} | ${u.email}`);
    });
    console.log('');
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
