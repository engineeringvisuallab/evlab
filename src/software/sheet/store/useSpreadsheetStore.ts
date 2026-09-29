import { create } from 'zustand';
import {
  CellData,
  CellPosition,
  CellRange,
  CellStyle,
  SelectionStats,
  SheetData,
  ThemeMode,
  WorkbookData,
} from '../types';
import {
  cellIdToPosition,
  colIndexToLabel,
  isPositionInRange,
  normalizeRange,
  parseRangeString,
  positionToCellId,
  rangeToString,
} from '../core/cell/cellUtils';
import { WorkbookModel } from '../core/workbook/WorkbookModel';
import { WorksheetModel } from '../core/worksheet/WorksheetModel';
import { CalculationEngine } from '../core/calculation/CalculationEngine';
import {
  CommandManager,
  SetCellValueCommand,
  FormatCellCommand,
  DeleteCellsCommand,
  PasteCellsCommand,
  InsertRowColumnCommand,
  DeleteRowColumnCommand,
  ClipCellData,
} from '../core/history/CommandManager';
import { parseCellAddress, formatCellAddress, numberToColumn } from '../core/references/AddressParser';
import { shiftFormulaReferences } from '../core/formula/FormulaTransform';

interface ClipboardState {
  data: ClipCellData[];
  isCut: boolean;
  sourceSheetId: string;
  sourceRange: CellRange;
}

interface SpreadsheetState {
  theme: ThemeMode;
  workbookData: WorkbookData;
  activeCell: CellPosition;
  selectionRange: CellRange;
  isEditing: boolean;
  editValue: string;
  formulaBarValue: string;
  sidebarOpen: boolean;
  sidePanelTab: 'explorer' | 'functions' | 'format' | 'templates';
  zoom: number;
  statusMessage: string;
  clipboard: ClipboardState | null;

  // Engine Instances
  workbookModel: WorkbookModel;
  calculationEngine: CalculationEngine;
  commandManager: CommandManager;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setActiveSheet: (sheetId: string) => void;
  addSheet: (name?: string) => void;
  renameSheet: (sheetId: string, newName: string) => void;
  deleteSheet: (sheetId: string) => void;
  duplicateSheet: (sheetId: string) => void;

  setActiveCell: (pos: CellPosition, expandSelection?: boolean) => void;
  setSelectionRange: (range: CellRange) => void;
  selectRangeByString: (rangeStr: string) => boolean;

  startEditing: (initialValue?: string) => void;
  setEditValue: (val: string) => void;
  setFormulaBarValue: (val: string) => void;
  commitEditing: (val?: string) => void;
  cancelEditing: () => void;

  updateCellValue: (sheetId: string, cellId: string, rawInput: string) => void;
  updateCellStyle: (styleDelta: Partial<CellStyle>) => void;
  setColumnWidth: (sheetId: string, colIndex: number, width: number) => void;
  setRowHeight: (sheetId: string, rowIndex: number, height: number) => void;

  // Phase 3 Features: Clipboard, Auto-fill, Row/Col insert
  copy: () => void;
  cut: () => void;
  paste: (pasteType?: 'all' | 'values' | 'formulas' | 'formats') => void;
  autoFill: (targetRange: CellRange) => void;
  deleteSelection: () => void;
  insertRow: (rowIndex?: number) => void;
  deleteRow: (rowIndex?: number) => void;
  insertColumn: (colIndex?: number) => void;
  deleteColumn: (colIndex?: number) => void;

  toggleSidebar: () => void;
  setSidePanelTab: (tab: 'explorer' | 'functions' | 'format' | 'templates') => void;
  setZoom: (zoom: number) => void;
  setStatusMessage: (msg: string) => void;

  getSelectionStats: () => SelectionStats;
  getFormattedCellValue: (cellData?: CellData) => string;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  loadEngineeringTemplate: (templateType: 'hydraulic' | 'boq' | 'beam') => void;
}

