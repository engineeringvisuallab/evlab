import { mathFunctions } from './functions/mathFunctions';
import { statFunctions } from './functions/statFunctions';
import { logicalFunctions } from './functions/logicalFunctions';
import { textFunctions } from './functions/textFunctions';
import { dateFunctions } from './functions/dateFunctions';
import { EngineeringFunctionRegistry } from '../engineering/EngineeringFunctionRegistry';

export interface FunctionDefinition {
  name: string;
  category: 'Math' | 'Statistical' | 'Logical' | 'Text' | 'Date' | 'Engineering' | 'Other';
  description: string;
  syntax: string;
  minArgs: number;
  maxArgs: number;
  fn: (args: any[], context?: any) => any;
}

export class FunctionRegistry {
  private static instance: FunctionRegistry;
  private functions: Map<string, FunctionDefinition> = new Map();

  private constructor() {
    this.registerBuiltInFunctions();
  }

  public static getInstance(): FunctionRegistry {
    if (!FunctionRegistry.instance) {
      FunctionRegistry.instance = new FunctionRegistry();
    }
    return FunctionRegistry.instance;
  }

  public register(def: FunctionDefinition): void {
    this.functions.set(def.name.toUpperCase(), def);
  }

  public get(name: string): FunctionDefinition | undefined {
    return this.functions.get(name.toUpperCase());
  }

  public has(name: string): boolean {
    return this.functions.has(name.toUpperCase());
  }

  public getAll(): FunctionDefinition[] {
    return Array.from(this.functions.values());
  }

  public getSuggestions(prefix: string): FunctionDefinition[] {
    if (!prefix) return [];
    const cleanPrefix = prefix.toUpperCase().trim();
    return this.getAll().filter((fn) => fn.name.startsWith(cleanPrefix));
  }

