import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const produtos = await prisma.produto.count();
    const cores = await prisma.cor.count();
    const users = await prisma.user.count();
    const lojas = await prisma.loja.count();
    const fornecedores = await prisma.fornecedor.count();
    const estoque = await prisma.estoque.count();

    console.log('\n📊 CHECAGEM DO BANCO DE DADOS:\n');
    console.log(`✅ Produtos: ${produtos}`);
    console.log(`✅ Cores: ${cores}`);
    console.log(`✅ Usuários: ${users}`);
    console.log(`✅ Lojas: ${lojas}`);
    console.log(`✅ Fornecedores: ${fornecedores}`);
    console.log(`✅ Estoque: ${estoque}`);

    // Listar alguns produtos
    console.log('\n📦 Primeiros 5 produtos:');
    const primeiros = await prisma.produto.findMany({
      take: 5,
      include: { cores: true }
    });
    primeiros.forEach(p => {
      console.log(`  - ${p.codigo}: ${p.nome} (${p.cores.length} cores)`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
