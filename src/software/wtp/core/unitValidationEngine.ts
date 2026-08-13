export interface UnitCheckResult {
  parameterName: string;
  category: 'FLOW' | 'PRESSURE' | 'HEAD' | 'LENGTH' | 'AREA' | 'VOLUME' | 'MASS' | 'CONCENTRATION' | 'POWER' | 'ENERGY' | 'TEMPERATURE' | 'DENSITY';
  value: number;
  unit: string;
  standardSiUnit: string;
  convertedSiValue: number;
  isValidUnit: boolean;
  validationStatus: 'VALID' | 'WARNING' | 'INVALID_UNIT' | 'MISMATCH';
  message: string;
}

export function validateProjectUnits(parameters: Array<{ name: string; category: UnitCheckResult['category']; value: number; unit: string }>): UnitCheckResult[] {
  const validUnitsMap: Record<UnitCheckResult['category'], { siUnit: string; validUnits: string[]; convertToSi: (val: number, u: string) => number }> = {
    FLOW: {
      siUnit: 'm³/s',
      validUnits: ['m³/s', 'm³/h', 'm³/d', 'L/s', 'MLD'],
      convertToSi: (val, u) => {
        if (u === 'm³/s') return val;
        if (u === 'm³/h') return val / 3600;
        if (u === 'm³/d') return val / 86400;
        if (u === 'L/s') return val / 1000;
        if (u === 'MLD') return (val * 1000) / 86400;
        return val;
      }
    },
    PRESSURE: {
      siUnit: 'kPa',
      validUnits: ['kPa', 'bar', 'm', 'psi'],
      convertToSi: (val, u) => {
        if (u === 'kPa') return val;
        if (u === 'bar') return val * 100;
        if (u === 'm') return val * 9.80665;
        if (u === 'psi') return val * 6.89476;
        return val;
      }
    },
    HEAD: {
      siUnit: 'm',
      validUnits: ['m', 'cm', 'mm', 'ft'],
      convertToSi: (val, u) => {
        if (u === 'm') return val;
        if (u === 'cm') return val / 100;
        if (u === 'mm') return val / 1000;
        if (u === 'ft') return val * 0.3048;
        return val;
      }
    },
    LENGTH: {
      siUnit: 'm',
      validUnits: ['m', 'cm', 'mm', 'km'],
      convertToSi: (val, u) => {
        if (u === 'm') return val;
        if (u === 'cm') return val / 100;
        if (u === 'mm') return val / 1000;
        if (u === 'km') return val * 1000;
        return val;
      }
    },
    AREA: {
      siUnit: 'm²',
      validUnits: ['m²', 'cm²', 'mm²', 'ha'],
      convertToSi: (val, u) => {
        if (u === 'm²') return val;
        if (u === 'cm²') return val / 10000;
        if (u === 'mm²') return val / 1000000;
        if (u === 'ha') return val * 10000;
        return val;
      }
    },
    VOLUME: {
      siUnit: 'm³',
      validUnits: ['m³', 'L', 'ML'],
      convertToSi: (val, u) => {
        if (u === 'm³') return val;
        if (u === 'L') return val / 1000;
        if (u === 'ML') return val * 1000;
        return val;
      }
    },
    MASS: {
      siUnit: 'kg',
      validUnits: ['kg', 'g', 't', 'Tonnes'],
      convertToSi: (val, u) => {
        if (u === 'kg') return val;
        if (u === 'g') return val / 1000;
        if (u === 't' || u === 'Tonnes') return val * 1000;
        return val;
      }
    },
    CONCENTRATION: {
      siUnit: 'mg/L',
      validUnits: ['mg/L', 'g/m³', 'ppm', 'µg/L'],
      convertToSi: (val, u) => {
        if (u === 'mg/L' || u === 'g/m³' || u === 'ppm') return val;
        if (u === 'µg/L') return val / 1000;
        return val;
      }
    },
    POWER: {
      siUnit: 'kW',
      validUnits: ['kW', 'W', 'MW', 'HP'],
      convertToSi: (val, u) => {
        if (u === 'kW') return val;
        if (u === 'W') return val / 1000;
        if (u === 'MW') return val * 1000;
        if (u === 'HP') return val * 0.7457;
        return val;
      }
    },
    ENERGY: {
      siUnit: 'kWh',
      validUnits: ['kWh', 'MWh', 'GJ', 'kWh/m³'],
      convertToSi: (val, u) => {
        if (u === 'kWh' || u === 'kWh/m³') return val;
        if (u === 'MWh') return val * 1000;
        if (u === 'GJ') return val / 3.6;
        return val;
      }
    },
    TEMPERATURE: {
      siUnit: '°C',
      validUnits: ['°C', 'K', '°F'],
      convertToSi: (val, u) => {
        if (u === '°C') return val;
        if (u === 'K') return val - 273.15;
        if (u === '°F') return (val - 32) * (5 / 9);
        return val;
      }
    },
    DENSITY: {
      siUnit: 'kg/m³',
      validUnits: ['kg/m³', 'g/cm³'],
      convertToSi: (val, u) => {
        if (u === 'kg/m³') return val;
        if (u === 'g/cm³') return val * 1000;
        return val;
      }
    }
  };

  return parameters.map(p => {
    const config = validUnitsMap[p.category];
    if (!config) {
      return {
        parameterName: p.name,
        category: p.category,
        value: p.value,
        unit: p.unit,
        standardSiUnit: 'UNKNOWN',
        convertedSiValue: p.value,
        isValidUnit: false,
        validationStatus: 'INVALID_UNIT',
        message: `Category ${p.category} is not recognized in unit validator.`
      };
    }

    const isValid = config.validUnits.includes(p.unit);
    const convertedVal = isValid ? config.convertToSi(p.value, p.unit) : p.value;

    return {
      parameterName: p.name,
      category: p.category,
      value: p.value,
      unit: p.unit,
      standardSiUnit: config.siUnit,
      convertedSiValue: convertedVal,
      isValidUnit: isValid,
      validationStatus: isValid ? 'VALID' : 'INVALID_UNIT',
      message: isValid
        ? `Unit '${p.unit}' validated and converted to ${convertedVal.toFixed(3)} ${config.siUnit}.`
        : `Unit '${p.unit}' is not in approved project units list [${config.validUnits.join(', ')}].`
    };
  });
}
