import { WorksheetModel } from '../worksheet/WorksheetModel';

export interface NamedRange {
  name: string;
  range: string; // e.g., "Sheet1!A1:B10" or "A1:A10"
  comment?: string;
}

export interface WorkbookMetadata {
  title: string;
  author: string;
  created: string;
  modified: string;
}

export class WorkbookModel {
  public id: string;
  public name: string;
  public sheets: WorksheetModel[];
  public activeSheetId: string;
  public namedRanges: NamedRange[];
  public calculationMode: 'automatic' | 'manual';
  public metadata: WorkbookMetadata;

  constructor(data?: {
    id?: string;
    name?: string;
    sheets?: WorksheetModel[];
    activeSheetId?: string;
    namedRanges?: NamedRange[];
    calculationMode?: 'automatic' | 'manual';
    metadata?: Partial<WorkbookMetadata>;
  }) {
    this.id = data?.id || 'wb_' + Math.random().toString(36).substr(2, 9);
    this.name = data?.name || 'EVLab Workbook';
    
    if (data?.sheets && data.sheets.length > 0) {
      this.sheets = data.sheets;
    } else {
      const defaultSheet = new WorksheetModel({
        id: 'sheet_1',
        name: 'Sheet1',
        index: 0,
      });
      this.sheets = [defaultSheet];
    }

    this.activeSheetId = data?.activeSheetId || this.sheets[0].id;
    this.namedRanges = data?.namedRanges || [];
    this.calculationMode = data?.calculationMode || 'automatic';

    const now = new Date().toISOString();
    this.metadata = {
      title: data?.metadata?.title || 'EVLab Engineering Sheet',
      author: data?.metadata?.author || 'EVLab User',
      created: data?.metadata?.created || now,
      modified: data?.metadata?.modified || now,
    };
  }

  public getSheet(idOrName: string): WorksheetModel | undefined {
    if (!idOrName) return undefined;
    const lower = idOrName.toLowerCase();
    return this.sheets.find((s) => s.id === idOrName || s.name.toLowerCase() === lower);
  }

  public getActiveSheet(): WorksheetModel {
    const sheet = this.getSheet(this.activeSheetId);
    if (!sheet) {
      return this.sheets[0];
    }
    return sheet;
  }

  public addSheet(name?: string): WorksheetModel {
    const nextNum = this.sheets.length + 1;
    const sheetName = name || `Sheet${nextNum}`;
    const newSheet = new WorksheetModel({
      id: 'sheet_' + Math.random().toString(36).substr(2, 9),
      name: sheetName,
      index: this.sheets.length,
    });
    this.sheets.push(newSheet);
    this.activeSheetId = newSheet.id;
    return newSheet;
  }

  public removeSheet(sheetId: string): boolean {
    if (this.sheets.length <= 1) return false; // Cannot remove last sheet
    const index = this.sheets.findIndex((s) => s.id === sheetId);
    if (index === -1) return false;

    this.sheets.splice(index, 1);
    if (this.activeSheetId === sheetId) {
      this.activeSheetId = this.sheets[Math.max(0, index - 1)].id;
    }

    // Re-index
    this.sheets.forEach((s, i) => (s.index = i));
    return true;
  }

  public deleteSheet(sheetId: string): boolean {
    return this.removeSheet(sheetId);
  }

  public renameSheet(sheetId: string, newName: string): boolean {
    const sheet = this.getSheet(sheetId);
    if (!sheet) return false;
    const existing = this.getSheet(newName);
    if (existing && existing.id !== sheetId) return false; // Duplicate name
    sheet.name = newName;
    return true;
  }

  public addNamedRange(namedRange: NamedRange): void {
    const idx = this.namedRanges.findIndex((r) => r.name.toLowerCase() === namedRange.name.toLowerCase());
    if (idx !== -1) {
      this.namedRanges[idx] = namedRange;
    } else {
      this.namedRanges.push(namedRange);
    }
  }

  public getNamedRange(name: string): NamedRange | undefined {
    return this.namedRanges.find((r) => r.name.toLowerCase() === name.toLowerCase());
  }
}
