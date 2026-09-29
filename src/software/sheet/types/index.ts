export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'error' | 'blank';

export type NumberFormatType =
  | 'general'
  | 'number'
  | 'integer'
  | 'decimal'
  | 'currency'
  | 'percentage'
  | 'scientific'
  | 'engineering'
  | 'date';

export interface CellStyle {
  fontFamily?: string;
  fontSize?: number; // in pt or px
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  alignHorizontal?: 'left' | 'center' | 'right';
  alignVertical?: 'top' | 'middle' | 'bottom';
  textColor?: string;
  backgroundColor?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  numberFormat?: NumberFormatType;
  wrapText?: boolean;
}

export interface CellData {
  id: string; // e.g. "A1"
  value: string | number | boolean | null;
  formula?: string;
  displayValue?: string;
  dataType: DataType;
  style?: CellStyle;
  comment?: string;
  hyperlink?: string;
}

export interface CellPosition {
  row: number; // 0-indexed
  col: number; // 0-indexed
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export interface SheetData {
  id: string;
  name: string;
  color?: string;
  hidden?: boolean;
  cells: Record<string, CellData>; // key e.g. "A1"
  columnWidths: Record<number, number>; // col index -> width in px
  rowHeights: Record<number, number>; // row index -> height in px
  frozenRows?: number;
  frozenCols?: number;
}

export interface WorkbookData {
  id: string;
  name: string;
  sheets: SheetData[];
  activeSheetId: string;
  createdTime: string;
  updatedTime: string;
}

export type ThemeMode = 'dark' | 'light';

export interface SelectionStats {
  count: number;
  numericCount: number;
  sum: number;
  average: number;
  min: number;
  max: number;
}

export interface EngineeringFunctionMeta {
  name: string;
  category: 'geometry' | 'conversion' | 'hydraulic' | 'project' | 'structural' | 'general';
  description: string;
  syntax: string;
  example: string;
}
