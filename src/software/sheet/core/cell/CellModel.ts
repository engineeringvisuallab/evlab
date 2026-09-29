import { SpreadsheetError } from '../errors/SpreadsheetError';

export type CellDataType =
  | 'blank'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'formula'
  | 'error';

export interface CellStyle {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  textColor?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  alignHorizontal?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  alignVertical?: 'top' | 'middle' | 'bottom';
  numberFormat?: string;
  wrapText?: boolean;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
}

export interface Cell {
  address: string; // e.g., "A1"
  rawValue?: string; // e.g. "=A1+B1" or "100" or "text"
  value?: unknown; // evaluated value
  formula?: string; // e.g. "=A1+B1"
  dataType: CellDataType;
  styleId?: string;
  style?: CellStyle;
  comment?: string;
  hyperlink?: string;
  error?: SpreadsheetError;
}

export function createBlankCell(address: string): Cell {
  return {
    address,
    rawValue: '',
    value: '',
    dataType: 'blank',
  };
}