// Initial Sample Workbook Builder
function buildInitialWorkbookEngine(): { model: WorkbookModel; engine: CalculationEngine } {
  const model = new WorkbookModel({ name: 'Engineering Calculation Workbook' });
  const sheet1 = model.getSheet('Sheet1') || model.addSheet('Hydraulic Calc');
  sheet1.name = 'Hydraulic Calc';

  const engine = new CalculationEngine(model);

  // Hydraulic Sample Data
  engine.setCellContent('Hydraulic Calc', 'A1', 'PIPE HYDRAULICS ANALYSIS - EVLab Engineering Engine');
  sheet1.setCell('A1', {
    style: { bold: true, fontSize: 13, textColor: '#06b6d4', backgroundColor: '#131e3a', alignHorizontal: 'left' },
  });

  const headers = [
    { cell: 'A3', val: 'Pipe Segment ID' },
    { cell: 'B3', val: 'Flow Rate (L/s)' },
    { cell: 'C3', val: 'Diameter (mm)' },
    { cell: 'D3', val: 'Area (m²)' },
    { cell: 'E3', val: 'Velocity (m/s)' },
    { cell: 'F3', val: 'Reynolds No.' },
  ];

  headers.forEach((h) => {
    engine.setCellContent('Hydraulic Calc', h.cell, h.val);
    sheet1.setCell(h.cell, {
      style: { bold: true, backgroundColor: '#1e293b', textColor: '#cbd5e1', alignHorizontal: h.cell === 'A3' ? 'left' : 'right' },
    });
  });

  const pipeData = [
    { id: 'P-101', q: '45', d: '300' },
    { id: 'P-102', q: '62.5', d: '350' },
    { id: 'P-103', q: '88', d: '400' },
    { id: 'P-104', q: '110', d: '450' },
    { id: 'P-105', q: '150', d: '500' },
  ];

  pipeData.forEach((row, idx) => {
    const r = idx + 4;
    engine.setCellContent('Hydraulic Calc', `A${r}`, row.id);
    engine.setCellContent('Hydraulic Calc', `B${r}`, row.q);
    engine.setCellContent('Hydraulic Calc', `C${r}`, row.d);
    engine.setCellContent('Hydraulic Calc', `D${r}`, `=PIPE_AREA(C${r})`);
    engine.setCellContent('Hydraulic Calc', `E${r}`, `=PIPE_VELOCITY(B${r}, C${r})`);
    engine.setCellContent('Hydraulic Calc', `F${r}`, `=REYNOLDS(E${r}, C${r})`);

    ['B', 'C', 'D', 'E', 'F'].forEach((col) => {
      sheet1.setCell(`${col}${r}`, { style: { alignHorizontal: 'right' } });
    });
  });

  engine.setCellContent('Hydraulic Calc', 'A10', 'TOTAL / AVERAGE');
  sheet1.setCell('A10', { style: { bold: true, backgroundColor: '#1e293b' } });

  engine.setCellContent('Hydraulic Calc', 'B10', '=SUM(B4:B8)');
  engine.setCellContent('Hydraulic Calc', 'C10', '=AVERAGE(C4:C8)');
  engine.setCellContent('Hydraulic Calc', 'D10', '=SUM(D4:D8)');
  engine.setCellContent('Hydraulic Calc', 'E10', '=AVERAGE(E4:E8)');

  ['B10', 'C10', 'D10', 'E10'].forEach((addr) => {
    sheet1.setCell(addr, { style: { bold: true, alignHorizontal: 'right', backgroundColor: '#1e293b' } });
  });

  // Sheet 2: Structural BOQ
  const sheet2 = model.addSheet('Structural BOQ');
  engine.setCellContent('Structural BOQ', 'A1', 'STRUCTURAL BEAM BILL OF QUANTITIES');
  sheet2.setCell('A1', { style: { bold: true, fontSize: 13, textColor: '#38bdf8' } });

  return { model, engine };
}

