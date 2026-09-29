import { CellStore } from '../cell/CellStore';
import { Cell, CellDataType } from '../cell/CellModel';
import { parseCellAddress, formatCellAddress } from '../references/AddressParser';
import { parseRange, iterateRange } from '../ranges/RangeParser';
import { SpreadsheetError } from '../errors/SpreadsheetError';

export interface WorksheetData {
  id: string;
  name: string;
  index: number;
  cells: CellStore;
  rowCount: number;
  columnCount: number;
  hidden: boolean;
  columnWidths?: Record<number, number>;
  rowHeights?: Record<number, number>;
}

export class WorksheetModel {
  public id: string;
  public name: string;
  public index: number;
  public cells: CellStore;
  public rowCount: number;
  public columnCount: number;
  public hidden: boolean;
  public columnWidths: Record<number, number>;
  public rowHeights: Record<number, number>;

  constructor(data: {
    id: string;
    name: string;
    index?: number;
    cells?: CellStore;
    rowCount?: number;
    columnCount?: number;
    hidden?: boolean;
    columnWidths?: Record<number, number>;
    rowHeights?: Record<number, number>;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.index = data.index ?? 0;
    this.cells = data.cells || new CellStore();
    this.rowCount = data.rowCount ?? 100;
    this.columnCount = data.columnCount ?? 26;
    this.hidden = data.hidden ?? false;
    this.columnWidths = data.columnWidths || {};
    this.rowHeights = data.rowHeights || {};
  }

  public getCell(address: string): Cell | undefined {
    return this.cells.get(address);
  }

  public setCell(address: string, cellData: Partial<Cell>): Cell {
    const normAddr = address.toUpperCase();
    const existing = this.cells.get(normAddr) || {
      address: normAddr,
      dataType: 'blank' as CellDataType,
    };

    const rawValue = cellData.rawValue !== undefined ? cellData.rawValue : existing.rawValue;
    let formula = cellData.formula !== undefined ? cellData.formula : existing.formula;
    let dataType: CellDataType = cellData.dataType || existing.dataType;

    if (rawValue !== undefined) {
      if (typeof rawValue === 'string' && rawValue.startsWith('=')) {
        formula = rawValue;
        dataType = 'formula';
      } else if (rawValue === '' || rawValue === undefined) {
        formula = undefined;
        dataType = 'blank';
      } else {
        if (cellData.formula === undefined) {
          formula = undefined;
        }
        if (!isNaN(Number(rawValue)) && rawValue.trim() !== '') {
          dataType = 'number';
        } else if (rawValue.toLowerCase() === 'true' || rawValue.toLowerCase() === 'false') {
          dataType = 'boolean';
        } else {
          dataType = 'string';
        }
      }
    }

    const updatedCell: Cell = {
      ...existing,
      ...cellData,
      address: normAddr,
      rawValue,
      formula,
      dataType,
    };

    this.cells.set(normAddr, updatedCell);
    return updatedCell;
  }

  public clearCell(address: string): void {
    this.cells.delete(address);
  }

  public clearRange(rangeStr: string): void {
    const range = parseRange(rangeStr);
    if (!range) return;
    iterateRange(range, (addr) => {
      const addrStr = formatCellAddress(addr, false);
      this.clearCell(addrStr);
    });
  }

  public insertRow(rowIndex: number, count: number = 1): void {
    const allCells = Array.from(this.cells.getAll().values());
    const newStore = new CellStore();

    for (const cell of allCells) {
      const parsed = parseCellAddress(cell.address);
      if (!parsed) continue;

      if (parsed.row >= rowIndex) {
        const newRow = parsed.row + count;
        const newAddr = formatCellAddress({ ...parsed, row: newRow }, false);
        newStore.set(newAddr, { ...cell, address: newAddr });
      } else {
        newStore.set(cell.address, cell);
      }
    }

    this.cells = newStore;
    this.rowCount += count;
  }

  public deleteRow(rowIndex: number, count: number = 1): void {
    const allCells = Array.from(this.cells.getAll().values());
    const newStore = new CellStore();

    for (const cell of allCells) {
      const parsed = parseCellAddress(cell.address);
      if (!parsed) continue;

      if (parsed.row >= rowIndex && parsed.row < rowIndex + count) {
        // Deleted row
        continue;
      } else if (parsed.row >= rowIndex + count) {
        const newRow = parsed.row - count;
        const newAddr = formatCellAddress({ ...parsed, row: newRow }, false);
        newStore.set(newAddr, { ...cell, address: newAddr });
      } else {
        newStore.set(cell.address, cell);
      }
    }

    this.cells = newStore;
    this.rowCount = Math.max(1, this.rowCount - count);
  }

  public insertColumn(colIndex: number, count: number = 1): void {
    const allCells = Array.from(this.cells.getAll().values());
    const newStore = new CellStore();

    for (const cell of allCells) {
      const parsed = parseCellAddress(cell.address);
      if (!parsed) continue;

      if (parsed.col >= colIndex) {
        const newCol = parsed.col + count;
        const newAddr = formatCellAddress({ ...parsed, col: newCol }, false);
        newStore.set(newAddr, { ...cell, address: newAddr });
      } else {
        newStore.set(cell.address, cell);
      }
    }

    this.cells = newStore;
    this.columnCount += count;
  }

  public deleteColumn(colIndex: number, count: number = 1): void {
    const allCells = Array.from(this.cells.getAll().values());
    const newStore = new CellStore();

    for (const cell of allCells) {
      const parsed = parseCellAddress(cell.address);
      if (!parsed) continue;

      if (parsed.col >= colIndex && parsed.col < colIndex + count) {
        // Deleted column
        continue;
      } else if (parsed.col >= colIndex + count) {
        const newCol = parsed.col - count;
        const newAddr = formatCellAddress({ ...parsed, col: newCol }, false);
        newStore.set(newAddr, { ...cell, address: newAddr });
      } else {
        newStore.set(cell.address, cell);
      }
    }

    this.cells = newStore;
    this.columnCount = Math.max(1, this.columnCount - count);
  }

  public setColumnWidth(colIndex: number, width: number): void {
    this.columnWidths[colIndex] = width;
  }

  public setRowHeight(rowIndex: number, height: number): void {
    this.rowHeights[rowIndex] = height;
  }

  public insertRows(rowIndex: number, count: number = 1): void {
    this.insertRow(rowIndex, count);
  }

  public deleteRows(rowIndex: number, count: number = 1): void {
    this.deleteRow(rowIndex, count);
  }

  public insertColumns(colIndex: number, count: number = 1): void {
    this.insertColumn(colIndex, count);
  }

  public deleteColumns(colIndex: number, count: number = 1): void {
    this.deleteColumn(colIndex, count);
  }
}
