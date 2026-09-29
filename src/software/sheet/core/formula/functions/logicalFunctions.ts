import { SpreadsheetError } from '../../errors/SpreadsheetError';
import { flattenNumericArgs } from './mathFunctions';

/**
 * Checks criteria matching e.g. ">10", "<=5", "hello", "100"
 */
function evaluateCriteria(val: any, criteria: any): boolean {
  if (criteria === undefined || criteria === null) return false;

  const critStr = String(criteria).trim();

  // Check operator criteria e.g. ">10", "<=5", "<>0", "=foo"
  const match = critStr.match(/^(>=|<=|<>|>|<|=)?\s*(.*)$/);
  if (!match) return false;

  const op = match[1] || '=';
  const targetStr = match[2];

  const valNum = Number(val);
  const targetNum = Number(targetStr);

  const isNumericComparison = !isNaN(valNum) && !isNaN(targetNum) && targetStr !== '';

  const v = isNumericComparison ? valNum : String(val).toLowerCase();
  const t = isNumericComparison ? targetNum : targetStr.toLowerCase();

  switch (op) {
    case '=':
      return v === t;
    case '<>':
      return v !== t;
    case '>':
      return v > t;
    case '<':
      return v < t;
    case '>=':
      return v >= t;
    case '<=':
      return v <= t;
    default:
      return false;
  }
}

export const logicalFunctions = {
  IF: (args: any[]) => {
    if (args.length < 2) throw new SpreadsheetError('VALUE', 'IF requires at least 2 arguments');
    const condition = Boolean(args[0]);
    if (condition) {
      return args[1];
    } else {
      return args.length >= 3 ? args[2] : false;
    }
  },

  IFS: (args: any[]) => {
    if (args.length < 2 || args.length % 2 !== 0) {
      throw new SpreadsheetError('VALUE', 'IFS requires even number of arguments');
    }
    for (let i = 0; i < args.length; i += 2) {
      if (Boolean(args[i])) {
        return args[i + 1];
      }
    }
    throw new SpreadsheetError('NA', 'No IFS condition met');
  },

  AND: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    for (const arg of args) {
      if (Array.isArray(arg)) {
        for (const el of arg) {
          if (!Boolean(el)) return false;
        }
      } else {
        if (!Boolean(arg)) return false;
      }
    }
    return true;
  },

  OR: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    for (const arg of args) {
      if (Array.isArray(arg)) {
        for (const el of arg) {
          if (Boolean(el)) return true;
        }
      } else {
        if (Boolean(arg)) return true;
      }
    }
    return false;
  },

  NOT: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    return !Boolean(args[0]);
  },

  COUNTIF: (args: any[]) => {
    if (args.length < 2) throw new SpreadsheetError('VALUE');
    const range = Array.isArray(args[0]) ? args[0] : [args[0]];
    const criteria = args[1];

    let count = 0;
    for (const val of range) {
      if (evaluateCriteria(val, criteria)) {
        count++;
      }
    }
    return count;
  },

  SUMIF: (args: any[]) => {
    if (args.length < 2) throw new SpreadsheetError('VALUE');
    const range = Array.isArray(args[0]) ? args[0] : [args[0]];
    const criteria = args[1];
    const sumRange = args.length >= 3 ? (Array.isArray(args[2]) ? args[2] : [args[2]]) : range;

    let sum = 0;
    for (let i = 0; i < range.length; i++) {
      if (evaluateCriteria(range[i], criteria)) {
        const valToSum = i < sumRange.length ? Number(sumRange[i]) : 0;
        if (!isNaN(valToSum)) {
          sum += valToSum;
        }
      }
    }
    return sum;
  },
};
