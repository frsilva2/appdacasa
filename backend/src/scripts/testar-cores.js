import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarCores() {
  try {
    console.log('🔍 Buscando cores com fotos...\n');

    const coresComFoto = await prisma.cor.findMany({
      where: {
        arquivoImagem: { not: null }
      },
      take: 10,
      include: {
        produto: {
          select: { nome: true }
        }
      }
    });

    console.log(`✅ Encontradas ${coresComFoto.length} cores com fotos:\n`);

    coresComFoto.forEach((cor, index) => {
      console.log(`${index + 1}. ${cor.produto.nome} - ${cor.nome}`);
      console.log(`   Hex: ${cor.codigoHex || 'N/A'}`);
      console.log(`   Foto: ${cor.arquivoImagem}`);
      console.log(`   URL: /assets/cores/fotos/${cor.arquivoImagem}\n`);
    });

    // Testar acesso a uma foto
    const primeiraFoto = coresComFoto[0]?.arquivoImagem;
    if (primeiraFoto) {
      console.log(`\n📸 Teste de acesso: http://localhost:5000/assets/cores/fotos/${primeiraFoto}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarCores();
