/**
 * EVLab Engineering Interpretation & Physical Insights Card
 * Explains "What is physically happening?", "Why did the numbers change?",
 * and real-world engineering consequences (e.g. cavitation risk, water hammer, pump sizing).
 */

import React from 'react';
import { LabTopicId } from '../../types';
import { Lightbulb, Compass, AlertCircle, TrendingUp } from 'lucide-react';

interface EngineeringInterpretationCardProps {
  labId: LabTopicId;
  parameters: Record<string, any>;
  results: Record<string, any>;
}

export const EngineeringInterpretationCard: React.FC<EngineeringInterpretationCardProps> = ({
  labId,
  parameters,
  results,
}) => {
  const getInterpretationContent = () => {
    switch (labId) {
      case 'continuity': {
        const areaRatio = results.areaRatio || 4.0;
        const v1 = results.v1 || 1.0;
        const v2 = results.v2 || 4.0;
        return {
          physics: `Due to incompressibility and mass conservation (ρ = const), reducing the cross-sectional area by a factor of ${areaRatio.toFixed(1)} forces the fluid parcels to accelerate by the exact reciprocal factor (${(v2 / Math.max(0.001, v1)).toFixed(2)}× speed increase).`,
          why: `Fluid velocity is inversely proportional to diameter squared (V ∝ 1/D²). Even minor conduit necking creates sharp velocity amplification and convective momentum flux.`,
          engineeringImpact: `High local velocities dramatically increase dynamic velocity head (V²/2g) and wall friction losses (hf ∝ V²), causing severe pressure drops that may induce cavitation at sharp contractions or nozzle entries.`
        };
      }
      case 'bernoulli': {
        const hgl1 = results.hgl1 || 10;
        const hgl2 = results.hgl2 || 8;
        return {
          physics: `Mechanical energy is conserved along streamlines between potential (elevation z), static pressure (P/γ), and kinetic (V²/2g) heads, minus irreversible viscous friction dissipation (h_L).`,
          why: `As fluid rises in elevation or speeds up, static pressure head is converted into potential and kinetic energy heads.`,
          engineeringImpact: `The Hydraulic Grade Line (HGL) must always remain safely above the pipeline summit. If the HGL drops below pipe elevation, gauge pressure becomes negative. If absolute pressure reaches vapor pressure, the fluid cavitates and breaks the flow column.`
        };
      }
      case 'reynolds': {
        const Re = results.reynolds || 2000;
        const regime = results.regime || 'laminar';
        return {
          physics: `The Reynolds number (${Re.toFixed(0)}) measures the ratio of momentum inertia to viscous shear forces. Current state is ${regime.toUpperCase()}.`,
          why: regime === 'laminar'
            ? 'Viscous shear damping smoothly dampens out minor fluid perturbations, maintaining straight concentric streamline lamina with a parabolic velocity profile.'
            : regime === 'transitional'
            ? 'Inertial disturbances begin to overcome viscous damping, triggering intermittent bursts of turbulent eddies and vortex formation.'
            : 'Inertial forces dominate, causing 3D chaotic vortex cascades, intense cross-stream momentum mixing, and a flattened power-law velocity profile.',
          engineeringImpact: `Turbulent flow causes 5× to 10× higher wall shear stress and pressure drop than laminar flow, but greatly enhances heat exchange and chemical mixing in reactors.`
        };
      }
      case 'pipe-flow':
      case 'pipe-roughness':
      case 'minor-loss': {
        const f = results.frictionFactor || 0.02;
        const hf = results.hf || 2.0;
        const hMinor = results.hMinor || 0.5;
        return {
          physics: `Viscous boundary layers at the pipe walls exert continuous shear resistance, causing a friction head loss of ${hf.toFixed(3)} m. Minor fittings contribute an additional ${(hMinor || 0).toFixed(3)} m of localized turbulent eddy dissipation.`,
          why: `Darcy friction factor f (${f.toFixed(4)}) is governed by the relative roughness ε/D and Reynolds number. In rough turbulent flow, boundary roughness elements protrude through the laminar sublayer, making friction independent of viscosity.`,
          engineeringImpact: `Total head loss directly dictates the sizing, kilowatt power rating, and electrical energy cost of the delivery pump station. Aging pipes can suffer from 10× roughness growth due to tuberculation and scaling.`
        };
      }
      case 'venturi': {
        const deltaH = results.deltaH || 1.2;
        return {
          physics: `Flow acceleration in the throat constriction converts static pressure into kinetic energy, creating a differential piezometric head of Δh = ${deltaH.toFixed(3)} m.`,
          why: `The discharge coefficient Cd (${results.Cd || 0.98}) accounts for boundary layer growth and minor friction losses in the converging cone.`,
          engineeringImpact: `Venturi meters provide highly accurate flow measurement with >85% pressure recovery in the gradual 7° diffuser cone, unlike sharp orifice plates which lose significant energy to permanent vortex recirculation.`
        };
      }
      case 'open-channel':
      case 'froude': {
        const Fr = results.Fr || 0.6;
        const regime = results.regime || 'subcritical';
        return {
          physics: `Free surface flow with Froude number Fr = ${Fr.toFixed(3)} (${regime.toUpperCase()}). Gravity is the primary restoring force for surface waves moving at c = √(gy).`,
          why: regime === 'subcritical'
            ? 'Surface wave velocity is faster than flow velocity (c > V), meaning downstream disturbances (such as a gate or weir) can propagate upstream and control water depth.'
            : 'Flow velocity exceeds surface wave speed (V > c), meaning downstream conditions cannot propagate upstream; flow is shooting and supercritical.',
          engineeringImpact: `Canals are typically designed subcritical (Fr < 0.8) to prevent standing wave oscillations, bed scour, and spontaneous hydraulic jumps at channel bends.`
        };
      }
      case 'hydraulic-jump': {
        const Fr1 = results.Fr1 || 3.0;
        const deltaE = results.energyLoss_DeltaE || 0.8;
        const eff = results.dissipationEfficiency_pct || 40;
        return {
          physics: `A stationary hydraulic shock wave occurs where high-speed supercritical shooting flow (Fr₁ = ${Fr1.toFixed(2)}) abruptly transitions to tranquil subcritical flow, dissipating ${deltaE.toFixed(3)} m of energy (${eff.toFixed(1)}% efficiency).`,
          why: `Momentum conservation governs across the jump: the upstream momentum force plus hydrostatic thrust equals downstream force, creating a severe turbulent roller vortex that converts kinetic energy into heat.`,
          engineeringImpact: `Hydraulic jumps are engineered in dam spillway stilling basins to dissipate destructive kinetic energy before returning water to natural riverbeds, preventing foundation undermining and catastrophic erosion.`
        };
      }
      case 'pumps':
      case 'pump-curves': {
        const power = results.hydraulicPower_kW || 10;
        return {
          physics: `The centrifugal impeller transfers angular momentum (Euler turbine equation) to fluid, increasing both static pressure and velocity head.`,
          why: `The operating point is the exact dynamic equilibrium where the pump supply head H(Q) intersects the piping system demand curve Hsys(Q) = Hstatic + K·Q².`,
          engineeringImpact: `Operating too far to the right of Best Efficiency Point (BEP) causes motor overload and cavitation in the impeller eye (NPSHa < NPSHr). Throttling discharge valves increases system resistance K, shifting the duty point left.`
        };
      }
      default:
        return {
          physics: 'Fluid mechanics governing equations are in dynamic balance for this conduit geometry.',
          why: 'Parameters govern mass, momentum, and energy conservation across the system.',
          engineeringImpact: 'Monitor velocity limits, pressure grade lines, and energy dissipation.'
        };
    }
  };

  const content = getInterpretationContent();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Physical Phenomenon & Engineering Interpretation</span>
        </h4>
        <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
          Physics Insights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* 1. What is physically happening */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Physical Mechanism</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{content.physics}</p>
        </div>

        {/* 2. Why did the result change */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Theoretical Causality</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{content.why}</p>
        </div>

        {/* 3. Real-world engineering impact */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Engineering Consequence</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{content.engineeringImpact}</p>
        </div>
      </div>
    </div>
  );
};
