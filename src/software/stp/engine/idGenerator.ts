/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering ID Generator System
 * @license Apache-2.0
 */

export class IDGenerator {
  private static counters: Record<string, number> = {};

  public static generateID(prefix: string): string {
    if (!this.counters[prefix]) {
      this.counters[prefix] = 1;
    } else {
      this.counters[prefix] += 1;
    }
    const sequence = String(this.counters[prefix]).padStart(3, '0');
    return `${prefix}-${sequence}`;
  }

  public static projectID(): string {
    return this.generateID('STP-PROJ');
  }

  public static processUnitID(): string {
    return this.generateID('PU');
  }

  public static equipmentID(typePrefix: string = 'EQ'): string {
    return this.generateID(typePrefix);
  }

  public static streamID(): string {
    return this.generateID('STRM');
  }

  public static calculationID(type: string = 'CALC'): string {
    return this.generateID(`CALC-${type.toUpperCase()}`);
  }

  public static parameterID(category: string, code: string): string {
    return `STP.${category.toUpperCase()}.${code.toUpperCase()}`;
  }

  public static validationID(): string {
    return this.generateID('VAL');
  }

  public static assumptionID(): string {
    return this.generateID('ASM');
  }

  public static scenarioID(suffix: string): string {
    return `SCEN-${suffix.toUpperCase()}`;
  }

  public static boqItemID(subsystem: string): string {
    return this.generateID(`BOQ-${subsystem.toUpperCase()}`);
  }

  public static bimGuid(): string {
    // Deterministic pseudo-GUID for BIM export traceability
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  public static resetCounters(): void {
    this.counters = {};
  }
}
