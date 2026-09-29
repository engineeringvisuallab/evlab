import { WorkbookModel } from '../workbook/WorkbookModel';
import { CalculationEngine } from '../calculation/CalculationEngine';
import { Cell, CellStyle } from '../cell/CellModel';
import { shiftFormulaReferences } from '../formula/FormulaTransform';
import { parseCellAddress, formatCellAddress, numberToColumn } from '../references/AddressParser';

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export class SetCellValueCommand implements Command {
  private workbook: WorkbookModel;
  private calculationEngine: CalculationEngine;
  private sheetId: string;
  private address: string;
  private newValue: string;
  private oldCellState: Cell | undefined;
  public description: string;

  constructor(
    workbook: WorkbookModel,
    calculationEngine: CalculationEngine,
    sheetId: string,
    address: string,
    newValue: string
  ) {
    this.workbook = workbook;
    this.calculationEngine = calculationEngine;
    this.sheetId = sheetId;
    this.address = address.toUpperCase();
    this.newValue = newValue;
    this.description = `Set ${address} = ${newValue}`;

    const sheet = workbook.getSheet(sheetId);
    if (sheet) {
      const existing = sheet.getCell(this.address);
      this.oldCellState = existing ? { ...existing } : undefined;
    }
  }

  public execute(): void {
    this.calculationEngine.setCellContent(this.sheetId, this.address, this.newValue);
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    if (this.oldCellState) {
      this.calculationEngine.setCellContent(this.sheetId, this.address, this.oldCellState.rawValue || '');
    } else {
      sheet.clearCell(this.address);
      this.calculationEngine.recalculateWorkbook();
    }
  }
}

export class FormatCellCommand implements Command {
  private workbook: WorkbookModel;
  private sheetId: string;
  private addresses: string[];
  private styleDelta: Partial<CellStyle>;
  private oldStyles: Map<string, CellStyle | undefined> = new Map();
  public description: string;

  constructor(
    workbook: WorkbookModel,
    sheetId: string,
    addresses: string[],
    styleDelta: Partial<CellStyle>
  ) {
    this.workbook = workbook;
    this.sheetId = sheetId;
    this.addresses = addresses.map((a) => a.toUpperCase());
    this.styleDelta = styleDelta;
    this.description = `Format ${addresses.length} cells`;

    const sheet = workbook.getSheet(sheetId);
    if (sheet) {
      for (const addr of this.addresses) {
        const cell = sheet.getCell(addr);
        this.oldStyles.set(addr, cell?.style ? { ...cell.style } : undefined);
      }
    }
  }

  public execute(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const addr of this.addresses) {
      const existing = sheet.getCell(addr);
      sheet.setCell(addr, {
        style: {
          ...existing?.style,
          ...this.styleDelta,
        },
      });
    }
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const addr of this.addresses) {
      const oldStyle = this.oldStyles.get(addr);
      sheet.setCell(addr, { style: oldStyle });
    }
  }
}

export class DeleteCellsCommand implements Command {
  private workbook: WorkbookModel;
  private calculationEngine: CalculationEngine;
  private sheetId: string;
  private addresses: string[];
  private oldCells: Map<string, Cell | undefined> = new Map();
  public description: string;

  constructor(
    workbook: WorkbookModel,
    calculationEngine: CalculationEngine,
    sheetId: string,
    addresses: string[]
  ) {
    this.workbook = workbook;
    this.calculationEngine = calculationEngine;
    this.sheetId = sheetId;
    this.addresses = addresses.map((a) => a.toUpperCase());
    this.description = `Delete ${addresses.length} cells`;

    const sheet = workbook.getSheet(sheetId);
    if (sheet) {
      for (const addr of this.addresses) {
        const cell = sheet.getCell(addr);
        this.oldCells.set(addr, cell ? { ...cell } : undefined);
      }
    }
  }

  public execute(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const addr of this.addresses) {
      sheet.clearCell(addr);
    }
    this.calculationEngine.recalculateWorkbook();
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const addr of this.addresses) {
      const oldCell = this.oldCells.get(addr);
      if (oldCell) {
        this.calculationEngine.setCellContent(this.sheetId, addr, oldCell.rawValue || '');
        if (oldCell.style) {
          sheet.setCell(addr, { style: oldCell.style });
        }
      }
    }
  }
}

export interface ClipCellData {
  rowOffset: number;
  colOffset: number;
  rawValue?: string;
  style?: CellStyle;
}

export class PasteCellsCommand implements Command {
  private workbook: WorkbookModel;
  private calculationEngine: CalculationEngine;
  private sheetId: string;
  private targetStartRow: number;
  private targetStartCol: number;
  private clipData: ClipCellData[];
  private pasteType: 'all' | 'values' | 'formulas' | 'formats';
  private oldCells: Map<string, Cell | undefined> = new Map();
  public description: string;

