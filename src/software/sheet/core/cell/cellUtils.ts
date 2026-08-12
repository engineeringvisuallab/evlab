import { CellPosition, CellRange } from '../../types';

/**
 * Converts zero-based column index to Excel-style column label (0 -> A, 25 -> Z, 26 -> AA)
 */
export function colIndexToLabel(colIndex: number): string {
  let temp = colIndex + 1;
  let label = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    temp = Math.floor((temp - 1) / 26);
  }
  return label || 'A';
}

/**
 * Converts Excel-style column label to zero-based column index (A -> 0, Z -> 25, AA -> 26)
 */
export function colLabelToIndex(colLabel: string): number {
  const clean = colLabel.toUpperCase().replace(/[^A-Z]/g, '');
  let index = 0;
  for (let i = 0; i < clean.length; i++) {
    index = index * 26 + (clean.charCodeAt(i) - 64);
  }
  return Math.max(0, index - 1);
}

/**
 * Converts cell position to ID string (e.g., {row: 0, col: 0} -> "A1")
 */
export function positionToCellId(pos: CellPosition): string {
  return `${colIndexToLabel(pos.col)}${pos.row + 1}`;
}

/**
 * Parses cell ID string into CellPosition (e.g., "A1" -> {row: 0, col: 0}, "Sheet1!B5" -> {row: 4, col: 1})
 */
export function cellIdToPosition(cellId: string): { sheetName?: string; pos: CellPosition } | null {
  if (!cellId) return null;
  const cleanId = cellId.trim();

  let sheetName: string | undefined;
  let refPart = cleanId;

  if (cleanId.includes('!')) {
    const parts = cleanId.split('!');
    sheetName = parts[0].replace(/^'|'$/g, ''); // strip single quotes if any
    refPart = parts[1];
  }

  // Remove $ for absolute references
  const match = refPart.replace(/\$/g, '').match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;

  const colLabel = match[1];
  const rowNum = parseInt(match[2], 10);

  return {
    sheetName,
    pos: {
      row: Math.max(0, rowNum - 1),
      col: colLabelToIndex(colLabel),
    },
  };
}

/**
 * Parses range string (e.g., "A1:B10" or "Sheet2!A1:B10" or "A1")
 */
export function parseRangeString(rangeStr: string): { sheetName?: string; range: CellRange } | null {
  if (!rangeStr) return null;
  const trimmed = rangeStr.trim();

  let sheetName: string | undefined;
  let rangePart = trimmed;

  if (trimmed.includes('!')) {
    const parts = trimmed.split('!');
    sheetName = parts[0].replace(/^'|'$/g, '');
    rangePart = parts[1];
  }

  const rangeSplit = rangePart.split(':');
  if (rangeSplit.length === 1) {
    const parsed = cellIdToPosition(rangeSplit[0]);
    if (!parsed) return null;
    return {
      sheetName,
      range: { start: parsed.pos, end: parsed.pos },
    };
  } else if (rangeSplit.length === 2) {
    const parsedStart = cellIdToPosition(rangeSplit[0]);
    const parsedEnd = cellIdToPosition(rangeSplit[1]);
    if (!parsedStart || !parsedEnd) return null;

    const normalized = normalizeRange({
      start: parsedStart.pos,
      end: parsedEnd.pos,
    });

    return {
      sheetName,
      range: normalized,
    };
  }

  return null;
}

/**
 * Formats a CellRange back into string (e.g. "A1:B10" or "A1" if start == end)
 */
export function rangeToString(range: CellRange, sheetName?: string): string {
  const normalized = normalizeRange(range);
  const startId = positionToCellId(normalized.start);
  const endId = positionToCellId(normalized.end);

  const rangePart = startId === endId ? startId : `${startId}:${endId}`;
  if (sheetName) {
    const needsQuotes = /[\s!]/.test(sheetName);
    const formattedSheet = needsQuotes ? `'${sheetName}'` : sheetName;
    return `${formattedSheet}!${rangePart}`;
  }
  return rangePart;
}

/**
 * Normalizes a range so start is top-left and end is bottom-right
 */
export function normalizeRange(range: CellRange): CellRange {
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);

  return {
    start: { row: minRow, col: minCol },
    end: { row: maxRow, col: maxCol },
  };
}

/**
 * Checks if a position is inside a range
 */
export function isPositionInRange(pos: CellPosition, range: CellRange): boolean {
  const norm = normalizeRange(range);
  return (
    pos.row >= norm.start.row &&
    pos.row <= norm.end.row &&
    pos.col >= norm.start.col &&
    pos.col <= norm.end.col
  );
}
