import { CellAddress, parseCellAddress, formatCellAddress } from '../references/AddressParser';

export interface CellRange {
  start: CellAddress;
  end: CellAddress;
  sheetName?: string;
}

/**
 * Parses a range string like "A1:A10", "Sheet2!B5:D20", or "'Water Demand'!A1:B10"
 * Also supports single cell addresses e.g. "A1" (treated as A1:A1)
 */
export function parseRange(rangeStr: string): CellRange | null {
  if (!rangeStr || typeof rangeStr !== 'string') return null;

  let str = rangeStr.trim();
  let sheetName: string | undefined = undefined;

  // Check for sheet reference
  const bangIdx = str.lastIndexOf('!');
  if (bangIdx !== -1) {
    sheetName = str.substring(0, bangIdx);
    if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
      sheetName = sheetName.substring(1, sheetName.length - 1).replace(/''/g, "'");
    }
    str = str.substring(bangIdx + 1);
  }

  const parts = str.split(':');
  if (parts.length === 1) {
    // Single cell as range
    const addr = parseCellAddress(sheetName ? `'${sheetName}'!${parts[0]}` : parts[0]);
    if (!addr) return null;
    return {
      start: addr,
      end: { ...addr },
      sheetName: addr.sheetName || sheetName,
    };
  } else if (parts.length === 2) {
    const startAddr = parseCellAddress(parts[0]);
    const endAddr = parseCellAddress(parts[1]);

    if (!startAddr || !endAddr) return null;

    // Normalize start and end (top-left to bottom-right)
    const minRow = Math.min(startAddr.row, endAddr.row);
    const maxRow = Math.max(startAddr.row, endAddr.row);
    const minCol = Math.min(startAddr.col, endAddr.col);
    const maxCol = Math.max(startAddr.col, endAddr.col);

    const normStart: CellAddress = {
      row: minRow,
      col: minCol,
      rowAbsolute: startAddr.rowAbsolute,
      colAbsolute: startAddr.colAbsolute,
      sheetName: startAddr.sheetName || sheetName,
    };

    const normEnd: CellAddress = {
      row: maxRow,
      col: maxCol,
      rowAbsolute: endAddr.rowAbsolute,
      colAbsolute: endAddr.colAbsolute,
      sheetName: endAddr.sheetName || sheetName,
    };

    return {
      start: normStart,
      end: normEnd,
      sheetName: normStart.sheetName || sheetName,
    };
  }

  return null;
}

/**
 * Formats a CellRange into string representation e.g. "A1:B10" or "Sheet1!A1:B10"
 */
export function formatRange(range: CellRange, includeSheet: boolean = true): string {
  const startStr = formatCellAddress(range.start, false);
  const endStr = formatCellAddress(range.end, false);

  const rangePart = startStr === endStr ? startStr : `${startStr}:${endStr}`;

  const effectiveSheet = range.sheetName || range.start.sheetName;
  if (includeSheet && effectiveSheet) {
    const needsQuotes = /[\s!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(effectiveSheet);
    const escapedSheet = effectiveSheet.replace(/'/g, "''");
    const sheetPrefix = needsQuotes ? `'${escapedSheet}'!` : `${effectiveSheet}!`;
    return `${sheetPrefix}${rangePart}`;
  }

  return rangePart;
}

/**
 * Iterates through all cells in a range
 */
export function iterateRange(range: CellRange, callback: (addr: CellAddress) => void): void {
  const sheetName = range.sheetName || range.start.sheetName;
  for (let r = range.start.row; r <= range.end.row; r++) {
    for (let c = range.start.col; c <= range.end.col; c++) {
      callback({
        row: r,
        col: c,
        sheetName,
      });
    }
  }
}

/**
 * Checks if a range contains a cell address
 */
export function containsCell(range: CellRange, addr: CellAddress): boolean {
  const rangeSheet = range.sheetName || range.start.sheetName;
  if (rangeSheet && addr.sheetName && rangeSheet !== addr.sheetName) {
    return false;
  }

  return (
    addr.row >= range.start.row &&
    addr.row <= range.end.row &&
    addr.col >= range.start.col &&
    addr.col <= range.end.col
  );
}

/**
 * Gets range dimensions and cell count
 */
export function getRangeSize(range: CellRange): { rows: number; cols: number; count: number } {
  const rows = range.end.row - range.start.row + 1;
  const cols = range.end.col - range.start.col + 1;
  return {
    rows,
    cols,
    count: rows * cols,
  };
}