// Convert WorkbookModel to UI WorkbookData representation
function modelToData(model: WorkbookModel): WorkbookData {
  return {
    id: model.id,
    name: model.name,
    activeSheetId: model.activeSheetId,
    createdTime: model.metadata.created,
    updatedTime: model.metadata.modified,
    sheets: model.sheets.map((sheet) => {
      const cellsObj: Record<string, CellData> = {};
      sheet.cells.getAll().forEach((cell, addr) => {
        let val: string | number | boolean | null = null;
        if (typeof cell.value === 'string' || typeof cell.value === 'number' || typeof cell.value === 'boolean') {
          val = cell.value;
        } else if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value);
        }

        let dt: 'string' | 'number' | 'boolean' | 'date' | 'error' | 'blank' = 'blank';
        if (cell.dataType === 'number') dt = 'number';
        else if (cell.dataType === 'boolean') dt = 'boolean';
        else if (cell.dataType === 'date') dt = 'date';
        else if (cell.dataType === 'error') dt = 'error';
        else if (cell.dataType === 'string' || cell.dataType === 'formula') dt = 'string';

        cellsObj[addr] = {
          id: addr,
          value: val,
          formula: cell.formula,
          dataType: dt,
          style: cell.style as CellStyle | undefined,
          comment: cell.comment,
          hyperlink: cell.hyperlink,
        };
      });

      return {
        id: sheet.id,
        name: sheet.name,
        cells: cellsObj,
        columnWidths: sheet.columnWidths,
        rowHeights: sheet.rowHeights,
      };
    }),
  };
}

const { model: initialModel, engine: initialEngine } = buildInitialWorkbookEngine();
const initialCommandManager = new CommandManager();