  private registerBuiltInFunctions(): void {
    // Math
    this.register({
      name: 'SUM',
      category: 'Math',
      description: 'Calculates the sum of a list of numbers or cell ranges.',
      syntax: 'SUM(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: mathFunctions.SUM,
    });
    this.register({
      name: 'PRODUCT',
      category: 'Math',
      description: 'Multiplies all numbers given as arguments.',
      syntax: 'PRODUCT(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: mathFunctions.PRODUCT,
    });
    this.register({
      name: 'ABS',
      category: 'Math',
      description: 'Returns the absolute value of a number.',
      syntax: 'ABS(number)',
      minArgs: 1,
      maxArgs: 1,
      fn: mathFunctions.ABS,
    });
    this.register({
      name: 'SQRT',
      category: 'Math',
      description: 'Returns a positive square root.',
      syntax: 'SQRT(number)',
      minArgs: 1,
      maxArgs: 1,
      fn: mathFunctions.SQRT,
    });
    this.register({
      name: 'POWER',
      category: 'Math',
      description: 'Returns the result of a number raised to a power.',
      syntax: 'POWER(number, power)',
      minArgs: 2,
      maxArgs: 2,
      fn: mathFunctions.POWER,
    });
    this.register({
      name: 'MOD',
      category: 'Math',
      description: 'Returns the remainder from division.',
      syntax: 'MOD(number, divisor)',
      minArgs: 2,
      maxArgs: 2,
      fn: mathFunctions.MOD,
    });
    this.register({
      name: 'ROUND',
      category: 'Math',
      description: 'Rounds a number to a specified number of digits.',
      syntax: 'ROUND(number, num_digits)',
      minArgs: 1,
      maxArgs: 2,
      fn: mathFunctions.ROUND,
    });
    this.register({
      name: 'ROUNDUP',
      category: 'Math',
      description: 'Rounds a number up, away from 0.',
      syntax: 'ROUNDUP(number, num_digits)',
      minArgs: 1,
      maxArgs: 2,
      fn: mathFunctions.ROUNDUP,
    });
    this.register({
      name: 'ROUNDDOWN',
      category: 'Math',
      description: 'Rounds a number down, toward 0.',
      syntax: 'ROUNDDOWN(number, num_digits)',
      minArgs: 1,
      maxArgs: 2,
      fn: mathFunctions.ROUNDDOWN,
    });

    // Statistical
    this.register({
      name: 'AVERAGE',
      category: 'Statistical',
      description: 'Returns the average (arithmetic mean) of arguments.',
      syntax: 'AVERAGE(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.AVERAGE,
    });
    this.register({
      name: 'MIN',
      category: 'Statistical',
      description: 'Returns the minimum value in a set of values.',
      syntax: 'MIN(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.MIN,
    });
    this.register({
      name: 'MAX',
      category: 'Statistical',
      description: 'Returns the maximum value in a set of values.',
      syntax: 'MAX(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.MAX,
    });
    this.register({
      name: 'COUNT',
      category: 'Statistical',
      description: 'Counts how many numbers are in the list of arguments.',
      syntax: 'COUNT(value1, [value2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.COUNT,
    });
    this.register({
      name: 'COUNTA',
      category: 'Statistical',
      description: 'Counts how many values are in the list of arguments.',
      syntax: 'COUNTA(value1, [value2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.COUNTA,
    });
    this.register({
      name: 'MEDIAN',
      category: 'Statistical',
      description: 'Returns the median of the given numbers.',
      syntax: 'MEDIAN(number1, [number2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: statFunctions.MEDIAN,
    });

    // Logical
    this.register({
      name: 'IF',
      category: 'Logical',
      description: 'Specifies a logical test to perform.',
      syntax: 'IF(logical_test, value_if_true, [value_if_false])',
      minArgs: 2,
      maxArgs: 3,
      fn: logicalFunctions.IF,
    });
    this.register({
      name: 'IFS',
      category: 'Logical',
      description: 'Checks whether one or more conditions are met.',
      syntax: 'IFS(logical_test1, value_if_true1, ...)',
      minArgs: 2,
      maxArgs: 254,
      fn: logicalFunctions.IFS,
    });
    this.register({
      name: 'AND',
      category: 'Logical',
      description: 'Returns TRUE if all arguments are TRUE.',
      syntax: 'AND(logical1, [logical2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: logicalFunctions.AND,
    });
    this.register({
      name: 'OR',
      category: 'Logical',
      description: 'Returns TRUE if any argument is TRUE.',
      syntax: 'OR(logical1, [logical2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: logicalFunctions.OR,
    });
    this.register({
      name: 'NOT',
      category: 'Logical',
      description: 'Reverses the logic of its argument.',
      syntax: 'NOT(logical)',
      minArgs: 1,
      maxArgs: 1,
      fn: logicalFunctions.NOT,
    });
    this.register({
      name: 'COUNTIF',
      category: 'Logical',
      description: 'Counts the number of cells within a range that meet criteria.',
      syntax: 'COUNTIF(range, criteria)',
      minArgs: 2,
      maxArgs: 2,
      fn: logicalFunctions.COUNTIF,
    });
    this.register({
      name: 'SUMIF',
      category: 'Logical',
      description: 'Adds the cells specified by a given criteria.',
      syntax: 'SUMIF(range, criteria, [sum_range])',
      minArgs: 2,
      maxArgs: 3,
      fn: logicalFunctions.SUMIF,
    });

    // Text
    this.register({
      name: 'CONCAT',
      category: 'Text',
      description: 'Combines the text from multiple ranges and/or strings.',
      syntax: 'CONCAT(text1, [text2], ...)',
      minArgs: 1,
      maxArgs: 255,
      fn: textFunctions.CONCAT,
    });
    this.register({
      name: 'LEFT',
      category: 'Text',
      description: 'Returns the specified number of characters from the start of text.',
      syntax: 'LEFT(text, [num_chars])',
      minArgs: 1,
      maxArgs: 2,
      fn: textFunctions.LEFT,
    });
    this.register({
      name: 'RIGHT',
      category: 'Text',
      description: 'Returns the specified number of characters from the end of text.',
      syntax: 'RIGHT(text, [num_chars])',
      minArgs: 1,
      maxArgs: 2,
      fn: textFunctions.RIGHT,
    });
    this.register({
      name: 'MID',
      category: 'Text',
      description: 'Returns characters from the middle of a text string.',
      syntax: 'MID(text, start_num, num_chars)',
      minArgs: 3,
      maxArgs: 3,
      fn: textFunctions.MID,
    });
    this.register({
      name: 'LEN',
      category: 'Text',
      description: 'Returns the number of characters in a text string.',
      syntax: 'LEN(text)',
      minArgs: 1,
      maxArgs: 1,
      fn: textFunctions.LEN,
    });
    this.register({
      name: 'UPPER',
      category: 'Text',
      description: 'Converts text to uppercase.',
      syntax: 'UPPER(text)',
      minArgs: 1,
      maxArgs: 1,
      fn: textFunctions.UPPER,
    });
    this.register({
      name: 'LOWER',
      category: 'Text',
      description: 'Converts text to lowercase.',
      syntax: 'LOWER(text)',
      minArgs: 1,
      maxArgs: 1,
      fn: textFunctions.LOWER,
    });
    this.register({
      name: 'TRIM',
      category: 'Text',
      description: 'Removes spaces from text.',
      syntax: 'TRIM(text)',
      minArgs: 1,
      maxArgs: 1,
      fn: textFunctions.TRIM,
    });

    // Date
    this.register({
      name: 'TODAY',
      category: 'Date',
      description: 'Returns the current date.',
      syntax: 'TODAY()',
      minArgs: 0,
      maxArgs: 0,
      fn: dateFunctions.TODAY,
    });
    this.register({
      name: 'NOW',
      category: 'Date',
      description: 'Returns the current date and time.',
      syntax: 'NOW()',
      minArgs: 0,
      maxArgs: 0,
      fn: dateFunctions.NOW,
    });
    this.register({
      name: 'DATE',
      category: 'Date',
      description: 'Returns the serial number of a particular date.',
      syntax: 'DATE(year, month, day)',
      minArgs: 3,
      maxArgs: 3,
      fn: dateFunctions.DATE,
    });
    this.register({
      name: 'YEAR',
      category: 'Date',
      description: 'Converts a serial number to a year.',
      syntax: 'YEAR(date)',
      minArgs: 1,
      maxArgs: 1,
      fn: dateFunctions.YEAR,
    });
    this.register({
      name: 'MONTH',
      category: 'Date',
      description: 'Converts a serial number to a month.',
      syntax: 'MONTH(date)',
      minArgs: 1,
      maxArgs: 1,
      fn: dateFunctions.MONTH,
    });
    this.register({
      name: 'DAY',
      category: 'Date',
      description: 'Converts a serial number to a day of the month.',
      syntax: 'DAY(date)',
      minArgs: 1,
      maxArgs: 1,
      fn: dateFunctions.DAY,
    });

    // Engineering functions from EngineeringFunctionRegistry
    try {
      for (const impl of EngineeringFunctionRegistry.getAll()) {
        const fnMeta = impl.meta;
        this.register({
          name: fnMeta.name,
          category: 'Engineering',
          description: fnMeta.description,
          syntax: fnMeta.syntax,
          minArgs: 1,
          maxArgs: 5,
          fn: (args: any[]) => impl.execute(...args),
        });
      }
    } catch {
      // Ignore if engineering registry initial load pending
    }
  }
}