  constructor(
    workbook: WorkbookModel,
    calculationEngine: CalculationEngine,
    sheetId: string,
    targetStartRow: number,
    targetStartCol: number,
    clipData: ClipCellData[],
    pasteType: 'all' | 'values' | 'formulas' | 'formats' = 'all'
  ) {
    this.workbook = workbook;
    this.calculationEngine = calculationEngine;
    this.sheetId = sheetId;
    this.targetStartRow = targetStartRow;
    this.targetStartCol = targetStartCol;
    this.clipData = clipData;
    this.pasteType = pasteType;
    this.description = `Paste ${clipData.length} cells (${pasteType})`;

    const sheet = workbook.getSheet(sheetId);
    if (sheet) {
      for (const item of clipData) {
        const r = targetStartRow + item.rowOffset;
        const c = targetStartCol + item.colOffset;
        const addr = `${numberToColumn(c + 1)}${r + 1}`;
        const existing = sheet.getCell(addr);
        this.oldCells.set(addr, existing ? { ...existing } : undefined);
      }
    }
  }

  public execute(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const item of this.clipData) {
      const r = this.targetStartRow + item.rowOffset;
      const c = this.targetStartCol + item.colOffset;
      const addr = `${numberToColumn(c + 1)}${r + 1}`;

      if (this.pasteType === 'formats') {
        if (item.style) {
          sheet.setCell(addr, { style: { ...item.style } });
        }
        continue;
      }

      let rawVal = item.rawValue || '';

      if (this.pasteType === 'values') {
        // Evaluate formula if rawVal starts with =
        if (rawVal.startsWith('=')) {
          const evalCell = sheet.getCell(addr);
          rawVal = evalCell?.value !== undefined ? String(evalCell.value) : rawVal;
        }
      } else if (this.pasteType === 'all' || this.pasteType === 'formulas') {
        // Shift formula references
        if (rawVal.startsWith('=')) {
          rawVal = shiftFormulaReferences(rawVal, item.rowOffset, item.colOffset);
        }
      }

      this.calculationEngine.setCellContent(this.sheetId, addr, rawVal);

      if (this.pasteType === 'all' && item.style) {
        sheet.setCell(addr, { style: { ...item.style } });
      }
    }
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    for (const item of this.clipData) {
      const r = this.targetStartRow + item.rowOffset;
      const c = this.targetStartCol + item.colOffset;
      const addr = `${numberToColumn(c + 1)}${r + 1}`;
      const oldCell = this.oldCells.get(addr);

      if (oldCell) {
        this.calculationEngine.setCellContent(this.sheetId, addr, oldCell.rawValue || '');
        sheet.setCell(addr, { style: oldCell.style });
      } else {
        sheet.clearCell(addr);
      }
    }
    this.calculationEngine.recalculateWorkbook();
  }
}

export class InsertRowColumnCommand implements Command {
  private workbook: WorkbookModel;
  private calculationEngine: CalculationEngine;
  private sheetId: string;
  private type: 'row' | 'column';
  private index: number;
  private count: number;
  public description: string;

  constructor(
    workbook: WorkbookModel,
    calculationEngine: CalculationEngine,
    sheetId: string,
    type: 'row' | 'column',
    index: number,
    count: number = 1
  ) {
    this.workbook = workbook;
    this.calculationEngine = calculationEngine;
    this.sheetId = sheetId;
    this.type = type;
    this.index = index;
    this.count = count;
    this.description = `Insert ${count} ${type}(s) at ${index}`;
  }

  public execute(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    if (this.type === 'row') {
      sheet.insertRows(this.index, this.count);
    } else {
      sheet.insertColumns(this.index, this.count);
    }
    this.calculationEngine.recalculateWorkbook();
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    if (this.type === 'row') {
      sheet.deleteRows(this.index, this.count);
    } else {
      sheet.deleteColumns(this.index, this.count);
    }
    this.calculationEngine.recalculateWorkbook();
  }
}

export class DeleteRowColumnCommand implements Command {
  private workbook: WorkbookModel;
  private calculationEngine: CalculationEngine;
  private sheetId: string;
  private type: 'row' | 'column';
  private index: number;
  private count: number;
  public description: string;

  constructor(
    workbook: WorkbookModel,
    calculationEngine: CalculationEngine,
    sheetId: string,
    type: 'row' | 'column',
    index: number,
    count: number = 1
  ) {
    this.workbook = workbook;
    this.calculationEngine = calculationEngine;
    this.sheetId = sheetId;
    this.type = type;
    this.index = index;
    this.count = count;
    this.description = `Delete ${count} ${type}(s) at ${index}`;
  }

  public execute(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    if (this.type === 'row') {
      sheet.deleteRows(this.index, this.count);
    } else {
      sheet.deleteColumns(this.index, this.count);
    }
    this.calculationEngine.recalculateWorkbook();
  }

  public undo(): void {
    const sheet = this.workbook.getSheet(this.sheetId);
    if (!sheet) return;

    if (this.type === 'row') {
      sheet.insertRows(this.index, this.count);
    } else {
      sheet.insertColumns(this.index, this.count);
    }
    this.calculationEngine.recalculateWorkbook();
  }
}

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private maxHistory: number = 100;

  public executeCommand(command: Command): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
  }

  public undo(): boolean {
    const command = this.undoStack.pop();
    if (!command) return false;

    command.undo();
    this.redoStack.push(command);
    return true;
  }

  public redo(): boolean {
    const command = this.redoStack.pop();
    if (!command) return false;

    command.execute();
    this.undoStack.push(command);
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
