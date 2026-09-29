import { CellData, SheetData } from '../../types';
import { cellIdToPosition, isPositionInRange, parseRangeString } from '../cell/cellUtils';
import { EngineeringFunctionRegistry } from '../engineering/EngineeringFunctionRegistry';

export interface EvaluatorContext {
  sheets: SheetData[];
  currentSheetId: string;
  visitedCells?: Set<string>; // For circular reference detection
}

export function evaluateFormula(formula: string, context: EvaluatorContext): string | number | boolean {
  if (!formula.startsWith('=')) {
    return formula;
  }

  const cleanFormula = formula.substring(1).trim();
  if (!cleanFormula) return '';

  const visited = context.visitedCells || new Set<string>();

  try {
    return parseExpression(cleanFormula, context, visited);
  } catch (err: any) {
    if (typeof err === 'string' && err.startsWith('#')) {
      return err;
    }
    return '#VALUE!';
  }
}

function getCellValue(cellRef: string, context: EvaluatorContext, visited: Set<string>): any {
  const parsed = cellIdToPosition(cellRef);
  if (!parsed) return '#REF!';

  let targetSheet = context.sheets.find((s) => s.id === context.currentSheetId);
  if (parsed.sheetName) {
    targetSheet = context.sheets.find(
      (s) => s.name.toLowerCase() === parsed.sheetName!.toLowerCase()
    );
  }

  if (!targetSheet) return '#REF!';

  const cellKey = `${targetSheet.name}!${parsed.pos.col},${parsed.pos.row}`;
  if (visited.has(cellKey)) {
    return '#REF!'; // Circular reference detection
  }

  const colLabel = String.fromCharCode(65 + parsed.pos.col);
  const cellId = `${colLabel}${parsed.pos.row + 1}`;
  const cell: CellData | undefined = targetSheet.cells[cellId];

  if (!cell || cell.value === null || cell.value === undefined || cell.value === '') {
    return 0; // Blanks act as 0 in arithmetic
  }

  if (cell.formula) {
    const newVisited = new Set(visited);
    newVisited.add(cellKey);
    return evaluateFormula(cell.formula, {
      ...context,
      currentSheetId: targetSheet.id,
      visitedCells: newVisited,
    });
  }

  return cell.value;
}

function resolveRangeValues(rangeStr: string, context: EvaluatorContext, visited: Set<string>): any[] {
  const parsed = parseRangeString(rangeStr);
  if (!parsed) return [];

  let targetSheet = context.sheets.find((s) => s.id === context.currentSheetId);
  if (parsed.sheetName) {
    targetSheet = context.sheets.find(
      (s) => s.name.toLowerCase() === parsed.sheetName!.toLowerCase()
    );
  }

  if (!targetSheet) return [];

  const values: any[] = [];
  const norm = parsed.range;

  for (let r = norm.start.row; r <= norm.end.row; r++) {
    for (let c = norm.start.col; c <= norm.end.col; c++) {
      const colLabel = String.fromCharCode(65 + c);
      const cellId = `${colLabel}${r + 1}`;
      const cell = targetSheet.cells[cellId];

      if (cell) {
        if (cell.formula) {
          const val = evaluateFormula(cell.formula, {
            ...context,
            currentSheetId: targetSheet.id,
            visitedCells: visited,
          });
          values.push(val);
        } else if (cell.value !== null && cell.value !== undefined && cell.value !== '') {
          values.push(cell.value);
        }
      }
    }
  }

  return values;
}

