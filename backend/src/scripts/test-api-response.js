import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAPIResponse() {
  try {
    console.log('🔍 Testando resposta da API /produtos/com-estoque...\n');

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
      take: 1,
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
          take: 3,
          include: {
            estoques: {
              where: { local: 'CD' },
            },
          },
        },
      },
    });

    console.log('📦 Resposta simulada da API:\n');
    console.log(JSON.stringify(produtos, null, 2).substring(0, 2000));

    if (produtos[0]?.cores[0]) {
      const cor = produtos[0].cores[0];
      console.log('\n🎨 Primeira cor:');
      console.log('   Nome:', cor.nome);
      console.log('   ID:', cor.id);
      console.log('   codigoHex:', cor.codigoHex);
      console.log('   arquivoImagem:', cor.arquivoImagem);
      console.log('   ');
      console.log('   ⚠️  Campo arquivoImagem está presente?', 'arquivoImagem' in cor ? '✅ SIM' : '❌ NÃO');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIResponse();
