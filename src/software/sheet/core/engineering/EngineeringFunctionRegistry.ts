import { EngineeringFunctionMeta } from '../../types';

export interface EngineeringFunctionImpl {
  meta: EngineeringFunctionMeta;
  execute: (...args: any[]) => any;
}

class EngineeringFunctionRegistryClass {
  private functions: Map<string, EngineeringFunctionImpl> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public register(impl: EngineeringFunctionImpl) {
    this.functions.set(impl.meta.name.toUpperCase(), impl);
  }

  public get(name: string): EngineeringFunctionImpl | undefined {
    return this.functions.get(name.toUpperCase());
  }

  public getAll(): EngineeringFunctionImpl[] {
    return Array.from(this.functions.values());
  }

  public getByCategory(category: string): EngineeringFunctionImpl[] {
    return this.getAll().filter((fn) => fn.meta.category === category);
  }

  private registerDefaults() {
    // GEOMETRY
    this.register({
      meta: {
        name: 'AREA_RECT',
        category: 'geometry',
        description: 'Calculates the area of a rectangle',
        syntax: 'AREA_RECT(width, length)',
        example: '=AREA_RECT(5, 10)',
      },
      execute: (w: number, l: number) => Number(w) * Number(l),
    });

    this.register({
      meta: {
        name: 'AREA_CIRCLE',
        category: 'geometry',
        description: 'Calculates the area of a circle given its diameter',
        syntax: 'AREA_CIRCLE(diameter)',
        example: '=AREA_CIRCLE(0.3)',
      },
      execute: (d: number) => (Math.PI * Math.pow(Number(d), 2)) / 4,
    });

    this.register({
      meta: {
        name: 'AREA_TRIANGLE',
        category: 'geometry',
        description: 'Calculates the area of a triangle given base and height',
        syntax: 'AREA_TRIANGLE(base, height)',
        example: '=AREA_TRIANGLE(4, 6)',
      },
      execute: (b: number, h: number) => 0.5 * Number(b) * Number(h),
    });

    this.register({
      meta: {
        name: 'VOLUME_BOX',
        category: 'geometry',
        description: 'Calculates the volume of a rectangular prism/box',
        syntax: 'VOLUME_BOX(width, length, height)',
        example: '=VOLUME_BOX(2, 5, 3)',
      },
      execute: (w: number, l: number, h: number) => Number(w) * Number(l) * Number(h),
    });

    this.register({
      meta: {
        name: 'VOLUME_CYLINDER',
        category: 'geometry',
        description: 'Calculates the volume of a cylinder given diameter and height',
        syntax: 'VOLUME_CYLINDER(diameter, height)',
        example: '=VOLUME_CYLINDER(0.5, 2.0)',
      },
      execute: (d: number, h: number) => ((Math.PI * Math.pow(Number(d), 2)) / 4) * Number(h),
    });

    // UNIT CONVERSIONS
    this.register({
      meta: {
        name: 'MM_TO_M',
        category: 'conversion',
        description: 'Converts millimeters to meters',
        syntax: 'MM_TO_M(millimeters)',
        example: '=MM_TO_M(300)',
      },
      execute: (mm: number) => Number(mm) / 1000,
    });

    this.register({
      meta: {
        name: 'M_TO_MM',
        category: 'conversion',
        description: 'Converts meters to millimeters',
        syntax: 'M_TO_MM(meters)',
        example: '=M_TO_MM(0.3)',
      },
      execute: (m: number) => Number(m) * 1000,
    });

    this.register({
      meta: {
        name: 'M3_TO_L',
        category: 'conversion',
        description: 'Converts cubic meters (m³) to liters (L)',
        syntax: 'M3_TO_L(m3)',
        example: '=M3_TO_L(2.5)',
      },
      execute: (m3: number) => Number(m3) * 1000,
    });

    this.register({
      meta: {
        name: 'L_TO_M3',
        category: 'conversion',
        description: 'Converts liters (L) to cubic meters (m³)',
        syntax: 'L_TO_M3(liters)',
        example: '=L_TO_M3(2500)',
      },
      execute: (l: number) => Number(l) / 1000,
    });

    this.register({
      meta: {
        name: 'LPS_TO_M3S',
        category: 'conversion',
        description: 'Converts Liters per second (L/s) to cubic meters per second (m³/s)',
        syntax: 'LPS_TO_M3S(lps)',
        example: '=LPS_TO_M3S(50)',
      },
      execute: (lps: number) => Number(lps) / 1000,
    });

    this.register({
      meta: {
        name: 'M3S_TO_LPS',
        category: 'conversion',
        description: 'Converts cubic meters per second (m³/s) to Liters per second (L/s)',
        syntax: 'M3S_TO_LPS(m3s)',
        example: '=M3S_TO_LPS(0.05)',
      },
      execute: (m3s: number) => Number(m3s) * 1000,
    });

    this.register({
      meta: {
        name: 'CONVERT_UNIT',
        category: 'conversion',
        description: 'Converts a value between specified units (e.g. "mm" to "m", "kPa" to "bar")',
        syntax: 'CONVERT_UNIT(value, from_unit, to_unit)',
        example: '=CONVERT_UNIT(100, "kPa", "bar")',
      },
      execute: (val: number, fromUnit: string, toUnit: string) => {
        const value = Number(val);
        const from = String(fromUnit).toLowerCase().trim();
        const to = String(toUnit).toLowerCase().trim();

        if (from === to) return value;

        // Length
        if (from === 'mm' && to === 'm') return value / 1000;
        if (from === 'm' && to === 'mm') return value * 1000;
        if (from === 'cm' && to === 'm') return value / 100;
        if (from === 'm' && to === 'cm') return value * 100;
        if (from === 'km' && to === 'm') return value * 1000;
        if (from === 'm' && to === 'km') return value / 1000;

        // Pressure
        if (from === 'kpa' && to === 'bar') return value / 100;
        if (from === 'bar' && to === 'kpa') return value * 100;
        if (from === 'kpa' && to === 'mpa') return value / 1000;
        if (from === 'mpa' && to === 'kpa') return value * 1000;

        // Flow
        if (from === 'lps' && to === 'm3/s') return value / 1000;
        if (from === 'm3/s' && to === 'lps') return value * 1000;

        return '#VALUE!';
      },
    });

    // HYDRAULIC
    this.register({
      meta: {
        name: 'PIPE_AREA',
        category: 'hydraulic',
        description: 'Calculates internal cross-sectional area of a pipe in m² given diameter in mm',
        syntax: 'PIPE_AREA(diameter_mm)',
        example: '=PIPE_AREA(300)',
      },
      execute: (diameterMm: number) => {
        const dMeters = Number(diameterMm) / 1000;
        return (Math.PI * Math.pow(dMeters, 2)) / 4;
      },
    });

    this.register({
      meta: {
        name: 'PIPE_VELOCITY',
        category: 'hydraulic',
        description: 'Calculates fluid velocity in m/s given flow in L/s and diameter in mm',
        syntax: 'PIPE_VELOCITY(flow_lps, diameter_mm)',
        example: '=PIPE_VELOCITY(45, 300)',
      },
      execute: (flowLps: number, diameterMm: number) => {
        const qM3s = Number(flowLps) / 1000;
        const dMeters = Number(diameterMm) / 1000;
        const area = (Math.PI * Math.pow(dMeters, 2)) / 4;
        if (area === 0) return '#DIV/0!';
        return qM3s / area;
      },
    });

    this.register({
      meta: {
        name: 'REYNOLDS',
        category: 'hydraulic',
        description: 'Calculates Reynolds Number given velocity (m/s) and diameter (mm)',
        syntax: 'REYNOLDS(velocity_ms, diameter_mm, [kinematic_viscosity])',
        example: '=REYNOLDS(1.5, 300)',
      },
      execute: (v: number, dMm: number, nu: number = 1e-6) => {
        const dM = Number(dMm) / 1000;
        const vMs = Number(v);
        const viscosity = Number(nu) || 1e-6;
        if (viscosity === 0) return '#DIV/0!';
        return (vMs * dM) / viscosity;
      },
    });

    // PROJECT
    this.register({
      meta: {
        name: 'DURATION',
        category: 'project',
        description: 'Calculates duration in days between two date strings or timestamps',
        syntax: 'DURATION(start_date, end_date)',
        example: '=DURATION("2026-08-01", "2026-08-15")',
      },
      execute: (start: any, end: any) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '#VALUE!';
        const diffMs = d2.getTime() - d1.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      },
    });
  }
}

export const EngineeringFunctionRegistry = new EngineeringFunctionRegistryClass();
