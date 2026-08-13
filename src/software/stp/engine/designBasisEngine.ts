/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 02 Design Basis & Flow Hydraulics Engine
 * @license Apache-2.0
 */

import {
  DesignBasis,
  DiurnalCurve,
  DiurnalProfileType,
  InfiltrationConfig,
  PeakingMethod,
} from '../types/stp';

export class DesignBasisEngine {
  /**
   * Computes Peaking Factor using standard sanitary engineering equations:
   * - Harmon: PF = 1 + 14 / (4 + sqrt(P_thousands))
   * - Babbit: PF = 5 / (P_thousands^0.2)
   * - Gifft: PF = 5 / (P_thousands^0.167)
   * - Fair-Geyer: PF = (18 + sqrt(P_thousands)) / (4 + sqrt(P_thousands))
   * - ATV German: PF = 1.5 + 10 / sqrt(P_thousands)
   * - Custom: User specified with upper/lower bounds
   */
  public static calculatePeakingFactor(
    population: number,
    method: PeakingMethod,
    customFactor?: number
  ): { factor: number; formulaDisplay: string; reference: string } {
    const pThousand = Math.max(0.1, population / 1000);

    switch (method) {
      case 'BABBIT': {
        const pf = Math.min(5.0, Math.max(1.5, 5 / Math.pow(pThousand, 0.2)));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: 'PF = 5 / (P / 1000)^0.2',
          reference: 'Babbit Sanitary Sewer Design Equation',
        };
      }
      case 'GIFFT': {
        const pf = Math.min(5.0, Math.max(1.5, 5 / Math.pow(pThousand, 0.167)));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: 'PF = 5 / (P / 1000)^0.167',
          reference: 'Gifft Sewerage Peaking Equation',
        };
      }
      case 'FAIR_GEYSER': {
        const pf = Math.min(4.5, Math.max(1.5, (18 + Math.sqrt(pThousand)) / (4 + Math.sqrt(pThousand))));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: 'PF = (18 + sqrt(P_k)) / (4 + sqrt(P_k))',
          reference: 'Fair, Geyer & Okun Water & Wastewater Engineering',
        };
      }
      case 'ATV_GERMAN': {
        const pf = Math.min(4.5, Math.max(1.4, 1.5 + 10 / Math.sqrt(pThousand)));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: 'PF = 1.5 + 10 / sqrt(P_k)',
          reference: 'ATV-A 198 / DWA German Standards',
        };
      }
      case 'CUSTOM': {
        const pf = Math.min(6.0, Math.max(1.2, customFactor || 2.25));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: `PF_custom = ${pf}`,
          reference: 'Specified by Project Engineer',
        };
      }
      case 'HARMON':
      default: {
        const pf = Math.min(4.0, Math.max(1.8, 1 + 14 / (4 + Math.sqrt(pThousand))));
        return {
          factor: Number(pf.toFixed(2)),
          formulaDisplay: 'PF = 1 + 14 / (4 + sqrt(P_k))',
          reference: 'Harmon Sanitary Sewer Formula (ASCE MOP 60)',
        };
      }
    }
  }

  /**
   * Calculates Groundwater Infiltration & Storm Inflow Rates (m3/day and L/s)
   */
  public static calculateInfiltrationInflow(
    population: number,
    config: InfiltrationConfig
  ): { infiltrationM3d: number; inflowM3d: number; totalIIM3d: number; totalIILps: number } {
    let baseInfiltrationLps = 0;

    switch (config.method) {
      case 'PIPE_LENGTH':
        baseInfiltrationLps = config.pipeLengthKm * config.rateLpsKm;
        break;
      case 'CATCHMENT_AREA':
        // L/ha/day converted to L/s
        baseInfiltrationLps = (config.catchmentAreaHa * config.rateLhaDay) / 86400;
        break;
      case 'PER_CAPITA':
        // LPD per capita converted to L/s
        baseInfiltrationLps = (population * config.perCapitaLpd) / 86400;
        break;
      case 'FIXED':
      default:
        baseInfiltrationLps = (config.designInfiltrationLps || 15.0);
        break;
    }

    const seasonalInfiltrationLps = baseInfiltrationLps * (config.seasonalFactor || 1.0);
    const infiltrationM3d = seasonalInfiltrationLps * 86.4;

    // Storm Rainfall Allowance / Rain-Derived Inflow (RDI)
    const inflowLps = config.designInflowLps || (baseInfiltrationLps * (config.rainInflowPct / 100));
    const inflowM3d = inflowLps * 86.4;

    const totalIIM3d = infiltrationM3d + inflowM3d;
    const totalIILps = totalIIM3d / 86.4;

    return {
      infiltrationM3d: Math.round(infiltrationM3d),
      inflowM3d: Math.round(inflowM3d),
      totalIIM3d: Math.round(totalIIM3d),
      totalIILps: Number(totalIILps.toFixed(2)),
    };
  }

  /**
   * Generates 24-hour diurnal flow multiplier profile based on urban development category.
   */
  public static getDiurnalProfile(type: DiurnalProfileType): DiurnalCurve {
    let multipliers: number[];

    switch (type) {
      case 'COMMERCIAL':
        // High daytime peak, low night flow
        multipliers = [
          0.3, 0.2, 0.1, 0.1, 0.2, 0.5, 0.9, 1.4, 1.8, 1.9, 1.8, 1.6,
          1.5, 1.4, 1.4, 1.3, 1.2, 1.1, 0.9, 0.7, 0.5, 0.4, 0.4, 0.3
        ];
        break;

      case 'INDUSTRIAL_FLAT':
        // Constant 24h operational shift profile
        multipliers = [
          0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1,
          1.1, 1.1, 1.1, 1.1, 1.1, 1.0, 1.0, 1.0, 0.9, 0.9, 0.9, 0.9
        ];
        break;

      case 'MIXED_URBAN':
        // Dual peak (morning & evening)
        multipliers = [
          0.6, 0.5, 0.4, 0.4, 0.5, 0.8, 1.3, 1.6, 1.5, 1.2, 1.1, 1.0,
          0.9, 0.9, 0.9, 0.9, 1.0, 1.2, 1.5, 1.4, 1.2, 1.0, 0.8, 0.7
        ];
        break;

      case 'RESIDENTIAL':
      default:
        // Classical morning peak and secondary evening peak
        multipliers = [
          0.5, 0.4, 0.35, 0.35, 0.4, 0.7, 1.4, 1.8, 1.6, 1.3, 1.1, 0.95,
          0.9, 0.85, 0.8, 0.85, 0.95, 1.2, 1.5, 1.6, 1.3, 1.0, 0.7, 0.6
        ];
        break;
    }

    const maxMultiplier = Math.max(...multipliers);
    const minMultiplier = Math.min(...multipliers);
    const peakHour = multipliers.indexOf(maxMultiplier);
    const minHour = multipliers.indexOf(minMultiplier);

    return {
      type,
      hourlyMultipliers: multipliers,
      peakHour,
      minHour,
      maxMultiplier,
      minMultiplier,
    };
  }

  /**
   * Computes complete Flow Hydraulics Matrix (ADWF, PDWF, AWWF, PWWF, Min Flow)
   */
  public static calculateCompleteFlows(
    population: number,
    designBasis: DesignBasis
  ): {
    domesticM3d: number;
    commercialM3d: number;
    institutionalM3d: number;
    industrialM3d: number;
    sanitaryM3d: number;
    adwfM3d: number;
    pdwfM3d: number;
    awwfM3d: number;
    pwwfM3d: number;
    minFlowM3d: number;
    peakFlowLps: number;
    peakingFactor: number;
    iiDetails: { infiltrationM3d: number; inflowM3d: number; totalIIM3d: number };
  } {
    const qCap = designBasis.perCapitaWaterDemandLpd;
    const domReturn = designBasis.domesticReturnFactor || designBasis.sewerageReturnFactor || 0.80;
    const commReturn = designBasis.commercialReturnFactor || designBasis.sewerageReturnFactor || 0.80;
    const indReturn = designBasis.industrialReturnFactor || designBasis.sewerageReturnFactor || 0.85;

    // 1. Base Sanitary Generation
    const domesticM3d = (population * qCap * domReturn) / 1000;
    const commercialM3d = (designBasis.commercialDemandM3d || 0) * commReturn;
    const institutionalM3d = (designBasis.institutionalDemandM3d || 0) * domReturn;

    // Industrial flow from industrial profiles or design basis
    let industrialM3d = 0;
    if (designBasis.industrialProfiles && designBasis.industrialProfiles.length > 0) {
      industrialM3d = designBasis.industrialProfiles.reduce((sum, p) => sum + p.flowM3d, 0);
    } else {
      industrialM3d = (designBasis.industrialDemandM3d || 0) * indReturn;
    }

    const sanitaryM3d = domesticM3d + commercialM3d + institutionalM3d;

    // 2. Infiltration & Inflow
    const ii = this.calculateInfiltrationInflow(population, designBasis.infiltrationConfig);

    // 3. Average Dry Weather Flow (ADWF)
    const adwfM3d = sanitaryM3d + industrialM3d + ii.infiltrationM3d;

    // 4. Peaking Factors
    const pfInfo = this.calculatePeakingFactor(
      population,
      designBasis.peakingMethod || 'HARMON',
      designBasis.customPeakFactor
    );
    const pfDry = pfInfo.factor;

    // 5. Peak Dry Weather Flow (PDWF)
    const pdwfM3d = sanitaryM3d * pfDry + industrialM3d * 1.5 + ii.infiltrationM3d;

    // 6. Average Wet Weather Flow (AWWF)
    const awwfM3d = adwfM3d + ii.inflowM3d * 0.5;

    // 7. Peak Wet Weather Flow (PWWF)
    const pwwfM3d = sanitaryM3d * pfDry + industrialM3d * 1.5 + ii.totalIIM3d;

    // 8. Minimum Flow (Night Minimum)
    const minFlowM3d = sanitaryM3d * 0.25 + ii.infiltrationM3d * 0.8;

    const peakFlowLps = pwwfM3d / 86.4;

    return {
      domesticM3d: Math.round(domesticM3d),
      commercialM3d: Math.round(commercialM3d),
      institutionalM3d: Math.round(institutionalM3d),
      industrialM3d: Math.round(industrialM3d),
      sanitaryM3d: Math.round(sanitaryM3d),
      adwfM3d: Math.round(adwfM3d),
      pdwfM3d: Math.round(pdwfM3d),
      awwfM3d: Math.round(awwfM3d),
      pwwfM3d: Math.round(pwwfM3d),
      minFlowM3d: Math.round(minFlowM3d),
      peakFlowLps: Number(peakFlowLps.toFixed(2)),
      peakingFactor: pfDry,
      iiDetails: {
        infiltrationM3d: ii.infiltrationM3d,
        inflowM3d: ii.inflowM3d,
        totalIIM3d: ii.totalIIM3d,
      },
    };
  }
}