export const useSpreadsheetStore = create<SpreadsheetState>((set, get) => ({
  theme: 'dark',
  workbookModel: initialModel,
  calculationEngine: initialEngine,
  commandManager: initialCommandManager,
  workbookData: modelToData(initialModel),
  activeCell: { row: 3, col: 0 },
  selectionRange: { start: { row: 3, col: 0 }, end: { row: 3, col: 0 } },
  isEditing: false,
  editValue: '',
  formulaBarValue: 'P-101',
  sidebarOpen: false,
  sidePanelTab: 'explorer',
  zoom: 100,
  statusMessage: 'Ready',
  clipboard: null,

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  setActiveSheet: (sheetId) => {
    const { workbookModel } = get();
    workbookModel.activeSheetId = sheetId;
    set({
      workbookData: modelToData(workbookModel),
      activeCell: { row: 0, col: 0 },
      selectionRange: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
      isEditing: false,
      formulaBarValue: '',
    });
  },

  addSheet: (customName) => {
    const { workbookModel, calculationEngine } = get();
    const count = workbookModel.sheets.length + 1;
    const name = customName || `Sheet${count}`;
    const newSheet = workbookModel.addSheet(name);
    calculationEngine.setWorkbook(workbookModel);

    set({
      workbookData: modelToData(workbookModel),
      activeCell: { row: 0, col: 0 },
      selectionRange: { start: { row: 0, col: 0 }, end: { row: 0, col: 0 } },
      statusMessage: `Sheet '${newSheet.name}' created`,
    });
  },

  renameSheet: (sheetId, newName) => {
    const { workbookModel } = get();
    const sheet = workbookModel.getSheet(sheetId);
    if (sheet && newName.trim()) {
      sheet.name = newName.trim();
      set({
        workbookData: modelToData(workbookModel),
        statusMessage: `Sheet renamed to '${newName.trim()}'`,
      });
    }
  },

  deleteSheet: (sheetId) => {
    const { workbookModel } = get();
    if (workbookModel.sheets.length <= 1) return;
    workbookModel.deleteSheet(sheetId);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: 'Sheet deleted',
    });
  },

  duplicateSheet: (sheetId) => {
    const { workbookModel, calculationEngine } = get();
    const target = workbookModel.getSheet(sheetId);
    if (!target) return;

    const dup = workbookModel.addSheet(`${target.name} (Copy)`);
    target.cells.getAll().forEach((cell, addr) => {
      dup.setCell(addr, { ...cell });
    });
    calculationEngine.recalculateWorkbook();

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Duplicated '${target.name}'`,
    });
  },

  setActiveCell: (pos, expandSelection = false) => {
    const { workbookModel, activeCell, selectionRange } = get();
    const activeSheet = workbookModel.getActiveSheet();
    const cellAddr = `${numberToColumn(pos.col + 1)}${pos.row + 1}`;
    const cell = activeSheet.getCell(cellAddr);
    const formulaBarText = cell ? cell.rawValue || String(cell.value ?? '') : '';

    const newRange: CellRange = expandSelection
      ? { start: selectionRange.start, end: pos }
      : { start: pos, end: pos };

    set({
      activeCell: pos,
      selectionRange: newRange,
      isEditing: false,
      formulaBarValue: formulaBarText,
      statusMessage: `Cell ${cellAddr} selected`,
    });
  },

  setSelectionRange: (range) => {
    const rangeStr = rangeToString(range);
    set({
      selectionRange: range,
      statusMessage: `Range ${rangeStr} selected`,
    });
  },

  selectRangeByString: (rangeStr) => {
    const parsed = parseRangeString(rangeStr);
    if (!parsed) return false;

    const { workbookModel } = get();
    if (parsed.sheetName) {
      const foundSheet = workbookModel.getSheet(parsed.sheetName);
      if (foundSheet) {
        workbookModel.activeSheetId = foundSheet.id;
      }
    }

    set({
      workbookData: modelToData(workbookModel),
      activeCell: parsed.range.start,
      selectionRange: parsed.range,
      statusMessage: `Jumped to ${rangeStr.toUpperCase()}`,
    });
    return true;
  },

  startEditing: (initialValue) => {
    const { workbookModel, activeCell } = get();
    const activeSheet = workbookModel.getActiveSheet();
    const cellAddr = `${numberToColumn(activeCell.col + 1)}${activeCell.row + 1}`;
    const cell = activeSheet.getCell(cellAddr);
    const val = initialValue !== undefined ? initialValue : cell ? cell.rawValue || String(cell.value ?? '') : '';

    set({
      isEditing: true,
      editValue: val,
      formulaBarValue: val,
      statusMessage: `Editing ${cellAddr}`,
    });
  },

  setEditValue: (val) => set({ editValue: val, formulaBarValue: val }),
  setFormulaBarValue: (val) => set({ formulaBarValue: val, editValue: val }),

  commitEditing: (val) => {
    const { workbookModel, activeCell, editValue, updateCellValue } = get();
    const valueToCommit = val !== undefined ? val : editValue;
    const cellAddr = `${numberToColumn(activeCell.col + 1)}${activeCell.row + 1}`;

    updateCellValue(workbookModel.activeSheetId, cellAddr, valueToCommit);
    set({ isEditing: false, statusMessage: `Updated ${cellAddr}` });
  },

  cancelEditing: () => {
    const { workbookModel, activeCell } = get();
    const activeSheet = workbookModel.getActiveSheet();
    const cellAddr = `${numberToColumn(activeCell.col + 1)}${activeCell.row + 1}`;
    const cell = activeSheet.getCell(cellAddr);
    const val = cell ? cell.rawValue || String(cell.value ?? '') : '';

    set({ isEditing: false, formulaBarValue: val, editValue: '', statusMessage: 'Ready' });
  },

  updateCellValue: (sheetId, cellId, rawInput) => {
    const { workbookModel, calculationEngine, commandManager } = get();
    const cmd = new SetCellValueCommand(workbookModel, calculationEngine, sheetId, cellId, String(rawInput ?? ''));
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
    });
  },

  updateCellStyle: (styleDelta) => {
    const { workbookModel, selectionRange, commandManager } = get();
    const activeSheet = workbookModel.getActiveSheet();
    const norm = normalizeRange(selectionRange);
    const addresses: string[] = [];

    for (let r = norm.start.row; r <= norm.end.row; r++) {
      for (let c = norm.start.col; c <= norm.end.col; c++) {
        addresses.push(`${numberToColumn(c + 1)}${r + 1}`);
      }
    }

    const cmd = new FormatCellCommand(workbookModel, activeSheet.id, addresses, styleDelta);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
    });
  },

  setColumnWidth: (sheetId, colIndex, width) => {
    const { workbookModel } = get();
    const sheet = workbookModel.getSheet(sheetId);
    if (sheet) {
      sheet.setColumnWidth(colIndex, width);
      set({ workbookData: modelToData(workbookModel) });
    }
  },

  setRowHeight: (sheetId, rowIndex, height) => {
    const { workbookModel } = get();
    const sheet = workbookModel.getSheet(sheetId);
    if (sheet) {
      sheet.setRowHeight(rowIndex, height);
      set({ workbookData: modelToData(workbookModel) });
    }
  },

  // Clipboard & Selection Operations
  copy: () => {
    const { workbookModel, selectionRange } = get();
    const sheet = workbookModel.getActiveSheet();
    const norm = normalizeRange(selectionRange);

    const clipData: ClipCellData[] = [];
    const tsvRows: string[][] = [];

    for (let r = norm.start.row; r <= norm.end.row; r++) {
      const rowArr: string[] = [];
      for (let c = norm.start.col; c <= norm.end.col; c++) {
        const addr = `${numberToColumn(c + 1)}${r + 1}`;
        const cell = sheet.getCell(addr);

        clipData.push({
          rowOffset: r - norm.start.row,
          colOffset: c - norm.start.col,
          rawValue: cell?.rawValue,
          style: cell?.style ? { ...cell.style } : undefined,
        });

        rowArr.push(cell?.value !== undefined && cell.value !== null ? String(cell.value) : '');
      }
      tsvRows.push(rowArr);
    }

    // Write TSV to system clipboard
    const tsvText = tsvRows.map((row) => row.join('\t')).join('\n');
    navigator.clipboard?.writeText(tsvText).catch(() => {});

    set({
      clipboard: {
        data: clipData,
        isCut: false,
        sourceSheetId: sheet.id,
        sourceRange: selectionRange,
      },
      statusMessage: `Copied ${clipData.length} cells`,
    });
  },

  cut: () => {
    const { copy, workbookModel, selectionRange, calculationEngine, commandManager } = get();
    copy();

    const sheet = workbookModel.getActiveSheet();
    const norm = normalizeRange(selectionRange);
    const addresses: string[] = [];

    for (let r = norm.start.row; r <= norm.end.row; r++) {
      for (let c = norm.start.col; c <= norm.end.col; c++) {
        addresses.push(`${numberToColumn(c + 1)}${r + 1}`);
      }
    }

    const cmd = new DeleteCellsCommand(workbookModel, calculationEngine, sheet.id, addresses);
    commandManager.executeCommand(cmd);

    const state = get();
    if (state.clipboard) {
      set({
        clipboard: { ...state.clipboard, isCut: true },
        workbookData: modelToData(workbookModel),
        statusMessage: `Cut ${addresses.length} cells`,
      });
    }
  },

  paste: (pasteType = 'all') => {
    const { clipboard, workbookModel, activeCell, calculationEngine, commandManager } = get();
    if (!clipboard || clipboard.data.length === 0) return;

    const activeSheet = workbookModel.getActiveSheet();
    const cmd = new PasteCellsCommand(
      workbookModel,
      calculationEngine,
      activeSheet.id,
      activeCell.row,
      activeCell.col,
      clipboard.data,
      pasteType
    );

    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Pasted (${pasteType})`,
    });
  },

  autoFill: (targetRange) => {
    const { workbookModel, activeCell, selectionRange, calculationEngine, commandManager } = get();
    const sheet = workbookModel.getActiveSheet();
    const sourceNorm = normalizeRange(selectionRange);
    const targetNorm = normalizeRange(targetRange);

    const sourceData: ClipCellData[] = [];
    for (let r = sourceNorm.start.row; r <= sourceNorm.end.row; r++) {
      for (let c = sourceNorm.start.col; c <= sourceNorm.end.col; c++) {
        const addr = `${numberToColumn(c + 1)}${r + 1}`;
        const cell = sheet.getCell(addr);
        sourceData.push({
          rowOffset: r - sourceNorm.start.row,
          colOffset: c - sourceNorm.start.col,
          rawValue: cell?.rawValue,
          style: cell?.style ? { ...cell.style } : undefined,
        });
      }
    }

    // Auto-fill into target region
    const clipData: ClipCellData[] = [];
    const srcHeight = sourceNorm.end.row - sourceNorm.start.row + 1;
    const srcWidth = sourceNorm.end.col - sourceNorm.start.col + 1;

    for (let r = targetNorm.start.row; r <= targetNorm.end.row; r++) {
      for (let c = targetNorm.start.col; c <= targetNorm.end.col; c++) {
        const rOffset = (r - targetNorm.start.row) % srcHeight;
        const cOffset = (c - targetNorm.start.col) % srcWidth;
        const srcItem = sourceData.find((d) => d.rowOffset === rOffset && d.colOffset === cOffset);

        if (srcItem) {
          clipData.push({
            rowOffset: r - targetNorm.start.row,
            colOffset: c - targetNorm.start.col,
            rawValue: srcItem.rawValue,
            style: srcItem.style,
          });
        }
      }
    }

    const cmd = new PasteCellsCommand(
      workbookModel,
      calculationEngine,
      sheet.id,
      targetNorm.start.row,
      targetNorm.start.col,
      clipData,
      'all'
    );

    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      selectionRange: targetRange,
      statusMessage: 'Auto-filled range',
    });
  },

  deleteSelection: () => {
    const { workbookModel, selectionRange, calculationEngine, commandManager } = get();
    const sheet = workbookModel.getActiveSheet();
    const norm = normalizeRange(selectionRange);
    const addresses: string[] = [];

    for (let r = norm.start.row; r <= norm.end.row; r++) {
      for (let c = norm.start.col; c <= norm.end.col; c++) {
        addresses.push(`${numberToColumn(c + 1)}${r + 1}`);
      }
    }

    const cmd = new DeleteCellsCommand(workbookModel, calculationEngine, sheet.id, addresses);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Cleared ${addresses.length} cells`,
    });
  },

  insertRow: (rowIndex) => {
    const { workbookModel, activeCell, calculationEngine, commandManager } = get();
    const idx = rowIndex !== undefined ? rowIndex : activeCell.row;
    const sheet = workbookModel.getActiveSheet();

    const cmd = new InsertRowColumnCommand(workbookModel, calculationEngine, sheet.id, 'row', idx, 1);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Inserted row at ${idx + 1}`,
    });
  },

  deleteRow: (rowIndex) => {
    const { workbookModel, activeCell, calculationEngine, commandManager } = get();
    const idx = rowIndex !== undefined ? rowIndex : activeCell.row;
    const sheet = workbookModel.getActiveSheet();

    const cmd = new DeleteRowColumnCommand(workbookModel, calculationEngine, sheet.id, 'row', idx, 1);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Deleted row ${idx + 1}`,
    });
  },

  insertColumn: (colIndex) => {
    const { workbookModel, activeCell, calculationEngine, commandManager } = get();
    const idx = colIndex !== undefined ? colIndex : activeCell.col;
    const sheet = workbookModel.getActiveSheet();

    const cmd = new InsertRowColumnCommand(workbookModel, calculationEngine, sheet.id, 'column', idx, 1);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Inserted column at ${numberToColumn(idx + 1)}`,
    });
  },

  deleteColumn: (colIndex) => {
    const { workbookModel, activeCell, calculationEngine, commandManager } = get();
    const idx = colIndex !== undefined ? colIndex : activeCell.col;
    const sheet = workbookModel.getActiveSheet();

    const cmd = new DeleteRowColumnCommand(workbookModel, calculationEngine, sheet.id, 'column', idx, 1);
    commandManager.executeCommand(cmd);

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Deleted column ${numberToColumn(idx + 1)}`,
    });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidePanelTab: (tab) => set({ sidePanelTab: tab, sidebarOpen: true }),
  setZoom: (zoom) => set({ zoom: Math.min(200, Math.max(50, zoom)) }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),

  getSelectionStats: () => {
    const { workbookModel, selectionRange } = get();
    const sheet = workbookModel.getActiveSheet();
    const norm = normalizeRange(selectionRange);

    let count = 0;
    let numericCount = 0;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;

    for (let r = norm.start.row; r <= norm.end.row; r++) {
      for (let c = norm.start.col; c <= norm.end.col; c++) {
        count++;
        const addr = `${numberToColumn(c + 1)}${r + 1}`;
        const cell = sheet.getCell(addr);

        if (cell && cell.value !== undefined && cell.value !== null) {
          const val = cell.value;
          if (typeof val === 'number' && !isNaN(val)) {
            numericCount++;
            sum += val;
            if (val < min) min = val;
            if (val > max) max = val;
          }
        }
      }
    }

    return {
      count,
      numericCount,
      sum: numericCount > 0 ? sum : 0,
      average: numericCount > 0 ? sum / numericCount : 0,
      min: numericCount > 0 ? min : 0,
      max: numericCount > 0 ? max : 0,
    };
  },

  getFormattedCellValue: (cellData) => {
    if (!cellData) return '';
    const rawVal = cellData.value;
    if (rawVal === null || rawVal === undefined) return '';

    if (typeof rawVal === 'number') {
      const style = cellData.style;
      if (style?.numberFormat === 'currency') return `$${rawVal.toFixed(2)}`;
      if (style?.numberFormat === 'percentage') return `${(rawVal * 100).toFixed(1)}%`;
      if (style?.numberFormat === 'scientific') return rawVal.toExponential(3);
      if (style?.numberFormat === 'integer') return Math.round(rawVal).toLocaleString();

      return Number.isInteger(rawVal) ? String(rawVal) : parseFloat(rawVal.toFixed(4)).toString();
    }

    return String(rawVal);
  },

  undo: () => {
    const { commandManager, workbookModel } = get();
    if (commandManager.canUndo()) {
      commandManager.undo();
      set({
        workbookData: modelToData(workbookModel),
        statusMessage: 'Undo action',
      });
    }
  },

  redo: () => {
    const { commandManager, workbookModel } = get();
    if (commandManager.canRedo()) {
      commandManager.redo();
      set({
        workbookData: modelToData(workbookModel),
        statusMessage: 'Redo action',
      });
    }
  },

  canUndo: () => get().commandManager.canUndo(),
  canRedo: () => get().commandManager.canRedo(),

  loadEngineeringTemplate: (type) => {
    const { workbookModel, calculationEngine } = get();
    const sheet = workbookModel.addSheet(type.toUpperCase() + ' Template');

    if (type === 'hydraulic') {
      calculationEngine.setCellContent(sheet.name, 'A1', 'PIPE HYDRAULIC DESIGN SHEET');
      sheet.setCell('A1', { style: { bold: true, fontSize: 13, textColor: '#06b6d4' } });
    }

    set({
      workbookData: modelToData(workbookModel),
      statusMessage: `Loaded ${type} template`,
    });
  },
}));
