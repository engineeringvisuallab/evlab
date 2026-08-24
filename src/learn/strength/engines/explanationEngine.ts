import { TopicId } from '../types';

export interface ExplanationResult {
  headline: string;
  causalityChain: string[];
  physicsMechanisms: string[];
  mathematicalProportionality: string;
  engineeringTakeaway: string;
  warningNotice?: string;
}

export function generateEngineeringExplanation(
  topicId: TopicId,
  context: {
    paramName: string;
    oldVal: number | string;
    newVal: number | string;
    metrics: Record<string, any>;
  }
): ExplanationResult {
  const { paramName, oldVal, newVal, metrics } = context;

  switch (topicId) {
    case 'beam_bending':
    case 'flexural_stress':
    case 'beam_deflection': {
      if (paramName.toLowerCase().includes('depth') || paramName.toLowerCase().includes('height')) {
        return {
          headline: 'Cubic Stiffness Scaling: Dramatic Impact of Beam Depth',
          causalityChain: [
            `Beam depth changed from ${oldVal} mm to ${newVal} mm`,
            `Moment of Inertia Ix changed cubically (Ix ∝ h³)`,
            `Section Modulus Z changed quadratically (Z ∝ h²)`,
            `Flexural stress σ = M/Z decreased, and elastic deflection δ = f(M)/EI reduced dramatically`,
          ],
          physicsMechanisms: [
            'Extreme fibers are placed further away from the neutral axis, creating a longer internal resisting moment arm.',
            'Material positioned at the outer surfaces resists bending with maximum mechanical leverage.',
            'Doubling depth increases bending stiffness by 8× while only doubling the weight/area.',
          ],
          mathematicalProportionality: 'Ix ∝ h³ (Cubic), Zx ∝ h² (Quadratic), δ_max ∝ 1/h³ (Inverse Cubic)',
          engineeringTakeaway: 'In structural engineering, increasing section depth is 4× to 8× more efficient for controlling deflection and bending stress than increasing section width.',
        };
      }
      if (paramName.toLowerCase().includes('span') || paramName.toLowerCase().includes('length')) {
        return {
          headline: 'Cubic Deflection & Quadratic Bending Scaling with Span Length',
          causalityChain: [
            `Span length changed from ${oldVal} m to ${newVal} m`,
            `Bending moment M scaled with span (M ∝ L for point loads, M ∝ L² for UDL)`,
            `Deflection scaled cubically (δ ∝ L³ for point loads, δ ∝ L⁴ for UDL)`,
            `Structural stiffness and resonance frequency dropped significantly`,
          ],
          physicsMechanisms: [
            'Longer spans increase the lever arm of loads relative to supports, escalating internal bending moments.',
            'Curvature integrates over a longer physical distance, amplifying tip/midspan displacements.',
          ],
          mathematicalProportionality: 'M_max ∝ L² (UDL) / L (Point), Deflection δ_max ∝ L⁴ (UDL) / L³ (Point)',
          engineeringTakeaway: 'Doubling span length causes an 8× to 16× increase in deflection under identical loads, requiring substantial increases in moment of inertia Ix.',
        };
      }
      return {
        headline: `Parameter Adjustment Impact: ${paramName}`,
        causalityChain: [
          `${paramName} updated from ${oldVal} to ${newVal}`,
          `Internal stress distribution and equilibrium balance recalculated`,
          `Current peak stress: ${metrics.maxFlexuralStressMPa || metrics.stressMPa || 0} MPa, Safety Factor: ${metrics.safetyFactor || 0}`,
        ],
        physicsMechanisms: [
          'Linear elastic response distributes internal forces according to geometric sectional properties.',
        ],
        mathematicalProportionality: 'Standard Euler-Bernoulli flexure relations',
        engineeringTakeaway: 'Ensure utilization ratio remains below 1.0 (SF > 1.5 for static structural codes).',
      };
    }

    case 'torsion': {
      return {
        headline: 'Fourth-Power Stiffness Scaling in Shaft Torsion',
        causalityChain: [
          `Shaft parameter ${paramName} changed from ${oldVal} to ${newVal}`,
          `Polar moment of inertia J scaled with the 4th power of diameter (J = π·d⁴ / 32)`,
          `Torsional shear stress τ = T·c/J scaled inversely with the 3rd power (τ ∝ 1/d³)`,
          `Angle of twist θ = TL/GJ reduced by the 4th power (θ ∝ 1/d⁴)`,
        ],
        physicsMechanisms: [
          'Shear stress varies linearly from zero at the shaft centerline to maximum at the outer skin.',
          'Material near the outer radius provides the dominant portion of torsional resistance.',
          'Hollow shafts remove the low-stressed central core, offering superior torque-to-weight ratios.',
        ],
        mathematicalProportionality: 'J ∝ d⁴ (Fourth Power), τ_max ∝ 1/d³ (Inverse Cubic), θ ∝ 1/d⁴ (Inverse Quartic)',
        engineeringTakeaway: 'A 20% increase in shaft diameter nearly doubles its torque capacity (1.20³ = 1.73×) and reduces twist angle by over 50% (1.20⁴ = 2.07×).',
      };
    }

    case 'columns_buckling': {
      return {
        headline: 'Inverse Square Stability: Euler Buckling Bifurcation',
        causalityChain: [
          `Column parameter ${paramName} adjusted from ${oldVal} to ${newVal}`,
          `Effective length Leff = K·L modified the column slenderness ratio λ = Leff/r`,
          `Critical buckling capacity scaled inversely with length squared (P_cr ∝ 1/L²)`,
          `Buckling governs failure when critical buckling stress σ_cr falls below material yield strength σ_y`,
        ],
        physicsMechanisms: [
          'Buckling is an elastic instability phenomenon, not a material strength failure.',
          'When axial compressive load reaches P_cr, the straight equilibrium becomes unstable, causing lateral deflection without warning.',
          'End boundary conditions drastically alter capacity: Fixed-Fixed columns hold 4× the load of Pin-Pin columns of identical length.',
        ],
        mathematicalProportionality: 'P_cr ∝ 1/(K·L)² (Inverse Square of Effective Length), P_cr ∝ I_min (Linear in weak-axis inertia)',
        engineeringTakeaway: 'Always design compression members about their weak axis (minimum I) and brace intermediate points to reduce unbraced length L.',
      };
    }

    case 'mohrs_circle':
    case 'principal_stress': {
      return {
        headline: 'Stress State Transformation & Principal Planes',
        causalityChain: [
          `Stress component ${paramName} transformed to ${newVal}`,
          `Mohr’s circle center σ_avg and radius R = τ_max updated`,
          `Element orientation θ produced simultaneous normal and shear stress redistribution on rotated planes`,
          `Principal planes θp experience maximum/minimum normal stresses with zero shear stress (τ = 0)`,
        ],
        physicsMechanisms: [
          'Stresses depend strictly on the orientation of the cutting plane through the material.',
          'Ductile materials typically fail in shear along maximum shear planes (at 45° to principal planes).',
          'Brittle materials (like cast iron or concrete) fail in tension normal to the maximum principal stress plane σ₁.',
        ],
        mathematicalProportionality: 'σ_θ = σ_avg + (σ_x - σ_y)/2 · cos(2θ) + τ_xy · sin(2θ)',
        engineeringTakeaway: 'Never design solely against applied Cartesian stresses (σx, σy); always evaluate principal stresses (σ₁, σ₂) and equivalent von Mises / Tresca criteria.',
      };
    }

    case 'stress_strain_lab':
    case 'hookes_law': {
      return {
        headline: 'Constitutive Material Response: Elastic to Plastic Transition',
        causalityChain: [
          `Tensile load/strain modified on specimen`,
          `Linear elastic range governed by Hooke’s Law: σ = E·ε`,
          `Atomic lattice stretching transitions into irreversible dislocation slip upon reaching yield strength σ_y`,
          `Strain hardening increases load capacity until ultimate strength σ_u, followed by necking and ductile fracture`,
        ],
        physicsMechanisms: [
          'Elastic deformation is reversible (energy stored as elastic resilience).',
          'Plastic deformation absorbs large fracture energy (toughness) via permanent crystalline slip.',
        ],
        mathematicalProportionality: 'Elastic: σ = E·ε (Linear), Plastic: Hollomon power law σ = K·ε^n',
        engineeringTakeaway: 'Ductile metals provide valuable warning before failure through visible plastic deformation, whereas brittle materials fail abruptly at negligible plastic strain.',
      };
    }

    default: {
      return {
        headline: 'Equilibrium & Internal Stress Redistribution',
        causalityChain: [
          `${paramName} changed from ${oldVal} to ${newVal}`,
          `Internal stress and strain tensor updated across member cross-section`,
          `Safety Factor: ${metrics.safetyFactor || 'N/A'}`,
        ],
        physicsMechanisms: [
          'Internal resisting forces maintain static equilibrium with externally applied structural loads.',
        ],
        mathematicalProportionality: 'Proportional structural response based on governing equations',
        engineeringTakeaway: 'Maintain safety factor above 1.5 for reliable civil/mechanical engineering applications.',
      };
    }
  }
}
