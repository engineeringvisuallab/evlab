/**
 * Core Scientific Calculation Engines for EVLab Chemistry
 * Provides exact, validated physical chemistry formulas and transparent derivations.
 */

export const ChemistryEngines = {
  // 1. Gas Laws Engine
  gasLaws: {
    R_IDEAL: 0.082057, // L·atm / (mol·K)
    R_SI: 8.31446, // J / (mol·K)

    calculatePressure(n: number, T_K: number, V_L: number): number {
      if (V_L <= 0) return 0;
      return (n * this.R_IDEAL * T_K) / V_L; // in atm
    },

    calculateVolume(n: number, T_K: number, P_atm: number): number {
      if (P_atm <= 0) return 0;
      return (n * this.R_IDEAL * T_K) / P_atm; // in L
    },

    calculateTemperature(P_atm: number, V_L: number, n: number): number {
      if (n <= 0) return 0;
      return (P_atm * V_L) / (n * this.R_IDEAL); // in Kelvin
    },

    calculateRmsVelocity(T_K: number, molarMassKgPerMol: number): number {
      if (molarMassKgPerMol <= 0 || T_K <= 0) return 0;
      return Math.sqrt((3 * this.R_SI * T_K) / molarMassKgPerMol); // in m/s
    }
  },

  // 2. Acid-Base & pH Engine
  acidBase: {
    KW_25C: 1.0e-14,

    pHFromH(hConc: number): number {
      if (hConc <= 0) return 14.0;
      return -Math.log10(hConc);
    },

    hFromPH(pH: number): number {
      return Math.pow(10, -pH);
    },

    pOHFromPH(pH: number): number {
      return 14.0 - pH;
    },

    ohFromPOH(pOH: number): number {
      return Math.pow(10, -pOH);
    },

    // Weak acid pH from initial concentration and Ka
    weakAcidPH(c: number, Ka: number): { pH: number; hConc: number; percentDissociated: number } {
      if (c <= 0 || Ka <= 0) return { pH: 7.0, hConc: 1e-7, percentDissociated: 0 };
      // [H+]² + Ka[H+] - Ka*c = 0  => Quadratic: x = (-Ka + sqrt(Ka² + 4*Ka*c)) / 2
      const hConc = (-Ka + Math.sqrt(Ka * Ka + 4 * Ka * c)) / 2;
      const pH = this.pHFromH(hConc);
      const percentDissociated = (hConc / c) * 100;
      return { pH, hConc, percentDissociated };
    },

    // Henderson-Hasselbalch Buffer calculation
    bufferPH(pKa: number, saltConc: number, acidConc: number): number {
      if (acidConc <= 0) return 14.0;
      if (saltConc <= 0) return pKa - 2;
      return pKa + Math.log10(saltConc / acidConc);
    },

    // Generates high-resolution titration curve points (Strong Acid titrated by Strong Base)
    generateTitrationCurve(
      analyteVol_mL: number,
      analyteConc_M: number,
      titrantConc_M: number,
      isAcidAnalyte = true
    ): Array<{ volAdded_mL: number; pH: number; dPH_dV: number }> {
      const points: Array<{ volAdded_mL: number; pH: number; dPH_dV: number }> = [];
      const vEquiv_mL = (analyteConc_M * analyteVol_mL) / titrantConc_M;
      const maxVol = Math.max(vEquiv_mL * 2.0, 50);
      const step = 0.25;

      let prevPH = 0;
      for (let v = 0; v <= maxVol; v += step) {
        let pH = 7.0;
        const totalVol_L = (analyteVol_mL + v) / 1000;

        if (v < vEquiv_mL) {
          // Excess analyte
          const unreactedMoles = (analyteConc_M * analyteVol_mL - titrantConc_M * v) / 1000;
          const conc = unreactedMoles / totalVol_L;
          pH = isAcidAnalyte ? this.pHFromH(conc) : 14 - this.pHFromH(conc);
        } else if (Math.abs(v - vEquiv_mL) < 0.05) {
          // At Equivalence Point
          pH = 7.0;
        } else {
          // Excess titrant
          const excessTitrantMoles = (titrantConc_M * (v - vEquiv_mL)) / 1000;
          const conc = excessTitrantMoles / totalVol_L;
          pH = isAcidAnalyte ? 14 - this.pHFromH(conc) : this.pHFromH(conc);
        }

        // Clamp pH between 0 and 14
        pH = Math.max(0, Math.min(14, pH));
        const dPH_dV = points.length > 0 ? Math.abs((pH - prevPH) / step) : 0;
        prevPH = pH;

        points.push({
          volAdded_mL: Number(v.toFixed(2)),
          pH: Number(pH.toFixed(3)),
          dPH_dV: Number(dPH_dV.toFixed(2))
        });
      }
      return points;
    }
  },

  // 3. Chemical Kinetics & Arrhenius Engine
  kinetics: {
    R_GAS: 8.31446, // J/(mol·K)

    calculateRateConstant(A: number, Ea_kJ: number, T_K: number): number {
      if (T_K <= 0) return 0;
      const Ea_J = Ea_kJ * 1000;
      return A * Math.exp(-Ea_J / (this.R_GAS * T_K));
    },

    calculateReactionRate(k: number, concA: number, concB: number, orderA = 1, orderB = 1): number {
      return k * Math.pow(Math.max(0, concA), orderA) * Math.pow(Math.max(0, concB), orderB);
    },

    // Maxwell-Boltzmann kinetic energy distribution function
    maxwellBoltzmann(E_kJ: number, T_K: number): number {
      if (T_K <= 0 || E_kJ < 0) return 0;
      const RT = (this.R_GAS * T_K) / 1000; // in kJ
      return (2 / Math.sqrt(Math.PI)) * Math.pow(1 / RT, 1.5) * Math.sqrt(E_kJ) * Math.exp(-E_kJ / RT);
    }
  },

  // 4. Chemical Equilibrium Engine
  equilibrium: {
    R_GAS: 8.31446,

    calculateReactionQuotient(concProducts: number[], concReactants: number[]): number {
      const prodTerm = concProducts.reduce((acc, c) => acc * Math.max(1e-9, c), 1);
      const reactTerm = concReactants.reduce((acc, c) => acc * Math.max(1e-9, c), 1);
      return prodTerm / reactTerm;
    },

    // van 't Hoff equation for temperature dependence of equilibrium constant
    calculateKAtTemperature(K1: number, T1_K: number, T2_K: number, deltaH_kJ: number): number {
      const deltaH_J = deltaH_kJ * 1000;
      const exponent = (-deltaH_J / this.R_GAS) * (1 / T2_K - 1 / T1_K);
      return K1 * Math.exp(exponent);
    }
  },

  // 5. Electrochemistry & Nernst Engine
  electrochemistry: {
    F_FARADAY: 96485.3, // C/mol e-
    R_GAS: 8.31446,

    // Standard Daniell Cell E° = +1.10 V (Zn/Cu)
    calculateNernstPotential(E_standard: number, n_electrons: number, Q: number, T_K = 298.15): number {
      if (Q <= 0 || n_electrons <= 0) return E_standard;
      const factor = (this.R_GAS * T_K) / (n_electrons * this.F_FARADAY);
      return E_standard - factor * Math.log(Q);
    },

    calculateGibbsFreeEnergy(n_electrons: number, E_cell: number): number {
      // ΔG = -nFE (in kJ/mol)
      return (-n_electrons * this.F_FARADAY * E_cell) / 1000;
    }
  },

  // 6. Stoichiometry & Yield Engine
  stoichiometry: {
    calculateMoles(mass_g: number, molarMass_g_mol: number): number {
      if (molarMass_g_mol <= 0) return 0;
      return mass_g / molarMass_g_mol;
    },

    calculateMass(moles: number, molarMass_g_mol: number): number {
      return moles * molarMass_g_mol;
    },

    findLimitingReagent(
      reactants: Array<{ name: string; moles: number; coefficient: number; molarMass: number }>
    ): {
      limitingIndex: number;
      limitingName: string;
      maxReactionExtents: number[];
      minExtent: number;
    } {
      const extents = reactants.map(r => (r.coefficient > 0 ? r.moles / r.coefficient : Infinity));
      let minExtent = extents[0] || 0;
      let limitingIndex = 0;

      extents.forEach((ext, idx) => {
        if (ext < minExtent) {
          minExtent = ext;
          limitingIndex = idx;
        }
      });

      return {
        limitingIndex,
        limitingName: reactants[limitingIndex]?.name || 'None',
        maxReactionExtents: extents,
        minExtent
      };
    }
  },

  // 7. Thermochemistry & Calorimetry
  thermochemistry: {
    WATER_SPECIFIC_HEAT: 4.184, // J/(g·°C)

    calculateHeatExchanged(mass_g: number, specificHeat: number, deltaT_C: number): number {
      return mass_g * specificHeat * deltaT_C; // in Joules
    },

    calculateMolarEnthalpy(q_Joules: number, molesReacted: number): number {
      if (molesReacted <= 0) return 0;
      // ΔH = -q / n (in kJ/mol)
      return -(q_Joules / 1000) / molesReacted;
    }
  },

  // 8. Universal Unit Converter
  units: {
    temperature: {
      toKelvin(val: number, unit: 'C' | 'K' | 'F'): number {
        if (unit === 'C') return val + 273.15;
        if (unit === 'F') return (val - 32) * (5 / 9) + 273.15;
        return val;
      },
      fromKelvin(k: number, unit: 'C' | 'K' | 'F'): number {
        if (unit === 'C') return k - 273.15;
        if (unit === 'F') return (k - 273.15) * (9 / 5) + 32;
        return k;
      }
    },
    pressure: {
      toAtm(val: number, unit: 'atm' | 'kPa' | 'bar' | 'mmHg' | 'psi'): number {
        switch (unit) {
          case 'kPa': return val / 101.325;
          case 'bar': return val / 1.01325;
          case 'mmHg': return val / 760;
          case 'psi': return val / 14.6959;
          default: return val;
        }
      },
      fromAtm(atm: number, unit: 'atm' | 'kPa' | 'bar' | 'mmHg' | 'psi'): number {
        switch (unit) {
          case 'kPa': return atm * 101.325;
          case 'bar': return atm * 1.01325;
          case 'mmHg': return atm * 760;
          case 'psi': return atm * 14.6959;
          default: return atm;
        }
      }
    },
    volume: {
      toLiters(val: number, unit: 'L' | 'mL' | 'm3' | 'dm3'): number {
        switch (unit) {
          case 'mL': return val / 1000;
          case 'm3': return val * 1000;
          case 'dm3': return val;
          default: return val;
        }
      },
      fromLiters(l: number, unit: 'L' | 'mL' | 'm3' | 'dm3'): number {
        switch (unit) {
          case 'mL': return l * 1000;
          case 'm3': return l / 1000;
          case 'dm3': return l;
          default: return l;
        }
      }
    }
  }
};
