/**
 * Script de teste para verificar a extração de dados de etiquetas OCR
 * Testa a função extrairInformacoesEtiqueta com textos típicos de etiquetas EUROTEXTIL
 */

// Função de extração (cópia do etiquetas.controller.js)
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

// ==========================================
// CASOS DE TESTE - Etiquetas EUROTEXTIL
// ==========================================

const testCases = [
  {
    nome: 'Etiqueta EUROTEXTIL - Oxford Amarelo',
    textoOCR: `EUROTEXTIL
PRODUTO: OXFORD TINTO 100% POLYESTER
COR: #00502 AMARELO
METRAGEM: 50,00 MT
SEQ: 001234`,
    esperado: {
      produto: 'OXFORD TINTO 100% POLYESTER',
      cor: 'AMARELO',
      codigoCor: '00502',
      metragem: '50.00'
    }
  },
  {
    nome: 'Etiqueta EUROTEXTIL - Oxford Prata',
    textoOCR: `EUROTEXTIL LTDA
PRODUTO: OXFORD TINTO 1,50L 100% POLYESTER
COR: #00901 PRATA
METRAGEM: 66,00 MT`,
    esperado: {
      produto: 'OXFORD TINTO 1,50L 100% POLYESTER',
      cor: 'PRATA',
      codigoCor: '00901',
      metragem: '66.00'
    }
  },
  {
    nome: 'Etiqueta EUROTEXTIL - Capuccino',
    textoOCR: `EUROTEXTIL
PRODUTO: OXFORD TINTO 100% POLYESTER
COR:#814 - CAPUCCINO
MEDIDA: 59,00 MT`,
    esperado: {
      produto: 'OXFORD TINTO 100% POLYESTER',
      cor: 'CAPUCCINO',
      codigoCor: '814',
      metragem: '59.00'
    }
  },
  {
    nome: 'Etiqueta com código de produto',
    textoOCR: `334103 - OXFORD TINTO 1,50L 100% POLYESTER
COR: #460 - RED
45,50 MT`,
    esperado: {
      produto: 'OXFORD TINTO 1,50L 100% POLYESTER',
      cor: 'RED',
      codigoCor: '460',
      metragem: '45.50'
    }
  },
  {
    nome: 'Etiqueta com OCR imperfeito (ruído)',
    textoOCR: `EUROT E XTIL
PRODUTO: TACTEL LISO
COR: #1234 AZUL MARINHO
METRAGEM: 100,00 MT
PO: 12345`,
    esperado: {
      produto: 'TACTEL LISO',
      cor: 'AZUL MARINHO',
      codigoCor: '1234',
      metragem: '100.00'
    }
  },
  {
    nome: 'Etiqueta EUROTEXTIL - Verde Agua',
    textoOCR: `EUROTEXTIL
PRODUTO: CREPE LISO
COR: #00789 VERDE AGUA
METRAGEM: 75,00 MT`,
    esperado: {
      produto: 'CREPE LISO',
      cor: 'VERDE AGUA',
      codigoCor: '00789',
      metragem: '75.00'
    }
  }
];

// ==========================================
// EXECUTAR TESTES
// ==========================================

console.log('='.repeat(60));
console.log('   TESTE DE EXTRAÇÃO OCR - ETIQUETAS EUROTEXTIL');
console.log('='.repeat(60));
console.log('');

let passados = 0;
let falhas = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n[${ index + 1 }] ${testCase.nome}`);
  console.log('-'.repeat(50));

  const resultado = extrairInformacoesEtiqueta(testCase.textoOCR);

  let sucesso = true;
  const erros = [];

  // Verificar cada campo
  if (resultado.produto !== testCase.esperado.produto) {
    sucesso = false;
    erros.push(`  PRODUTO: esperado "${testCase.esperado.produto}", obtido "${resultado.produto}"`);
  }

  if (resultado.cor !== testCase.esperado.cor) {
    sucesso = false;
    erros.push(`  COR: esperado "${testCase.esperado.cor}", obtido "${resultado.cor}"`);
  }

  if (resultado.codigoCor !== testCase.esperado.codigoCor) {
    sucesso = false;
    erros.push(`  CÓDIGO COR: esperado "${testCase.esperado.codigoCor}", obtido "${resultado.codigoCor}"`);
  }

  if (resultado.metragem !== testCase.esperado.metragem) {
    sucesso = false;
    erros.push(`  METRAGEM: esperado "${testCase.esperado.metragem}", obtido "${resultado.metragem}"`);
  }

  if (sucesso) {
    console.log('  ✅ PASSOU');
    console.log(`     Produto: ${resultado.produto}`);
    console.log(`     Cor: #${resultado.codigoCor} ${resultado.cor}`);
    console.log(`     Metragem: ${resultado.metragem} MT`);
    passados++;
  } else {
    console.log('  ❌ FALHOU');
    erros.forEach(e => console.log(e));
    console.log('  Resultado obtido:');
    console.log(`     Produto: ${resultado.produto}`);
    console.log(`     Cor: #${resultado.codigoCor} ${resultado.cor}`);
    console.log(`     Metragem: ${resultado.metragem} MT`);
    falhas++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`   RESULTADO: ${passados} passados, ${falhas} falhas`);
console.log('='.repeat(60));

// Exit code baseado no resultado
process.exit(falhas > 0 ? 1 : 0);