function parseExpression(expr: string, context: EvaluatorContext, visited: Set<string>): any {
  // Simple tokenizer / evaluator supporting functions, cell references, ranges, arithmetic operators
  const trimmed = expr.trim();

  // Function Call: e.g., SUM(A1:A10), IF(A1>5, "YES", "NO")
  const funcMatch = trimmed.match(/^([A-Za-z0-9_]+)\((.*)\)$/s);
  if (funcMatch) {
    const funcName = funcMatch[1].toUpperCase();
    const argsStr = funcMatch[2];
    const args = parseFunctionArgs(argsStr);

    return executeFunction(funcName, args, context, visited);
  }

  // Handle Binary Operators (+, -, *, /, ^, =, <>, >, <, >=, <=)
  // Split at lowest precedence operators outside quotes & parentheses
  const binaryOp = findLowestPrecedenceOperator(trimmed);
  if (binaryOp) {
    const leftVal = parseExpression(binaryOp.left, context, visited);
    const rightVal = parseExpression(binaryOp.right, context, visited);

    if (typeof leftVal === 'string' && leftVal.startsWith('#')) return leftVal;
    if (typeof rightVal === 'string' && rightVal.startsWith('#')) return rightVal;

    return executeBinaryOp(binaryOp.op, leftVal, rightVal);
  }

  // Quoted String Literal e.g. "Hello"
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Number literal
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }

  // Boolean literal
  if (trimmed.toUpperCase() === 'TRUE') return true;
  if (trimmed.toUpperCase() === 'FALSE') return false;

  // Single Cell Reference e.g. A1, $B$5, Sheet1!C10
  if (/^('?[A-Za-z0-9_ ]+'?!)?\$?[A-Za-z]+\$?\d+$/.test(trimmed)) {
    return getCellValue(trimmed, context, visited);
  }

  return '#VALUE!';
}

function parseFunctionArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let parenCount = 0;

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === '(' && !inQuotes) {
      parenCount++;
      current += char;
    } else if (char === ')' && !inQuotes) {
      parenCount--;
      current += char;
    } else if (char === ',' && !inQuotes && parenCount === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim().length > 0) {
    args.push(current.trim());
  }

  return args;
}

function executeFunction(
  funcName: string,
  rawArgs: string[],
  context: EvaluatorContext,
  visited: Set<string>
): any {
  // Check Engineering Function Registry first
  const engFunc = EngineeringFunctionRegistry.get(funcName);
  if (engFunc) {
    const evaluatedArgs = rawArgs.map((arg) => parseExpression(arg, context, visited));
    return engFunc.execute(...evaluatedArgs);
  }

  // Standard Functions
  switch (funcName) {
    case 'SUM': {
      let sum = 0;
      for (const arg of rawArgs) {
        if (arg.includes(':')) {
          const vals = resolveRangeValues(arg, context, visited);
          vals.forEach((v) => {
            if (typeof v === 'number') sum += v;
            else if (!isNaN(Number(v)) && v !== '') sum += Number(v);
          });
        } else {
          const val = parseExpression(arg, context, visited);
          if (typeof val === 'number') sum += val;
          else if (!isNaN(Number(val)) && val !== '') sum += Number(val);
        }
      }
      return sum;
    }

    case 'AVERAGE': {
      let sum = 0;
      let count = 0;
      for (const arg of rawArgs) {
        const vals = arg.includes(':')
          ? resolveRangeValues(arg, context, visited)
          : [parseExpression(arg, context, visited)];

        vals.forEach((v) => {
          if (typeof v === 'number' && !isNaN(v)) {
            sum += v;
            count++;
          } else if (!isNaN(Number(v)) && v !== '' && typeof v !== 'boolean') {
            sum += Number(v);
            count++;
          }
        });
      }
      return count > 0 ? sum / count : '#DIV/0!';
    }

    case 'MIN': {
      let minVal: number | null = null;
      for (const arg of rawArgs) {
        const vals = arg.includes(':')
          ? resolveRangeValues(arg, context, visited)
          : [parseExpression(arg, context, visited)];

        vals.forEach((v) => {
          const num = Number(v);
          if (!isNaN(num) && v !== '' && typeof v !== 'boolean') {
            if (minVal === null || num < minVal) minVal = num;
          }
        });
      }
      return minVal !== null ? minVal : 0;
    }

    case 'MAX': {
      let maxVal: number | null = null;
      for (const arg of rawArgs) {
        const vals = arg.includes(':')
          ? resolveRangeValues(arg, context, visited)
          : [parseExpression(arg, context, visited)];

        vals.forEach((v) => {
          const num = Number(v);
          if (!isNaN(num) && v !== '' && typeof v !== 'boolean') {
            if (maxVal === null || num > maxVal) maxVal = num;
          }
        });
      }
      return maxVal !== null ? maxVal : 0;
    }

    case 'COUNT': {
      let count = 0;
      for (const arg of rawArgs) {
        const vals = arg.includes(':')
          ? resolveRangeValues(arg, context, visited)
          : [parseExpression(arg, context, visited)];

        vals.forEach((v) => {
          if (typeof v === 'number' && !isNaN(v)) count++;
        });
      }
      return count;
    }

    case 'COUNTA': {
      let count = 0;
      for (const arg of rawArgs) {
        const vals = arg.includes(':')
          ? resolveRangeValues(arg, context, visited)
          : [parseExpression(arg, context, visited)];

        vals.forEach((v) => {
          if (v !== null && v !== undefined && v !== '') count++;
        });
      }
      return count;
    }

    case 'IF': {
      if (rawArgs.length < 2) return '#VALUE!';
      const cond = parseExpression(rawArgs[0], context, visited);
      const isTrue = Boolean(cond) && cond !== 0 && cond !== 'FALSE' && cond !== '#VALUE!';
      if (isTrue) {
        return parseExpression(rawArgs[1], context, visited);
      } else {
        return rawArgs.length > 2 ? parseExpression(rawArgs[2], context, visited) : false;
      }
    }

    case 'CONCAT':
    case 'CONCATENATE': {
      let str = '';
      for (const arg of rawArgs) {
        const val = parseExpression(arg, context, visited);
        str += String(val ?? '');
      }
      return str;
    }

    case 'ROUND': {
      if (rawArgs.length === 0) return '#VALUE!';
      const val = Number(parseExpression(rawArgs[0], context, visited));
      const decimals = rawArgs.length > 1 ? Number(parseExpression(rawArgs[1], context, visited)) : 0;
      if (isNaN(val) || isNaN(decimals)) return '#VALUE!';
      const factor = Math.pow(10, decimals);
      return Math.round(val * factor) / factor;
    }

    case 'SQRT': {
      const val = Number(parseExpression(rawArgs[0], context, visited));
      if (isNaN(val)) return '#VALUE!';
      if (val < 0) return '#NUM!';
      return Math.sqrt(val);
    }

    case 'ABS': {
      const val = Number(parseExpression(rawArgs[0], context, visited));
      if (isNaN(val)) return '#VALUE!';
      return Math.abs(val);
    }

    case 'UPPER': {
      const val = parseExpression(rawArgs[0], context, visited);
      return String(val).toUpperCase();
    }

    case 'LOWER': {
      const val = parseExpression(rawArgs[0], context, visited);
      return String(val).toLowerCase();
    }

    case 'LEN': {
      const val = parseExpression(rawArgs[0], context, visited);
      return String(val).length;
    }

    default:
      return '#NAME?';
  }
}

