/**
 * Teste OCR Standalone - Não requer Prisma nem servidor
 *
 * USO:
 *   node test-ocr-standalone.js <caminho-da-imagem>
 *
 * EXEMPLO:
 *   node test-ocr-standalone.js /caminho/para/etiqueta.jpg
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';

// Função de extração (mesma do backend)
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,
    cor: null,
    codigoCor: null,
    metragem: null
  };

  // 1. EXTRAIR PRODUTO
  let matchProduto = /produto[\s:]+([^\n]+)/gi.exec(texto);
  if (matchProduto) {
    info.produto = matchProduto[1].trim();
  }

  if (!info.produto) {
    matchProduto = /\d{6}\s*[-–]\s*([A-ZÀ-Ú0-9\s\.,/%]+?)(?=\n|$)/gi.exec(texto);
    if (matchProduto) {
      info.produto = matchProduto[1].trim();
    }
  }

  if (info.produto) {
    info.produto = info.produto.replace(/\s+/g, ' ').trim();
  }

  // 2. EXTRAIR COR
  const matchCor = /cor[\s:]*#(\d+)\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|po:|seq|$)/gi.exec(texto);
  if (matchCor) {
    info.codigoCor = matchCor[1].trim();
    info.cor = matchCor[2].trim().toUpperCase();
  }

  // 3. EXTRAIR METRAGEM
  const matchMetragem = /(?:metragem|medida)[\s:]*(\d+[\.,]\d{2})\s*(?:mt|m)?/gi.exec(texto);
  if (matchMetragem) {
    info.metragem = matchMetragem[1].replace(',', '.');
  }

  if (!info.metragem) {
    const matchMetragemAlt = /(\d+[\.,]\d{2})\s*mt\b/gi.exec(texto);
    if (matchMetragemAlt) {
      info.metragem = matchMetragemAlt[1].replace(',', '.');
    }
  }

  return info;
}

async function processarImagem(imagePath) {
  console.log('');
  console.log('='.repeat(60));
  console.log('   TESTE OCR STANDALONE - TESSERACT.JS');
  console.log('='.repeat(60));
  console.log('');

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Arquivo não encontrado: ${imagePath}`);
    process.exit(1);
  }

  console.log(`📄 Imagem: ${imagePath}`);
  console.log('');
  console.log('🔄 Processando OCR...');
  console.log('');

  try {
    const startTime = Date.now();
    const result = await Tesseract.recognize(imagePath, 'por', {
      logger: info => {
        if (info.status === 'recognizing text') {
          process.stdout.write(`\r   Progresso: ${Math.round(info.progress * 100)}%`);
        }
      }
    });
    const endTime = Date.now();

    console.log('\n');
    console.log('='.repeat(60));
    console.log('   TEXTO EXTRAÍDO');
    console.log('='.repeat(60));
    console.log('');
    console.log(result.data.text);
    console.log('');
    console.log(`⏱️  Tempo: ${(endTime - startTime) / 1000}s`);
    console.log(`📊 Confiança: ${result.data.confidence.toFixed(1)}%`);
    console.log('');

    const info = extrairInformacoesEtiqueta(result.data.text);

    console.log('='.repeat(60));
    console.log('   CAMPOS EXTRAÍDOS');
    console.log('='.repeat(60));
    console.log('');
    console.log(`📦 PRODUTO:    ${info.produto || '(não encontrado)'}`);
    console.log(`🎨 COR:        ${info.cor ? `#${info.codigoCor} ${info.cor}` : '(não encontrada)'}`);
    console.log(`📏 METRAGEM:   ${info.metragem ? `${info.metragem} MT` : '(não encontrada)'}`);
    console.log('');

    const encontrados = [info.produto, info.cor, info.metragem].filter(Boolean).length;
    if (encontrados === 3) {
      console.log('✅ SUCESSO: Todos os campos extraídos!');
    } else {
      console.log(`⚠️  ${encontrados}/3 campos extraídos`);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

const imagePath = process.argv[2];

if (!imagePath) {
  console.log('');
  console.log('USO: node test-ocr-standalone.js <caminho-da-imagem>');
  console.log('');
  console.log('Coloque uma imagem de etiqueta em qualquer pasta e execute:');
  console.log('  node test-ocr-standalone.js /caminho/para/etiqueta.jpg');
  console.log('');
  process.exit(1);
}

processarImagem(imagePath);
