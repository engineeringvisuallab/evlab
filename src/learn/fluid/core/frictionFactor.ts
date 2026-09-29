/**
 * EVLab Friction Factor Solver Engine
 * Solves Darcy friction factor f using Colebrook-White, Swamee-Jain, Haaland, and Laminar equations
 */

export interface FrictionFactorResult {
  f: number;
  regime: 'laminar' | 'transitional' | 'turbulent';
  method: 'laminar_exact' | 'colebrook_white' | 'swamee_jain' | 'haaland' | 'churchill';
  relativeRoughness: number; // epsilon / D
  fColebrook: number;
  fSwameeJain: number;
  fHaaland: number;
  iterations?: number;
  reynolds: number;
}

/**
 * Calculates Darcy friction factor f
 * @param Re Reynolds number
 * @param relativeRoughness epsilon / D
 */
export function calculateFrictionFactor(Re: number, relativeRoughness: number): FrictionFactorResult {

  const epsD = Math.max(0, relativeRoughness);

  // Laminar Regime
  if (Re <= 2300) {
    const fLam = Re > 0 ? 64.0 / Re : 0.064;
    return {
      f: fLam,
      regime: 'laminar',
      method: 'laminar_exact',
      relativeRoughness: epsD,
      fColebrook: fLam,
      fSwameeJain: fLam,
      fHaaland: fLam,
      reynolds: Re,
    };
  }

  // Calculate Swamee-Jain explicit approximation
  const swameeTerm = Math.log10(epsD / 3.7 + 5.74 / Math.pow(Re, 0.9));
  const fSwameeJain = 0.25 / Math.pow(swameeTerm, 2);

  // Calculate Haaland explicit approximation
  const haalandTerm = Math.pow(epsD / 3.7, 1.11) + 6.9 / Re;
  const invSqrtFHaaland = -1.8 * Math.log10(haalandTerm);
  const fHaaland = 1.0 / Math.pow(invSqrtFHaaland, 2);

  // Colebrook-White implicit iterative solution (Newton-Raphson)
  // F(x) = x + 2 * log10(epsD / 3.7 + 2.51 * x / Re) = 0 where x = 1 / sqrt(f)
  let x = 1.0 / Math.sqrt(fSwameeJain); // Initial guess from Swamee-Jain
  let iter = 0;
  const maxIter = 50;
  const tol = 1e-7;

  for (iter = 0; iter < maxIter; iter++) {
    const arg = epsD / 3.7 + (2.51 * x) / Re;
    if (arg <= 0) break;
    const F = x + 2.0 * (Math.log(arg) / Math.LN10);
    const dF = 1.0 + (2.0 / Math.LN10) * (2.51 / Re) / arg;
    const dx = F / dF;
    x = x - dx;
    if (Math.abs(dx) < tol) break;
  }

  const fColebrook = 1.0 / (x * x);

  // Transitional Zone (2300 < Re < 4000)
  if (Re < 4000) {
    // Churchill interpolation for smooth transition
    const fLamAt2300 = 64.0 / 2300;
    const t = (Re - 2300) / (4000 - 2300);
    const fTrans = (1 - t) * fLamAt2300 + t * fColebrook;
    return {
      f: fTrans,
      regime: 'transitional',
      method: 'churchill',
      relativeRoughness: epsD,
      fColebrook,
      fSwameeJain,
      fHaaland,
      iterations: iter,
      reynolds: Re,
    };
  }

  // Fully Turbulent Regime
  return {
    f: fColebrook,
    regime: 'turbulent',
    method: 'colebrook_white',
    relativeRoughness: epsD,
    fColebrook,
    fSwameeJain,
    fHaaland,
    iterations: iter,
    reynolds: Re,
  };
}

export const solveFrictionFactor = calculateFrictionFactor;