function findLowestPrecedenceOperator(expr: string): { left: string; op: string; right: string } | null {
  // Check for operators in increasing precedence order: =, <>, >=, <=, >, <, +, -, *, /, %, ^
  const operators = [
    ['=', '<>', '>=', '<=', '>', '<'],
    ['+', '-'],
    ['*', '/', '%'],
    ['^'],
  ];

  let parenCount = 0;
  let inQuotes = false;

  for (const opGroup of operators) {
    for (let i = expr.length - 1; i >= 0; i--) {
      const char = expr[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === ')' && !inQuotes) parenCount++;
      if (char === '(' && !inQuotes) parenCount--;

      if (parenCount === 0 && !inQuotes) {
        for (const op of opGroup) {
          if (expr.substring(i - op.length + 1, i + 1) === op) {
            // Found operator
            const left = expr.substring(0, i - op.length + 1);
            const right = expr.substring(i + 1);
            if (left.trim() && right.trim()) {
              return { left, op, right };
            }
          }
        }
      }
    }
  }

  return null;
}

function executeBinaryOp(op: string, a: any, b: any): any {
  const numA = Number(a);
  const numB = Number(b);

  switch (op) {
    case '+':
      return numA + numB;
    case '-':
      return numA - numB;
    case '*':
      return numA * numB;
    case '/':
      if (numB === 0) return '#DIV/0!';
      return numA / numB;
    case '%':
      return numA % numB;
    case '^':
      return Math.pow(numA, numB);
    case '=':
      return a == b;
    case '<>':
      return a != b;
    case '>':
      return numA > numB;
    case '<':
      return numA < numB;
    case '>=':
      return numA >= numB;
    case '<=':
      return numA <= numB;
    default:
      return '#VALUE!';
  }
}
