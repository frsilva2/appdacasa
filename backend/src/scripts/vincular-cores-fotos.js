import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Caminho para o arquivo de metadata das cores
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(__dirname, '../../../../Emporio-Tecidos-Assets');
const CORES_METADATA_PATH = path.join(ASSETS_PATH, 'cores', 'cores-metadata.json');

/**
 * Normaliza uma string para facilitar comparação
 * Remove acentos, espaços e converte para minúsculas
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ''); // Remove espaços
}

/**
 * Tenta encontrar uma cor do assets que corresponda à cor do banco
 */
function encontrarCorAssets(corBanco, coresAssets) {
  const nomeBancoNorm = normalizar(corBanco.nome);
  const hexBancoNorm = corBanco.codigoHex?.replace('#', '').toLowerCase();

  return coresAssets.find(corAsset => {
    const nomeAssetNorm = normalizar(corAsset.nome_cor);
    const hexAssetNorm = corAsset.hex?.replace('#', '').toLowerCase();

    // Tenta match por nome exato
    if (nomeBancoNorm === nomeAssetNorm) return true;

    // Tenta match por HEX exato
    if (hexBancoNorm && hexAssetNorm && hexBancoNorm === hexAssetNorm) return true;

    // Tenta match por nome similar (contém)
    if (nomeBancoNorm.includes(nomeAssetNorm) || nomeAssetNorm.includes(nomeBancoNorm)) return true;

    return false;
  });
}

async function vincularCoresFotos() {
  try {
    console.log('🔄 Iniciando vinculação de cores às fotos...\n');

    // 1. Ler cores do assets
    const coresData = await fs.readFile(CORES_METADATA_PATH, 'utf-8');
    const coresJSON = JSON.parse(coresData);
    const coresAssets = coresJSON.aprovadas || [];

    console.log(`✅ ${coresAssets.length} cores encontradas no assets\n`);

    // 2. Buscar todas as cores do banco
    const coresBanco = await prisma.cor.findMany({
      where: { active: true },
      include: {
        produto: {
          select: { nome: true }
        }
      }
    });

    console.log(`✅ ${coresBanco.length} cores encontradas no banco\n`);

    // 3. Vincular cores
    let vinculadas = 0;
    let naoVinculadas = 0;

    for (const corBanco of coresBanco) {
      const corAsset = encontrarCorAssets(corBanco, coresAssets);

      if (corAsset && corAsset.arquivo_imagem) {
        // Atualizar cor no banco
        await prisma.cor.update({
          where: { id: corBanco.id },
          data: { arquivoImagem: corAsset.arquivo_imagem }
        });

        console.log(`✅ ${corBanco.produto.nome} - ${corBanco.nome} → ${corAsset.arquivo_imagem}`);
        vinculadas++;
      } else {
        console.log(`⚠️  ${corBanco.produto.nome} - ${corBanco.nome} (não encontrada no assets)`);
        naoVinculadas++;
      }
    }

    console.log(`\n📊 Resultado:`);
    console.log(`   ✅ Vinculadas: ${vinculadas}`);
    console.log(`   ⚠️  Não vinculadas: ${naoVinculadas}`);

  } catch (error) {
    console.error('❌ Erro ao vincular cores:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
vincularCoresFotos()
  .then(() => {
    console.log('\n✅ Processo concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });
