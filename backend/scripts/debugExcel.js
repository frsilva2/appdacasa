import XLSX from 'xlsx';

const EXCEL_PATH = 'C:\\Projetos\\Emporio-Tecidos-Assets\\ultimopreco.xlsx';

const workbook = XLSX.readFile(EXCEL_PATH);

console.log('Abas encontradas:', workbook.SheetNames);

// Pegar aba do meio
const middleSheetIndex = Math.floor(workbook.SheetNames.length / 2);
const sheetName = workbook.SheetNames[middleSheetIndex];

console.log('\n=== ABA: ' + sheetName + ' ===\n');

const worksheet = workbook.Sheets[sheetName];

// Converter para JSON mantendo headers vazios
const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

console.log('Total de linhas:', data.length);
console.log('\n=== PRIMEIRA LINHA ===');
console.log(JSON.stringify(data[0], null, 2));

console.log('\n=== SEGUNDA LINHA ===');
console.log(JSON.stringify(data[1], null, 2));

console.log('\n=== TERCEIRA LINHA ===');
console.log(JSON.stringify(data[2], null, 2));

// Também tentar obter o range da planilha
console.log('\n=== INFORMAÇÕES DA PLANILHA ===');
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log('Range:', worksheet['!ref']);
console.log('Primeira célula:', range.s);
console.log('Última célula:', range.e);

// Ler as primeiras células manualmente
console.log('\n=== CÉLULAS (primeiras 10 colunas, primeiras 3 linhas) ===');
for (let R = range.s.r; R <= Math.min(range.s.r + 2, range.e.r); R++) {
  console.log(`\nLinha ${R + 1}:`);
  for (let C = range.s.c; C <= Math.min(range.s.c + 9, range.e.c); C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
    const cell = worksheet[cellAddress];
    if (cell) {
      console.log(`  ${cellAddress}: "${cell.v}"`);
    }
  }
}
