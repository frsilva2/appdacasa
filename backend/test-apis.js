import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPIs() {
  console.log('\n🔍 ANÁLISE COMPLETA DE DADOS:\n');

  // 1. Produtos com cores
  const produtosComCores = await prisma.produto.findMany({
    include: {
      cores: true
    },
    take: 5
  });

  console.log('📦 PRODUTOS NO BANCO:');
  produtosComCores.forEach(p => {
    console.log(`  ${p.codigo} - ${p.nome}: ${p.cores.length} cores`);
    if (p.cores.length > 0) {
      p.cores.forEach(c => console.log(`     - ${c.nome} (${c.codigoHex || 'sem hex'})`));
    }
  });

  // 2. Produtos com estoque
  const produtosComEstoque = await prisma.produto.findMany({
    where: {
      active: true,
      estoques: {
        some: {
          local: 'CD',
          quantidade: { gt: 0 },
        },
      },
    },
    include: {
      cores: {
        where: {
          active: true,
          estoques: {
            some: {
              local: 'CD',
              quantidade: { gt: 0 },
            },
          },
        },
        include: {
          estoques: {
            where: { local: 'CD' },
          },
        },
      },
    },
    take: 3
  });

  console.log('\n\n📊 PRODUTOS COM ESTOQUE DISPONÍVEL:');
  console.log(`Total: ${produtosComEstoque.length} produtos`);
  produtosComEstoque.forEach(p => {
    console.log(`\n  ${p.codigo} - ${p.nome}`);
    console.log(`    Cores disponíveis: ${p.cores.length}`);
    p.cores.forEach(c => {
      const estoque = c.estoques[0];
      console.log(`      - ${c.nome}: ${estoque?.quantidade || 0}m em estoque`);
    });
  });

  // 3. Total de produtos e cores
  const totalProdutos = await prisma.produto.count({ where: { active: true } });
  const totalCores = await prisma.cor.count({ where: { active: true } });
  const coresPorProduto = await prisma.cor.groupBy({
    by: ['produtoId'],
    _count: { id: true }
  });

  const produtosComCoresCount = coresPorProduto.length;
  const produtosSemCores = totalProdutos - produtosComCoresCount;

  console.log('\n\n📈 ESTATÍSTICAS:');
  console.log(`  Total de produtos ativos: ${totalProdutos}`);
  console.log(`  Total de cores ativas: ${totalCores}`);
  console.log(`  Produtos com cores: ${produtosComCoresCount}`);
  console.log(`  Produtos SEM cores: ${produtosSemCores}`);

  await prisma.$disconnect();
}

testAPIs().catch(console.error);
