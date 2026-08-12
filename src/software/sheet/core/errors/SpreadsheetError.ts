export type SpreadsheetErrorCode =
  | 'DIV0'
  | 'VALUE'
  | 'REF'
  | 'NAME'
  | 'NUM'
  | 'NA'
  | 'CIRCULAR'
  | 'ERROR';

export class SpreadsheetError {
  public code: SpreadsheetErrorCode;
  public message: string;

  constructor(code: SpreadsheetErrorCode, message?: string) {
    this.code = code;
    this.message = message || this.getDefaultMessage(code);
  }

  private getDefaultMessage(code: SpreadsheetErrorCode): string {
    switch (code) {
      case 'DIV0':
        return '#DIV/0!';
      case 'VALUE':
        return '#VALUE!';
      case 'REF':
        return '#REF!';
      case 'NAME':
        return '#NAME?';
      case 'NUM':
        return '#NUM!';
      case 'NA':
        return '#N/A';
      case 'CIRCULAR':
        return '#CIRCULAR!';
      case 'ERROR':
      default:
        return '#ERROR!';
    }
  }

  public toDisplayString(): string {
    return this.getDefaultMessage(this.code);
  }

  public toString(): string {
    return this.toDisplayString();
  }

  public static isSpreadsheetError(val: any): val is SpreadsheetError {
    return val instanceof SpreadsheetError || (typeof val === 'object' && val !== null && 'code' in val && 'toDisplayString' in val);
  }

  public static fromString(str: string): SpreadsheetError | null {
    switch (str.toUpperCase().trim()) {
      case '#DIV/0!':
        return new SpreadsheetError('DIV0');
      case '#VALUE!':
        return new SpreadsheetError('VALUE');
      case '#REF!':
        return new SpreadsheetError('REF');
      case '#NAME?':
        return new SpreadsheetError('NAME');
      case '#NUM!':
        return new SpreadsheetError('NUM');
      case '#N/A':
        return new SpreadsheetError('NA');
      case '#CIRCULAR!':
        return new SpreadsheetError('CIRCULAR');
      case '#ERROR!':
        return new SpreadsheetError('ERROR');
      default:
        return null;
    }
  }
}
