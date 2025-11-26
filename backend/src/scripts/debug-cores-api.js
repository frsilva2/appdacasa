import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCoresAPI() {
  try {
    console.log('🔍 Simulando chamada da API /produtos/com-estoque...\n');

    // Simular a mesma query que o controller usa
    const produtos = await prisma.produto.findMany({
      where: {
        active: true,
        estoques: {
          some: {
            local: 'CD',
            quantidade: { gt: 0 },
          },
        },
      },
      take: 1, // Apenas 1 produto para teste
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
          take: 5, // Primeiras 5 cores
          include: {
            estoques: {
              where: { local: 'CD' },
              select: {
                quantidade: true,
                quantidadeMin: true,
              },
            },
          },
        },
      },
    });

    if (produtos.length === 0) {
      console.log('❌ Nenhum produto encontrado com estoque');
      return;
    }

    const produto = produtos[0];
    console.log(`✅ Produto: ${produto.nome}`);
    console.log(`✅ Cores encontradas: ${produto.cores.length}\n`);

    produto.cores.forEach((cor, index) => {
      console.log(`--- Cor ${index + 1} ---`);
      console.log(`Nome: ${cor.nome}`);
      console.log(`Hex: ${cor.codigoHex || 'N/A'}`);
      console.log(`arquivoImagem: ${cor.arquivoImagem || 'NULL ❌'}`);
      console.log(`URL esperada: /assets/cores/fotos/${cor.arquivoImagem || 'N/A'}`);
      console.log('');
    });

    // Verificar quantas cores NO TOTAL têm fotos
    const totalCoresComFoto = await prisma.cor.count({
      where: {
        arquivoImagem: { not: null }
      }
    });

    const totalCores = await prisma.cor.count();

    console.log(`\n📊 Estatísticas:`);
    console.log(`   Total de cores no banco: ${totalCores}`);
    console.log(`   Cores com foto vinculada: ${totalCoresComFoto}`);
    console.log(`   Cores sem foto: ${totalCores - totalCoresComFoto}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugCoresAPI();
