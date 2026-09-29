export interface CellAddress {
  row: number; // 0-indexed internally (0 = Row 1, 1 = Row 2)
  col: number; // 0-indexed internally (0 = Col A, 1 = Col B)
  rowAbsolute?: boolean; // true if $1
  colAbsolute?: boolean; // true if $A
  sheetName?: string;
}

/**
 * Converts 1-based column number to column name (1 -> A, 26 -> Z, 27 -> AA)
 */
export function numberToColumn(num: number): string {
  let col = '';
  let n = num;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    col = String.fromCharCode(65 + remainder) + col;
    n = Math.floor((n - 1) / 26);
  }
  return col || 'A';
}

/**
 * Converts column letter to 1-based column number (A -> 1, Z -> 26, AA -> 27)
 */
export function columnToNumber(colStr: string): number {
  const str = colStr.toUpperCase();
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 64;
    if (code < 1 || code > 26) return 0;
    num = num * 26 + code;
  }
  return num;
}

/**
 * Parses a cell reference string like "A1", "$A$1", "Sheet1!B5", or "'Water Demand'!$C$10"
 */
export function parseCellAddress(refStr: string): CellAddress | null {
  if (!refStr || typeof refStr !== 'string') return null;

  let str = refStr.trim();
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

  // Regex matching $?([A-Z]+)$?([0-9]+)
  const match = str.match(/^(\$?)([A-Za-z]+)(\$?)([0-9]+)$/);
  if (!match) return null;

  const colAbs = match[1] === '$';
  const colName = match[2].toUpperCase();
  const rowAbs = match[3] === '$';
  const rowNum = parseInt(match[4], 10);

  if (rowNum <= 0) return null;

  const col1Based = columnToNumber(colName);
  if (col1Based <= 0) return null;

  return {
    row: rowNum - 1, // convert 1-indexed to 0-indexed
    col: col1Based - 1, // convert 1-indexed to 0-indexed
    rowAbsolute: rowAbs,
    colAbsolute: colAbs,
    sheetName,
  };
}

/**
 * Formats CellAddress into string representation
 */
export function formatCellAddress(addr: CellAddress, includeSheet: boolean = true): string {
  const colLetter = numberToColumn(addr.col + 1);
  const colPrefix = addr.colAbsolute ? '$' : '';
  const rowPrefix = addr.rowAbsolute ? '$' : '';
  const rowNum = addr.row + 1;

  const cellRef = `${colPrefix}${colLetter}${rowPrefix}${rowNum}`;

  if (includeSheet && addr.sheetName) {
    const needsQuotes = /[\s!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/.test(addr.sheetName);
    const escapedSheet = addr.sheetName.replace(/'/g, "''");
    const sheetPrefix = needsQuotes ? `'${escapedSheet}'!` : `${addr.sheetName}!`;
    return `${sheetPrefix}${cellRef}`;
  }

  return cellRef;
}

/**
 * Compares two CellAddresses for equality
 */
export function areAddressesEqual(a: CellAddress, b: CellAddress): boolean {
  return (
    a.row === b.row &&
    a.col === b.col &&
    (a.sheetName || '') === (b.sheetName || '')
  );
}
