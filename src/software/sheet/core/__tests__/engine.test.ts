import { parseCellAddress, formatCellAddress, columnToNumber, numberToColumn } from '../references/AddressParser';
import { parseRange, iterateRange, containsCell, getRangeSize } from '../ranges/RangeParser';
import { FormulaTokenizer } from '../formula/FormulaTokenizer';
import { FormulaParser } from '../formula/FormulaParser';
import { FormulaEvaluator } from '../formula/FormulaEvaluator';
import { shiftFormulaReferences } from '../formula/FormulaTransform';
import { WorkbookModel } from '../workbook/WorkbookModel';
import { CalculationEngine } from '../calculation/CalculationEngine';
import { SpreadsheetError } from '../errors/SpreadsheetError';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Test Failed: ${message}`);
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

function runEngineTests() {
  console.log('=== EVLab Sheet Core Engine Test Suite ===\n');

  // 1. Address System
  console.log('1. Testing Address System...');
  assert(columnToNumber('A') === 1, 'columnToNumber A -> 1');
  assert(columnToNumber('Z') === 26, 'columnToNumber Z -> 26');
  assert(columnToNumber('AA') === 27, 'columnToNumber AA -> 27');
  assert(columnToNumber('XFD') === 16384, 'columnToNumber XFD -> 16384');

  assert(numberToColumn(1) === 'A', 'numberToColumn 1 -> A');
  assert(numberToColumn(26) === 'Z', 'numberToColumn 26 -> Z');
  assert(numberToColumn(27) === 'AA', 'numberToColumn 27 -> AA');

  const addr1 = parseCellAddress('$A$1');
  assert(!!(addr1 !== null && addr1.row === 0 && addr1.col === 0 && addr1.rowAbsolute && addr1.colAbsolute), 'Parse $A$1');

  const addr2 = parseCellAddress('Sheet2!B20');
  assert(addr2 !== null && addr2.sheetName === 'Sheet2' && addr2.row === 19 && addr2.col === 1, 'Parse Sheet2!B20');

  const addr3 = parseCellAddress("'Water Demand'!$C$10");
  assert(addr3 !== null && addr3.sheetName === 'Water Demand' && addr3.row === 9 && addr3.col === 2, "Parse 'Water Demand'!$C$10");

  // 2. Range System
  console.log('\n2. Testing Range System...');
  const range1 = parseRange('A1:A10');
  assert(range1 !== null && getRangeSize(range1).count === 10, 'Range A1:A10 size is 10');

  const range2 = parseRange('Sheet2!A1:D10');
  assert(range2 !== null && getRangeSize(range2).count === 40, 'Range Sheet2!A1:D10 size is 40');

  // 3. Formula Tokenizer & Parser
  console.log('\n3. Testing Formula Tokenizer & AST Parser...');
  const parser = new FormulaParser();

  const ast1 = parser.parse('=1+2');
  assert(ast1.type === 'BINARY_OP' && ast1.op === '+', 'Parse =1+2 into binary op');

  const ast2 = parser.parse('=(10+5)*2');
  assert(ast2.type === 'BINARY_OP' && ast2.op === '*' && (ast2 as any).left.type === 'BINARY_OP', 'Parse precedence =(10+5)*2');

  const refs = parser.extractReferences('=SUM(A1:A10) + B1 * $C$2');
  assert(refs.cells.includes('B1') && refs.cells.includes('$C$2') && refs.ranges.includes('A1:A10'), 'Extract references');

  // 4. Formula References Shifting
  console.log('\n4. Testing Reference Copy & Shift...');
  const shifted1 = shiftFormulaReferences('=B2*C2', 1, 0);
  assert(shifted1 === '=B3*C3', 'Shift =B2*C2 1 row down -> =B3*C3');

  const shifted2 = shiftFormulaReferences('=B2*C2', 0, 1);
  assert(shifted2 === '=C2*D2', 'Shift =B2*C2 1 col right -> =C2*D2');

  const shiftedAbs = shiftFormulaReferences('=$B$2*C2', 1, 1);
  assert(shiftedAbs === '=$B$2*D3', 'Shift =$B$2*C2 preserves $B$2 -> =$B$2*D3');

  // 5. Verification Tests from Prompt Requirements
  console.log('\n5. Executing Verification Tests...');

  const workbook = new WorkbookModel({ name: 'Test Workbook' });
  const engine = new CalculationEngine(workbook);

  // Test 1: A1 = 10, B1 = 20, C1 = =A1+B1 -> Expected: 30
  console.log('  Testing Test 1...');
  engine.setCellContent('Sheet1', 'A1', '10');
  engine.setCellContent('Sheet1', 'B1', '20');
  engine.setCellContent('Sheet1', 'C1', '=A1+B1');
  const sheet1 = workbook.getSheet('Sheet1')!;
  assert(sheet1.getCell('C1')?.value === 30, 'C1 = =A1+B1 evaluates to 30');

  // Test 2: A1 = 10, A2 = 20, A3 = 30, A4 = =SUM(A1:A3) -> Expected: 60
  console.log('  Testing Test 2...');
  engine.setCellContent('Sheet1', 'A1', '10');
  engine.setCellContent('Sheet1', 'A2', '20');
  engine.setCellContent('Sheet1', 'A3', '30');
  engine.setCellContent('Sheet1', 'A4', '=SUM(A1:A3)');
  assert(sheet1.getCell('A4')?.value === 60, 'A4 = =SUM(A1:A3) evaluates to 60');

  // Test 3: A1 = 10, B1 = 5, C1 = =A1/B1 -> Expected: 2
  console.log('  Testing Test 3...');
  engine.setCellContent('Sheet1', 'A1', '10');
  engine.setCellContent('Sheet1', 'B1', '5');
  engine.setCellContent('Sheet1', 'C1', '=A1/B1');
  assert(sheet1.getCell('C1')?.value === 2, 'C1 = =A1/B1 evaluates to 2');

  // Test 4: Change A1 to 20 -> C1 must automatically become 4
  console.log('  Testing Test 4 (Recalculation)...');
  engine.setCellContent('Sheet1', 'A1', '20');
  assert(sheet1.getCell('C1')?.value === 4, 'C1 automatically updates to 4 after A1 changes');

  // Test 5: Sheet2!A1 = 500, Sheet1!A1 = =Sheet2!A1 -> Expected: 500
  console.log('  Testing Test 5 (Cross-sheet)...');
  const sheet2 = workbook.addSheet('Sheet2');
  engine.setWorkbook(workbook);
  engine.setCellContent('Sheet2', 'A1', '500');
  engine.setCellContent('Sheet1', 'A1', '=Sheet2!A1');
  assert(sheet1.getCell('A1')?.value === 500, 'Cross-sheet reference Sheet1!A1 = =Sheet2!A1 evaluates to 500');

  // Test 6: A1 = 10, B1 = =A1+10, C1 = =B1+10, D1 = =C1+10. Change A1 to 100 -> B1=110, C1=120, D1=130
  console.log('  Testing Test 6 (Multi-level dependency propagation)...');
  engine.setCellContent('Sheet1', 'A1', '10');
  engine.setCellContent('Sheet1', 'B1', '=A1+10');
  engine.setCellContent('Sheet1', 'C1', '=B1+10');
  engine.setCellContent('Sheet1', 'D1', '=C1+10');

  engine.setCellContent('Sheet1', 'A1', '100');
  assert(sheet1.getCell('B1')?.value === 110, 'Multi-level B1 evaluates to 110');
  assert(sheet1.getCell('C1')?.value === 120, 'Multi-level C1 evaluates to 120');
  assert(sheet1.getCell('D1')?.value === 130, 'Multi-level D1 evaluates to 130');

  // Test 7: Division by zero -> #DIV/0!
  console.log('  Testing Division by Zero...');
  engine.setCellContent('Sheet1', 'B1', '0');
  engine.setCellContent('Sheet1', 'C1', '=10/B1');
  assert(sheet1.getCell('C1')?.error !== undefined && sheet1.getCell('C1')?.value === '#DIV/0!', 'Division by zero returns #DIV/0!');

  // Test 8: Circular Reference Detection -> #CIRCULAR!
  console.log('  Testing Circular Reference Detection...');
  engine.setCellContent('Sheet1', 'X1', '=Y1+10');
  engine.setCellContent('Sheet1', 'Y1', '=X1+10');
  assert(
    sheet1.getCell('X1')?.error !== undefined && sheet1.getCell('X1')?.value === '#CIRCULAR!',
    'Circular reference detected and flagged as #CIRCULAR!'
  );

  console.log('\n✅ ALL TEST SUITES PASSED SUCCESSFULLY!\n');
}

runEngineTests();
