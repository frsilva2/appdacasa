/**
 * Script de teste para verificar a extração de dados de etiquetas OCR
 * Testa a função extrairInformacoesEtiqueta com textos típicos de etiquetas EUROTEXTIL
 */

// Função de extração ATUALIZADA (cópia do etiquetas.controller.js)
function extrairInformacoesEtiqueta(texto) {
  const info = {
    produto: null,
    cor: null,
    codigoCor: null,
    metragem: null
  };

  // Normalizar texto
  const textoNormalizado = texto
    .replace(/[|]/g, 'I')
    .replace(/\r/g, '\n');

  // 1. EXTRAIR PRODUTO (múltiplos padrões)
  const padroesProduto = [
    /prod[uú]to[\s:]*([A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|cor|COR|$)/gi,
    /(\d{5,6})\s*[-–]\s*([A-ZÀ-Ú0-9\s\.,/%]+?)(?=\n|cor|COR|$)/gi,
    /^((?:OXFORD|TACTEL|CREPE|CETIM|MALHA|TRICOLINE|VISCOLYCRA|LINHO|SARJA|BRIM|JEANS)[A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|$)/gim,
    /\d{6}[^\n]*?([A-Z]{3,}[A-ZÀ-Ú0-9\s\.,/%\-]+?)(?=\n|cor|COR|$)/gi
  ];

  for (const padrao of padroesProduto) {
    const match = padrao.exec(textoNormalizado);
    if (match) {
      const resultado = match[match.length - 1] || match[1];
      if (resultado && resultado.trim().length > 3) {
        info.produto = resultado.replace(/\s+/g, ' ').trim();
        break;
      }
    }
  }

  // 2. EXTRAIR COR (múltiplos padrões)
  const padroesCor = [
    /cor[\s:]*#?(\d{2,5})\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|po:|seq|$)/gi,
    /cor[\s:]+([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|desenho|metragem|medida|$)/gi,
    /#(\d{2,5})\s*[-\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?=\n|$)/gi,
    /(\d{5})\s+([A-ZÀ-Ú]{3,}[A-ZÀ-Úa-zà-ú\s]*)(?=\n|$)/gi
  ];

  for (const padrao of padroesCor) {
    const match = padrao.exec(textoNormalizado);
    if (match) {
      if (match[2]) {
        info.codigoCor = match[1].trim();
        info.cor = match[2].trim().toUpperCase();
      } else if (match[1]) {
        info.cor = match[1].trim().toUpperCase();
      }
      if (info.cor && info.cor.length > 2) break;
    }
  }

  // 3. EXTRAIR METRAGEM (múltiplos padrões)
  const padroesMetragem = [
    /(?:metragem|medida)[\s:]*(\d+[\.,]\d{1,2})\s*(?:mt|m|metros?)?/gi,
    /(\d{2,3}[\.,]\d{1,2})\s*(?:mt|m)\b/gi,
    /(\d{2,3}[\.,]\d{1,2})[\s\n]*mt/gi,
    /(\d+[\.,]\d{2})\s*(?:mt|metros?|m\b)/gi
  ];

  for (const padrao of padroesMetragem) {
    const match = padrao.exec(textoNormalizado);
    if (match && match[1]) {
      const valor = match[1].replace(',', '.');
      const numero = parseFloat(valor);
      if (numero >= 1 && numero <= 500) {
        info.metragem = valor;
        break;
      }
    }
  }

  // FALLBACK: Busca genérica
  if (!info.produto) {
    const linhas = textoNormalizado.split('\n').filter(l => l.trim().length > 5);
    for (const linha of linhas) {
      if (!/^(eurotextil|cnpj|data|hora|seq|po:)/i.test(linha) && /[A-Z]{4,}/i.test(linha)) {
        info.produto = linha.replace(/\s+/g, ' ').trim().substring(0, 100);
        break;
      }
    }
  }

  if (!info.metragem) {
    const matchNum = /(\d{2,3}[\.,]\d{2})/g.exec(textoNormalizado);
    if (matchNum) {
      const valor = matchNum[1].replace(',', '.');
      const numero = parseFloat(valor);
      if (numero >= 10 && numero <= 200) {
        info.metragem = valor;
      }
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
  },
  // ==========================================
  // CASOS ADICIONAIS - Variações de OCR
  // ==========================================
  {
    nome: 'OCR com espaços extras e ruído',
    textoOCR: `EUROTEXTIL  LTDA
PRODUTO :  OXFORD   TINTO 100% POLYESTER
COR :  #00502   AMARELO
METRAGEM :  50,00  MT`,
    esperado: {
      produto: 'OXFORD TINTO 100% POLYESTER',
      cor: 'AMARELO',
      codigoCor: '00502',
      metragem: '50.00'
    }
  },
  {
    nome: 'OCR sem dois pontos após labels',
    textoOCR: `EUROTEXTIL
PRODUTO TACTEL LISO 150CM
COR 00123 BRANCO
METRAGEM 80,00 MT`,
    esperado: {
      produto: 'TACTEL LISO 150CM',
      cor: 'BRANCO',
      codigoCor: '00123',
      metragem: '80.00'
    }
  },
  {
    nome: 'Etiqueta com formato alternativo',
    textoOCR: `OXFORD TINTO 1,47M 100% POLIESTER
#00460 VERMELHO
55,00 MT`,
    esperado: {
      produto: 'OXFORD TINTO 1,47M 100% POLIESTER',
      cor: 'VERMELHO',
      codigoCor: '00460',
      metragem: '55.00'
    }
  },
  {
    nome: 'OCR com quebras de linha irregulares',
    textoOCR: `EUROTEXTIL
PRODUTO: MALHA COTTON
COR: #777 ROSA
PINK
METRAGEM: 120,50
MT`,
    esperado: {
      produto: 'MALHA COTTON',
      cor: 'ROSA',
      codigoCor: '777',
      metragem: '120.50'
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
