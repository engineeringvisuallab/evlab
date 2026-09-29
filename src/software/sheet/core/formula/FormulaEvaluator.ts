import { ASTNode } from './FormulaAST';
import { WorkbookModel } from '../workbook/WorkbookModel';
import { WorksheetModel } from '../worksheet/WorksheetModel';
import { parseCellAddress, formatCellAddress } from '../references/AddressParser';
import { parseRange, iterateRange } from '../ranges/RangeParser';
import { FunctionRegistry } from './FunctionRegistry';
import { SpreadsheetError } from '../errors/SpreadsheetError';

export interface EvaluationContext {
  workbook: WorkbookModel;
  currentSheet: WorksheetModel;
  currentCellAddress: string;
}

export class FormulaEvaluator {
  private functionRegistry: FunctionRegistry = FunctionRegistry.getInstance();

  public evaluate(ast: ASTNode, context: EvaluationContext): any {
    if (!ast) return '';

    try {
      switch (ast.type) {
        case 'NUMBER':
          return ast.value;

        case 'STRING':
          return ast.value;

        case 'BOOLEAN':
          return ast.value;

        case 'CELL_REF':
          return this.evaluateCellRef(ast.raw, context);

        case 'RANGE_REF':
          return this.evaluateRangeRef(ast.raw, context);

        case 'FUNCTION':
          return this.evaluateFunctionCall(ast.name, ast.args, context);

        case 'BINARY_OP':
          return this.evaluateBinaryOp(ast.op, ast.left, ast.right, context);

        case 'UNARY_OP':
          return this.evaluateUnaryOp(ast.op, ast.operand, context);

        default:
          throw new SpreadsheetError('VALUE', 'Unknown AST node type');
      }
    } catch (err) {
      if (SpreadsheetError.isSpreadsheetError(err)) {
        return err;
      }
      return new SpreadsheetError('VALUE', err instanceof Error ? err.message : String(err));
    }
  }

  private evaluateCellRef(refStr: string, context: EvaluationContext): any {
    const parsed = parseCellAddress(refStr);
    if (!parsed) {
      throw new SpreadsheetError('REF');
    }

    const targetSheet = parsed.sheetName
      ? context.workbook.getSheet(parsed.sheetName)
      : context.currentSheet;

    if (!targetSheet) {
      throw new SpreadsheetError('REF', `Sheet ${parsed.sheetName} not found`);
    }

    const cellAddr = formatCellAddress(parsed, false);
    const cell = targetSheet.getCell(cellAddr);

    if (!cell) {
      return 0; // Empty cell treated as 0 in formulas
    }

    if (cell.error) {
      throw cell.error;
    }

    if (cell.value === undefined || cell.value === null || cell.value === '') {
      return 0;
    }

    if (typeof cell.value === 'boolean' || typeof cell.value === 'number') {
      return cell.value;
    }

    if (typeof cell.value === 'string') {
      const num = Number(cell.value);
      return isNaN(num) ? cell.value : num;
    }

    return cell.value;
  }

  private evaluateRangeRef(rangeStr: string, context: EvaluationContext): any[] {
    const range = parseRange(rangeStr);
    if (!range) {
      throw new SpreadsheetError('REF');
    }

    const targetSheet = range.sheetName || range.start.sheetName
      ? context.workbook.getSheet(range.sheetName || range.start.sheetName!)
      : context.currentSheet;

    if (!targetSheet) {
      throw new SpreadsheetError('REF');
    }

    const values: any[] = [];
    iterateRange(range, (addr) => {
      const cellAddr = formatCellAddress(addr, false);
      const cell = targetSheet.getCell(cellAddr);
      if (!cell || cell.value === undefined || cell.value === null || cell.value === '') {
        values.push(0);
      } else if (cell.error) {
        throw cell.error;
      } else if (typeof cell.value === 'number' || typeof cell.value === 'boolean') {
        values.push(cell.value);
      } else {
        const num = Number(cell.value);
        values.push(isNaN(num) ? cell.value : num);
      }
    });

    return values;
  }

  private evaluateFunctionCall(
    fnName: string,
    argsNodes: ASTNode[],
    context: EvaluationContext
  ): any {
    const fnDef = this.functionRegistry.get(fnName);
    if (!fnDef) {
      throw new SpreadsheetError('NAME', `Unknown function ${fnName}`);
    }

    if (argsNodes.length < fnDef.minArgs || argsNodes.length > fnDef.maxArgs) {
      throw new SpreadsheetError('VALUE', `Function ${fnName} expects ${fnDef.minArgs}-${fnDef.maxArgs} arguments`);
    }

    // Evaluate argument AST nodes
    const evaluatedArgs = argsNodes.map((argNode) => this.evaluate(argNode, context));

    // Propagate spreadsheet errors if present in simple args
    for (const arg of evaluatedArgs) {
      if (SpreadsheetError.isSpreadsheetError(arg)) {
        throw arg;
      }
    }

    return fnDef.fn(evaluatedArgs, context);
  }

  private evaluateBinaryOp(
    op: string,
    leftNode: ASTNode,
    rightNode: ASTNode,
    context: EvaluationContext
  ): any {
    const leftVal = this.evaluate(leftNode, context);
    if (SpreadsheetError.isSpreadsheetError(leftVal)) throw leftVal;

    const rightVal = this.evaluate(rightNode, context);
    if (SpreadsheetError.isSpreadsheetError(rightVal)) throw rightVal;

    // Arithmetic operators
    if (['+', '-', '*', '/', '%', '^'].includes(op)) {
      const l = Number(leftVal);
      const r = Number(rightVal);

      if (isNaN(l) || isNaN(r)) {
        throw new SpreadsheetError('VALUE');
      }

      switch (op) {
        case '+':
          return l + r;
        case '-':
          return l - r;
        case '*':
          return l * r;
        case '/':
          if (r === 0) throw new SpreadsheetError('DIV0');
          return l / r;
        case '%':
          if (r === 0) throw new SpreadsheetError('DIV0');
          return l % r;
        case '^':
          const res = Math.pow(l, r);
          if (isNaN(res)) throw new SpreadsheetError('NUM');
          return res;
      }
    }

    // Comparison operators (=, <>, >, <, >=, <=)
    const lStr = typeof leftVal === 'string' ? leftVal.toLowerCase() : leftVal;
    const rStr = typeof rightVal === 'string' ? rightVal.toLowerCase() : rightVal;

    switch (op) {
      case '=':
        return lStr === rStr;
      case '<>':
        return lStr !== rStr;
      case '>':
        return lStr > rStr;
      case '<':
        return lStr < rStr;
      case '>=':
        return lStr >= rStr;
      case '<=':
        return lStr <= rStr;
    }

    throw new SpreadsheetError('VALUE');
  }

  private evaluateUnaryOp(
    op: string,
    operandNode: ASTNode,
    context: EvaluationContext
  ): any {
    const val = this.evaluate(operandNode, context);
    if (SpreadsheetError.isSpreadsheetError(val)) throw val;

    const num = Number(val);
    if (isNaN(num)) throw new SpreadsheetError('VALUE');

    return op === '-' ? -num : num;
  }
}
