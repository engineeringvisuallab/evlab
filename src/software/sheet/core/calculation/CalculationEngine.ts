import { WorkbookModel } from '../workbook/WorkbookModel';
import { WorksheetModel } from '../worksheet/WorksheetModel';
import { DependencyGraph } from '../dependency/DependencyGraph';
import { FormulaParser } from '../formula/FormulaParser';
import { FormulaEvaluator } from '../formula/FormulaEvaluator';
import { parseRange, iterateRange } from '../ranges/RangeParser';
import { parseCellAddress, formatCellAddress } from '../references/AddressParser';
import { SpreadsheetError } from '../errors/SpreadsheetError';
import { Cell } from '../cell/CellModel';

export class CalculationEngine {
  private workbook: WorkbookModel;
  private dependencyGraph: DependencyGraph = new DependencyGraph();
  private formulaParser: FormulaParser = new FormulaParser();
  private formulaEvaluator: FormulaEvaluator = new FormulaEvaluator();

  constructor(workbook: WorkbookModel) {
    this.workbook = workbook;
    this.rebuildDependencyGraph();
  }

  public setWorkbook(workbook: WorkbookModel): void {
    this.workbook = workbook;
    this.rebuildDependencyGraph();
  }

  /**
   * Sets content for a cell and triggers automatic recalculation
   */
  public setCellContent(
    sheetIdOrName: string,
    address: string,
    rawValue: string
  ): void {
    const sheet = this.workbook.getSheet(sheetIdOrName);
    if (!sheet) return;

    const normAddr = address.toUpperCase();
    const cellKey = `${sheet.name}!${normAddr}`;

    // Update raw cell data
    sheet.setCell(normAddr, { rawValue });

    if (this.workbook.calculationMode === 'automatic') {
      this.recalculateCellAndDependents(sheet, normAddr, cellKey);
    }
  }

  /**
   * Recalculates a single cell and all its dependents in topological order
   */
  public recalculateCellAndDependents(
    sheet: WorksheetModel,
    address: string,
    cellKey: string
  ): void {
    const normAddr = address.toUpperCase();
    const cell = sheet.getCell(normAddr);

    if (!cell) return;

    // 1. Parse dependencies if formula
    if (cell.formula) {
      const { cells, ranges } = this.formulaParser.extractReferences(cell.formula);
      const depKeys: string[] = [];

      // Add direct cell dependencies
      for (const refCell of cells) {
        const parsed = parseCellAddress(refCell);
        const refSheet = parsed?.sheetName || sheet.name;
        const refAddress = parsed ? formatCellAddress(parsed, false) : refCell;
        depKeys.push(`${refSheet}!${refAddress}`);
      }

      // Add range dependencies
      for (const refRange of ranges) {
        const parsedRange = parseRange(refRange);
        if (parsedRange) {
          const refSheet = parsedRange.sheetName || parsedRange.start.sheetName || sheet.name;
          iterateRange(parsedRange, (addr) => {
            const refAddress = formatCellAddress(addr, false);
            depKeys.push(`${refSheet}!${refAddress}`);
          });
        }
      }

      this.dependencyGraph.setDependencies(cellKey, depKeys);
    } else {
      this.dependencyGraph.removeCell(cellKey);
    }

    // 2. Get recalculation order
    const result = this.dependencyGraph.getRecalculationOrder([cellKey]);

    if (result.hasCircular) {
      // Flag circular error cells
      for (const circKey of result.circularKeys) {
        const [sheetName, addr] = circKey.split('!');
        const s = this.workbook.getSheet(sheetName);
        if (s) {
          s.setCell(addr, {
            error: new SpreadsheetError('CIRCULAR'),
            value: '#CIRCULAR!',
            dataType: 'error',
          });
        }
      }
    }

    // 3. Evaluate non-circular cells in order
    for (const keyToEval of result.order) {
      if (result.circularKeys.has(keyToEval)) continue;

      const [sheetName, addr] = keyToEval.split('!');
      const s = this.workbook.getSheet(sheetName);
      if (!s) continue;

      const targetCell = s.getCell(addr);
      if (!targetCell) continue;

      if (!targetCell.formula) {
        // Simple value calculation
        this.evaluateNonFormulaCell(s, targetCell);
      } else {
        // Formula calculation
        try {
          const ast = this.formulaParser.parse(targetCell.formula);
          const val = this.formulaEvaluator.evaluate(ast, {
            workbook: this.workbook,
            currentSheet: s,
            currentCellAddress: addr,
          });

          if (SpreadsheetError.isSpreadsheetError(val)) {
            s.setCell(addr, {
              error: val,
              value: val.toDisplayString(),
              dataType: 'error',
            });
          } else {
            const dataType = typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
            s.setCell(addr, {
              value: val,
              error: undefined,
              dataType,
            });
          }
        } catch (err) {
          const error = SpreadsheetError.isSpreadsheetError(err)
            ? err
            : new SpreadsheetError('VALUE', err instanceof Error ? err.message : String(err));
          s.setCell(addr, {
            error,
            value: error.toDisplayString(),
            dataType: 'error',
          });
        }
      }
    }
  }

  /**
   * Recalculates all cells in the entire workbook
   */
  public recalculateWorkbook(): void {
    this.rebuildDependencyGraph();

    for (const sheet of this.workbook.sheets) {
      const allCells = Array.from(sheet.cells.getAll().values());
      for (const cell of allCells) {
        const cellKey = `${sheet.name}!${cell.address}`;
        this.recalculateCellAndDependents(sheet, cell.address, cellKey);
      }
    }
  }

  private evaluateNonFormulaCell(sheet: WorksheetModel, cell: Cell): void {
    const raw = cell.rawValue || '';
    if (raw === '') {
      sheet.setCell(cell.address, { value: '', dataType: 'blank', error: undefined });
    } else if (!isNaN(Number(raw)) && raw.trim() !== '') {
      sheet.setCell(cell.address, { value: Number(raw), dataType: 'number', error: undefined });
    } else if (raw.toLowerCase() === 'true' || raw.toLowerCase() === 'false') {
      sheet.setCell(cell.address, { value: raw.toLowerCase() === 'true', dataType: 'boolean', error: undefined });
    } else {
      sheet.setCell(cell.address, { value: raw, dataType: 'string', error: undefined });
    }
  }

  private rebuildDependencyGraph(): void {
    this.dependencyGraph.clear();

    for (const sheet of this.workbook.sheets) {
      const allCells = Array.from(sheet.cells.getAll().values());
      for (const cell of allCells) {
        if (cell.formula) {
          const cellKey = `${sheet.name}!${cell.address}`;
          const { cells, ranges } = this.formulaParser.extractReferences(cell.formula);
          const depKeys: string[] = [];

          for (const refCell of cells) {
            const parsed = parseCellAddress(refCell);
            const refSheet = parsed?.sheetName || sheet.name;
            const refAddress = parsed ? formatCellAddress(parsed, false) : refCell;
            depKeys.push(`${refSheet}!${refAddress}`);
          }

          for (const refRange of ranges) {
            const parsedRange = parseRange(refRange);
            if (parsedRange) {
              const refSheet = parsedRange.sheetName || parsedRange.start.sheetName || sheet.name;
              iterateRange(parsedRange, (addr) => {
                const refAddress = formatCellAddress(addr, false);
                depKeys.push(`${refSheet}!${refAddress}`);
              });
            }
          }

          this.dependencyGraph.setDependencies(cellKey, depKeys);
        }
      }
    }
  }
}
