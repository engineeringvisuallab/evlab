import { parseCellAddress, formatCellAddress } from '../references/AddressParser';
import { parseRange, formatRange } from '../ranges/RangeParser';

/**
 * Shifts formula cell and range references by rowOffset and colOffset
 */
export function shiftFormulaReferences(
  formula: string,
  rowOffset: number,
  colOffset: number
): string {
  if (!formula || !formula.startsWith('=')) return formula;

  // Regex to match Cell references and Range references
  // Matches: optional sheet name + cell/range
  const regex = /((?:'[^']+'|[A-Za-z0-9_]+)!)?(\$?[A-Za-z]+\$?[0-9]+)(?::(\$?[A-Za-z]+\$?[0-9]+))?/g;

  return formula.replace(regex, (fullMatch, sheetPart, startCell, endCell) => {
    // If endCell exists, it's a range
    if (endCell) {
      const fullStart = (sheetPart || '') + startCell;
      const fullEnd = (sheetPart || '') + endCell;

      const parsedStart = parseCellAddress(fullStart);
      const parsedEnd = parseCellAddress(fullEnd);

      if (!parsedStart || !parsedEnd) return fullMatch;

      const newStartRow = parsedStart.rowAbsolute ? parsedStart.row : Math.max(0, parsedStart.row + rowOffset);
      const newStartCol = parsedStart.colAbsolute ? parsedStart.col : Math.max(0, parsedStart.col + colOffset);

      const newEndRow = parsedEnd.rowAbsolute ? parsedEnd.row : Math.max(0, parsedEnd.row + rowOffset);
      const newEndCol = parsedEnd.colAbsolute ? parsedEnd.col : Math.max(0, parsedEnd.col + colOffset);

      const newRange = {
        start: { ...parsedStart, row: newStartRow, col: newStartCol },
        end: { ...parsedEnd, row: newEndRow, col: newEndCol },
        sheetName: parsedStart.sheetName,
      };

      return formatRange(newRange, true);
    } else {
      // Single cell reference
      const fullAddr = (sheetPart || '') + startCell;
      const parsed = parseCellAddress(fullAddr);

      if (!parsed) return fullMatch;

      const newRow = parsed.rowAbsolute ? parsed.row : Math.max(0, parsed.row + rowOffset);
      const newCol = parsed.colAbsolute ? parsed.col : Math.max(0, parsed.col + colOffset);

      return formatCellAddress(
        {
          ...parsed,
          row: newRow,
          col: newCol,
        },
        true
      );
    }
  });
}

/**
 * Updates formula references when rows or columns are inserted or deleted
 */
export function adjustFormulaForStructuralChanges(
  formula: string,
  type: 'insertRow' | 'deleteRow' | 'insertCol' | 'deleteCol',
  index: number,
  count: number = 1
): string {
  if (!formula || !formula.startsWith('=')) return formula;

  const regex = /((?:'[^']+'|[A-Za-z0-9_]+)!)?(\$?[A-Za-z]+\$?[0-9]+)(?::(\$?[A-Za-z]+\$?[0-9]+))?/g;

  return formula.replace(regex, (fullMatch, sheetPart, startCell, endCell) => {
    if (endCell) {
      const parsedStart = parseCellAddress((sheetPart || '') + startCell);
      const parsedEnd = parseCellAddress((sheetPart || '') + endCell);

      if (!parsedStart || !parsedEnd) return fullMatch;

      const adjustRow = (r: number) => {
        if (type === 'insertRow' && r >= index) return r + count;
        if (type === 'deleteRow') {
          if (r >= index && r < index + count) return -1; // Invalidated
          if (r >= index + count) return r - count;
        }
        return r;
      };

      const adjustCol = (c: number) => {
        if (type === 'insertCol' && c >= index) return c + count;
        if (type === 'deleteCol') {
          if (c >= index && c < index + count) return -1; // Invalidated
          if (c >= index + count) return c - count;
        }
        return c;
      };

      const newStartRow = adjustRow(parsedStart.row);
      const newStartCol = adjustCol(parsedStart.col);
      const newEndRow = adjustRow(parsedEnd.row);
      const newEndCol = adjustCol(parsedEnd.col);

      if (newStartRow === -1 || newStartCol === -1 || newEndRow === -1 || newEndCol === -1) {
        return '#REF!';
      }

      const newRange = {
        start: { ...parsedStart, row: newStartRow, col: newStartCol },
        end: { ...parsedEnd, row: newEndRow, col: newEndCol },
        sheetName: parsedStart.sheetName,
      };

      return formatRange(newRange, true);
    } else {
      const parsed = parseCellAddress((sheetPart || '') + startCell);
      if (!parsed) return fullMatch;

      let newRow = parsed.row;
      let newCol = parsed.col;

      if (type === 'insertRow' && parsed.row >= index) newRow += count;
      if (type === 'deleteRow') {
        if (parsed.row >= index && parsed.row < index + count) return '#REF!';
        if (parsed.row >= index + count) newRow -= count;
      }

      if (type === 'insertCol' && parsed.col >= index) newCol += count;
      if (type === 'deleteCol') {
        if (parsed.col >= index && parsed.col < index + count) return '#REF!';
        if (parsed.col >= index + count) newCol -= count;
      }

      return formatCellAddress({ ...parsed, row: newRow, col: newCol }, true);
    }
  });
}
