import { SpreadsheetError } from '../../errors/SpreadsheetError';

export const dateFunctions = {
  TODAY: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  },

  NOW: () => {
    return new Date().toISOString();
  },

  DATE: (args: any[]) => {
    if (args.length < 3) throw new SpreadsheetError('VALUE');
    const year = Number(args[0]);
    const month = Number(args[1]) - 1; // 0-based month
    const day = Number(args[2]);
    if (isNaN(year) || isNaN(month) || isNaN(day)) throw new SpreadsheetError('VALUE');

    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) throw new SpreadsheetError('NUM');

    return d.toISOString().split('T')[0];
  },

  YEAR: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    const d = new Date(args[0]);
    if (isNaN(d.getTime())) throw new SpreadsheetError('VALUE');
    return d.getFullYear();
  },

  MONTH: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    const d = new Date(args[0]);
    if (isNaN(d.getTime())) throw new SpreadsheetError('VALUE');
    return d.getMonth() + 1; // 1-based month
  },

  DAY: (args: any[]) => {
    if (args.length === 0) throw new SpreadsheetError('VALUE');
    const d = new Date(args[0]);
    if (isNaN(d.getTime())) throw new SpreadsheetError('VALUE');
    return d.getDate();
  },
};
