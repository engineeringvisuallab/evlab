import { flattenNumericArgs } from './mathFunctions';
import { SpreadsheetError } from '../../errors/SpreadsheetError';

export const statFunctions = {
  AVERAGE: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    if (nums.length === 0) throw new SpreadsheetError('DIV0');
    const sum = nums.reduce((acc, curr) => acc + curr, 0);
    return sum / nums.length;
  },

  MIN: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    if (nums.length === 0) return 0;
    return Math.min(...nums);
  },

  MAX: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    if (nums.length === 0) return 0;
    return Math.max(...nums);
  },

  COUNT: (args: any[]) => {
    const nums = flattenNumericArgs(args);
    return nums.length;
  },

  COUNTA: (args: any[]) => {
    let count = 0;
    function recurse(item: any) {
      if (Array.isArray(item)) {
        for (const el of item) recurse(el);
      } else if (item !== null && item !== undefined && item !== '') {
        count++;
      }
    }
    for (const arg of args) {
      recurse(arg);
    }
    return count;
  },

  MEDIAN: (args: any[]) => {
    const nums = flattenNumericArgs(args).sort((a, b) => a - b);
    if (nums.length === 0) throw new SpreadsheetError('NUM');
    const mid = Math.floor(nums.length / 2);
    if (nums.length % 2 !== 0) {
      return nums[mid];
    } else {
      return (nums[mid - 1] + nums[mid]) / 2;
    }
  },
};
