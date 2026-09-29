import { SpreadsheetError } from '../../errors/SpreadsheetError';

/**
 * Flattens nested arguments and converts to numbers for functions like SUM, AVERAGE
 */
export function flattenNumericArgs(args: any[]): number[] {
  const result: number[] = [];

  function recurse(item: any) {
    if (item === null || item === undefined || item === '') return;

    if (Array.isArray(item)) {
      for (const el of item) recurse(el);
    } else if (typeof item === 'number') {
      if (!isNaN(item)) result.push(item);
    } else if (typeof item === 'string') {
      const parsed = parseFloat(item);
      if (!isNaN(parsed)) result.push(parsed);
    } else if (typeof item === 'boolean') {
      result.push(item ? 1 : 0);
    }
  }

  for (const arg of args) {
    recurse(arg);
  }

  return result;
}

export const mathFunctions = {
  SUM: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    return nums.reduce((acc, curr) => acc + curr, 0);
  },

  PRODUCT: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    if (nums.length === 0) return 0;
    return nums.reduce((acc, curr) => acc * curr, 1);
  },

  ABS: (args: any[]) => {
    const val = Number(args[0]);
    if (isNaN(val)) throw new SpreadsheetError('VALUE');
    return Math.abs(val);
  },

  SQRT: (args: any[]) => {
    const val = Number(args[0]);
    if (isNaN(val) || val < 0) throw new SpreadsheetError('NUM');
    return Math.sqrt(val);
  },

  POWER: (args: any[]) => {
    const base = Number(args[0]);
    const exp = Number(args[1]);
    if (isNaN(base) || isNaN(exp)) throw new SpreadsheetError('VALUE');
    const res = Math.pow(base, exp);
    if (isNaN(res)) throw new SpreadsheetError('NUM');
    return res;
  },

  MOD: (args: any[]) => {
    const n = Number(args[0]);
    const d = Number(args[1]);
    if (isNaN(n) || isNaN(d)) throw new SpreadsheetError('VALUE');
    if (d === 0) throw new SpreadsheetError('DIV0');
    return ((n % d) + d) % d;
  },

  ROUND: (args: any[]) => {
    const val = Number(args[0]);
    const digits = args[1] !== undefined ? Number(args[1]) : 0;
    if (isNaN(val) || isNaN(digits)) throw new SpreadsheetError('VALUE');
    const factor = Math.pow(10, Math.floor(digits));
    return Math.round(val * factor) / factor;
  },

  ROUNDUP: (args: any[]) => {
    const val = Number(args[0]);
    const digits = args[1] !== undefined ? Number(args[1]) : 0;
    if (isNaN(val) || isNaN(digits)) throw new SpreadsheetError('VALUE');
    const factor = Math.pow(10, Math.floor(digits));
    return (val >= 0 ? Math.ceil(val * factor) : Math.floor(val * factor)) / factor;
  },

  ROUNDDOWN: (args: any[]) => {
    const val = Number(args[0]);
    const digits = args[1] !== undefined ? Number(args[1]) : 0;
    if (isNaN(val) || isNaN(digits)) throw new SpreadsheetError('VALUE');
    const factor = Math.pow(10, Math.floor(digits));
    return (val >= 0 ? Math.floor(val * factor) : Math.ceil(val * factor)) / factor;
  },
};
