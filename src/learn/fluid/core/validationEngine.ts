/**
 * EVLab Engineering Validation & Physical Bounds Engine
 */

import { FluidProperty } from '../types';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  code: string;
  title: string;
  message: string;
  suggestedAction?: string;
}

export function validateFluidMechanicsInputs(params: {
  labId: string;
  diameter?: number;
  velocity?: number;
  pressure?: number; // Pa absolute or gauge
  flowRate?: number;
  roughness_mm?: number;
  waterDepth?: number;
  Froude?: number;
  Reynolds?: number;
  fluid?: FluidProperty;
}): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { diameter, velocity, pressure, flowRate, roughness_mm, waterDepth, Froude, Reynolds, fluid } = params;

  // 1. Diameter checks
  if (diameter !== undefined) {
    if (diameter <= 0) {
      issues.push({
        type: 'error',
        code: 'VAL-ERR-001',
        title: 'Non-Physical Conduit Diameter',
        message: `Conduit diameter D must be strictly positive (entered: ${diameter} m).`,
        suggestedAction: 'Set diameter to a value greater than 0.005 m (5 mm).'
      });
    } else if (diameter < 0.005) {
      issues.push({
        type: 'warning',
        code: 'VAL-WRN-001',
        title: 'Microchannel / Capillary Effects',
        message: `Diameter is under 5 mm (${(diameter * 1000).toFixed(1)} mm). Surface tension and capillary forces may dominate standard continuum pipe hydraulics.`,
        suggestedAction: 'Consider microfluidic scaling laws if intentional.'
      });
    } else if (diameter > 10.0) {
      issues.push({
        type: 'info',
        code: 'VAL-INF-001',
        title: 'Large Hydro Tunnel Dimension',
        message: `Conduit diameter exceeds 10 meters (${diameter.toFixed(1)} m), typical for hydroelectric diversion tunnels.`,
      });
    }
  }

  // 2. Velocity checks
  if (velocity !== undefined) {
    if (velocity < 0) {
      issues.push({
        type: 'error',
        code: 'VAL-ERR-002',
        title: 'Negative Velocity Magnitude',
        message: 'Flow speed magnitude must be non-negative in scalar calculations.',
      });
    } else if (velocity > 6.0) {
      issues.push({
        type: 'warning',
        code: 'VAL-WRN-002',
        title: 'Pipe Erosion & Water Hammer Risk',
        message: `Velocity of ${velocity.toFixed(2)} m/s exceeds standard industrial piping limits (typically 1.5 - 3.0 m/s for liquids). High risk of erosion, excessive head loss, and catastrophic water hammer surges.`,
        suggestedAction: 'Increase pipe diameter to reduce flow velocity.'
      });
    } else if (velocity < 0.3 && velocity > 0) {
      issues.push({
        type: 'info',
        code: 'VAL-INF-002',
        title: 'Sediment Deposition Risk (Self-Cleansing)',
        message: `Low flow velocity (${velocity.toFixed(2)} m/s) is below recommended self-cleansing velocity (0.6 - 0.9 m/s) for drainage and slurry lines.`,
      });
    }
  }

  // 3. Pressure & Cavitation Checks
  if (pressure !== undefined && fluid) {
    const atmosphericPressure = 101325; // Pa
    const absolutePressure = pressure < 0 ? atmosphericPressure + pressure : pressure; // if gauge was passed

    if (absolutePressure <= fluid.vaporPressure) {
      issues.push({
        type: 'error',
        code: 'VAL-ERR-003',
        title: 'CAVITATION CRITICAL ALERT',
        message: `Local static pressure (${(absolutePressure / 1000).toFixed(2)} kPa abs) has dropped below the fluid saturation vapor pressure (${(fluid.vaporPressure / 1000).toFixed(2)} kPa abs @ ${fluid.temperature}°C). Liquid will spontaneously boil and form vapor cavities. Imploding bubbles will erode walls and destroy impellers!`,
        suggestedAction: 'Increase inlet pressure, increase pipe diameter, or reduce flow velocity / elevation.'
      });
    } else if (absolutePressure < fluid.vaporPressure * 1.3) {
      issues.push({
        type: 'warning',
        code: 'VAL-WRN-003',
        title: 'Incipient Cavitation Margin Warning',
        message: `Pressure is within 30% of the vapor pressure threshold. Minor turbulence fluctuations may trigger localized cavitation bursts.`,
      });
    }
  }

  // 4. Open Channel Froude Checks
  if (Froude !== undefined) {
    if (Froude > 1.0 && Froude < 1.1) {
      issues.push({
        type: 'warning',
        code: 'VAL-WRN-004',
        title: 'Unstable Near-Critical Flow (Fr ≈ 1.0)',
        message: `Flow is near critical state (Fr = ${Froude.toFixed(2)}). Minor bed irregularities will generate standing surface waves, surging oscillations, and sudden hydraulic jumps.`,
        suggestedAction: 'Design channels distinctly subcritical (Fr < 0.8) or supercritical (Fr > 1.2).'
      });
    } else if (Froude > 12.0) {
      issues.push({
        type: 'warning',
        code: 'VAL-WRN-005',
        title: 'Extreme Supercritical Jet Flow',
        message: `Froude number Fr = ${Froude.toFixed(1)} indicates extremely high kinetic energy, demanding heavy concrete stilling basins and baffle blocks for energy dissipation.`,
      });
    }
  }

  // 5. Reynolds number check
  if (Reynolds !== undefined) {
    if (Reynolds >= 2000 && Reynolds <= 4000) {
      issues.push({
        type: 'info',
        code: 'VAL-INF-003',
        title: 'Transitional Flow Intermittency',
        message: `Reynolds number (${Reynolds.toFixed(0)}) is in the critical transition zone. Friction factor and boundary layer oscillate unpredictably between laminar and turbulent states.`,
      });
    }
  }

  return issues;
}
