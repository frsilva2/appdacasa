/**
 * Teste OCR Real com Tesseract.js
 *
 * USO:
 *   node test-ocr-real.js <caminho-da-imagem>
 *
 * EXEMPLO:
 *   node test-ocr-real.js uploads/test-etiquetas/etiqueta-eurotextil.jpg
 */

import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

// Função de extração (do etiquetas.controller.js)
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
  console.log('='.repeat(60));
  console.log('   TESTE OCR REAL - TESSERACT.JS');
  console.log('='.repeat(60));
  console.log('');

  // Verificar se arquivo existe
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Arquivo não encontrado: ${imagePath}`);
    console.log('');
    console.log('Uso: node test-ocr-real.js <caminho-da-imagem>');
    process.exit(1);
  }

  console.log(`📄 Imagem: ${imagePath}`);
  console.log('');
  console.log('🔄 Processando OCR com Tesseract.js...');
  console.log('   (isso pode demorar alguns segundos)');
  console.log('');

  try {
    // Processar OCR
    const startTime = Date.now();
    const result = await Tesseract.recognize(
      imagePath,
      'por', // Português
      {
        logger: info => {
          if (info.status === 'recognizing text') {
            process.stdout.write(`\r   Progresso: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );
    const endTime = Date.now();

    console.log('\n');
    console.log('='.repeat(60));
    console.log('   RESULTADO OCR');
    console.log('='.repeat(60));
    console.log('');

    console.log('📝 TEXTO COMPLETO EXTRAÍDO:');
    console.log('-'.repeat(40));
    console.log(result.data.text);
    console.log('-'.repeat(40));
    console.log('');

    console.log(`⏱️  Tempo de processamento: ${(endTime - startTime) / 1000}s`);
    console.log(`📊 Confiança média: ${result.data.confidence.toFixed(1)}%`);
    console.log('');

    // Extrair informações estruturadas
    console.log('='.repeat(60));
    console.log('   INFORMAÇÕES EXTRAÍDAS');
    console.log('='.repeat(60));
    console.log('');

    const info = extrairInformacoesEtiqueta(result.data.text);

    console.log(`📦 PRODUTO:    ${info.produto || '(não encontrado)'}`);
    console.log(`🎨 COR:        ${info.cor ? `#${info.codigoCor} ${info.cor}` : '(não encontrada)'}`);
    console.log(`📏 METRAGEM:   ${info.metragem ? `${info.metragem} MT` : '(não encontrada)'}`);
    console.log('');

    // Verificar se todos os campos foram extraídos
    const camposEncontrados = [info.produto, info.cor, info.metragem].filter(Boolean).length;

    if (camposEncontrados === 3) {
      console.log('✅ SUCESSO: Todos os campos foram extraídos!');
    } else if (camposEncontrados > 0) {
      console.log(`⚠️  PARCIAL: ${camposEncontrados}/3 campos extraídos`);
    } else {
      console.log('❌ FALHA: Nenhum campo foi extraído');
      console.log('');
      console.log('Dicas:');
      console.log('- Verifique se a imagem está nítida e bem iluminada');
      console.log('- A etiqueta deve estar em formato padrão EUROTEXTIL');
      console.log('- O texto deve conter PRODUTO:, COR: e METRAGEM:');
    }

    console.log('');
    console.log('='.repeat(60));

    // Retornar resultado para uso programático
    return {
      textoCompleto: result.data.text,
      confianca: result.data.confidence,
      informacoesExtraidas: info
    };

  } catch (error) {
    console.error('❌ Erro ao processar OCR:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('');
  console.log('USO: node test-ocr-real.js <caminho-da-imagem>');
  console.log('');
  console.log('EXEMPLO:');
  console.log('  node test-ocr-real.js uploads/test-etiquetas/etiqueta-1.jpg');
  console.log('');
  console.log('Você pode colocar imagens de etiquetas em:');
  console.log('  /home/user/appdacasa/backend/uploads/test-etiquetas/');
  console.log('');
  process.exit(1);
}

processarImagem(imagePath);
