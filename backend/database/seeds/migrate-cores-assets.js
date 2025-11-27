import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Caminho para o JSON das cores
const CORES_JSON_PATH = 'C:\\Projetos\\Emporio-Tecidos-Assets\\cores\\cores-metadata.json';

async function migrateCores() {
  console.log('🎨 MIGRAÇÃO DE CORES DOS ASSETS\n');

  try {
    // 1. Ler cores do JSON
    console.log('📖 Lendo cores do arquivo JSON...');
    const coresData = JSON.parse(fs.readFileSync(CORES_JSON_PATH, 'utf-8'));
    const coresAssets = coresData.aprovadas;
    console.log(`✅ ${coresAssets.length} cores encontradas\n`);

    // 2. Buscar todos os produtos
    console.log('📦 Buscando produtos...');
    const produtos = await prisma.produto.findMany({
      where: { active: true }
    });
    console.log(`✅ ${produtos.length} produtos encontrados\n`);

    // 3. Limpar TODAS as cores antigas
    console.log('🗑️  Removendo TODAS as cores antigas...');

    // Primeiro, limpar todos os estoques
    await prisma.estoque.deleteMany({});
    console.log('   ✅ Estoques limpos');

    // Depois, remover todas as cores
    const deleted = await prisma.cor.deleteMany({});
    console.log(`   ✅ ${deleted.count} cores antigas removidas\n`);

    // 4. Criar as 46 cores para cada produto
    console.log('🎨 Criando 46 cores para cada produto...\n');

    let totalCoresCriadas = 0;
    let totalEstoqueCriado = 0;

    for (const produto of produtos) {
      console.log(`  📦 ${produto.codigo} - ${produto.nome}`);

      for (const corAsset of coresAssets) {
        // Criar ou atualizar cor (upsert para evitar duplicatas)
        const cor = await prisma.cor.upsert({
          where: {
            produtoId_nome: {
              produtoId: produto.id,
              nome: corAsset.nome_cor
            }
          },
          update: {
            codigoHex: corAsset.hex,
            active: true
          },
          create: {
            nome: corAsset.nome_cor,
            codigoHex: corAsset.hex,
            produtoId: produto.id,
            active: true
          }
        });

        totalCoresCriadas++;

        // Criar ou atualizar estoque inicial (50 a 500 metros)
        const quantidadeInicial = Math.floor(Math.random() * 451) + 50; // 50-500

        await prisma.estoque.upsert({
          where: {
            produtoId_corId_local: {
              produtoId: produto.id,
              corId: cor.id,
              local: 'CD'
            }
          },
          update: {
            quantidade: quantidadeInicial,
            quantidadeMin: 50,
            ultimaContagem: new Date()
          },
          create: {
            produtoId: produto.id,
            corId: cor.id,
            local: 'CD',
            quantidade: quantidadeInicial,
            quantidadeMin: 50,
            ultimaContagem: new Date()
          }
        });

        totalEstoqueCriado++;
      }

      console.log(`     ✅ ${coresAssets.length} cores criadas`);
    }

    console.log('\n✨ MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 RESUMO:');
    console.log(`   Produtos processados: ${produtos.length}`);
    console.log(`   Cores por produto: ${coresAssets.length}`);
    console.log(`   Total de cores criadas: ${totalCoresCriadas}`);
    console.log(`   Total de registros de estoque: ${totalEstoqueCriado}`);
    console.log('\n🎉 Todos os produtos agora têm as 46 cores reais dos assets!');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateCores();
