import { Cell } from './CellModel';

export class CellStore {
  private store: Map<string, Cell> = new Map();

  public get(address: string): Cell | undefined {
    return this.store.get(address.toUpperCase());
  }

  public set(address: string, cell: Cell): void {
    const key = address.toUpperCase();
    if (this.isEmptyCell(cell)) {
      this.store.delete(key);
    } else {
      this.store.set(key, { ...cell, address: key });
    }
  }

  public delete(address: string): void {
    this.store.delete(address.toUpperCase());
  }

  public has(address: string): boolean {
    const key = address.toUpperCase();
    const cell = this.store.get(key);
    return !!cell && !this.isEmptyCell(cell);
  }

  public getAll(): Map<string, Cell> {
    return new Map(this.store);
  }

  public clear(): void {
    this.store.clear();
  }

  public size(): number {
    return this.store.size;
  }

  private isEmptyCell(cell: Cell): boolean {
    return (
      (cell.rawValue === undefined || cell.rawValue === '') &&
      (cell.formula === undefined || cell.formula === '') &&
      cell.comment === undefined &&
      cell.style === undefined &&
      cell.error === undefined
    );
  }
}
