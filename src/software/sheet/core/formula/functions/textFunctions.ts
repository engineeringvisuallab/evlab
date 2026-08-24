import { SpreadsheetError } from '../../errors/SpreadsheetError';

export const textFunctions = {
  CONCAT: (args: any[]) => {
    let result = '';
    function recurse(item: any) {
      if (Array.isArray(item)) {
        for (const el of item) recurse(el);
      } else if (item !== null && item !== undefined) {
        result += String(item);
      }
    }
    for (const arg of args) {
      recurse(arg);
    }
    return result;
  },

  LEFT: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    const str = String(args[0] ?? '');
    const num = args.length >= 2 ? Math.floor(Number(args[1])) : 1;
    if (isNaN(num) || num < 0) throw new SpreadsheetError('VALUE');
    return str.substring(0, num);
  },

  RIGHT: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    const str = String(args[0] ?? '');
    const num = args.length >= 2 ? Math.floor(Number(args[1])) : 1;
    if (isNaN(num) || num < 0) throw new SpreadsheetError('VALUE');
    return str.substring(Math.max(0, str.length - num));
  },

  MID: (args: any[]) => {
    if (args.length < 3) throw new SpreadsheetError('VALUE');
    const str = String(args[0] ?? '');
    const start = Math.floor(Number(args[1])); // 1-based index in Excel
    const length = Math.floor(Number(args[2]));
    if (isNaN(start) || isNaN(length) || start < 1 || length < 0) throw new SpreadsheetError('VALUE');
    return str.substring(start - 1, start - 1 + length);
  },

  LEN: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    return String(args[0] ?? '').length;
  },

  UPPER: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    return String(args[0] ?? '').toUpperCase();
  },

  LOWER: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    return String(args[0] ?? '').toLowerCase();
  },

  TRIM: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    return String(args[0] ?? '').trim().replace(/\s+/g, ' ');
  },
};
