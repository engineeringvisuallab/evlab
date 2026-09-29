/**
 * EVLab WaterFlow - Hydraulic Calculation Engine
 * Implements deterministic network hydraulic solver using Hazen-Williams & Darcy-Weisbach formulations.
 */

import {
  NetworkModel,
  NetworkNode,
  NetworkLink,
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  SimulationSettings,
  SimulationDiagnostics
} from '../../types/waterflow';

const GRAVITY = 9.81; // m/s2
const WATER_DENSITY = 1000; // kg/m3

export class HydraulicSolver {
  /**
   * Main simulation solver entry point.
   */
  static solve(model: NetworkModel, settings: SimulationSettings): {
    updatedModel: NetworkModel;
    diagnostics: SimulationDiagnostics;
  } {
    const startTime = performance.now();
    const logs: { type: 'info' | 'warning' | 'error'; message: string; timestamp: string }[] = [];
    
    const addLog = (type: 'info' | 'warning' | 'error', message: string) => {
      logs.push({
        type,
        message,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    addLog('info', `Starting hydraulic calculation using ${settings.headlossFormula} method...`);

    // Extract elements from model or active scenario
    const nodesMap = new Map<string, NetworkNode>();
    const linksMap = new Map<string, NetworkLink>();

    // Copy nodes
    const rawNodes = model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
    rawNodes.forEach(n => nodesMap.set(n.id, { ...n }));

    // Copy links
    const rawLinks = model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
    rawLinks.forEach(l => linksMap.set(l.id, { ...l }));

    // Apply Scenario overrides if active scenario exists
    const activeScenario = model.scenarios?.find(s => s.id === model.activeScenarioId);
    if (activeScenario) {
      addLog('info', `Applying scenario parameters: "${activeScenario.name}" (Demand Factor: ${activeScenario.demandMultiplier}x)`);
      
      // Multiply junction demands
      nodesMap.forEach(node => {
        if (node.type === 'junction') {
          node.baseDemand *= activeScenario.demandMultiplier;
          if (activeScenario.overrides?.nodeDemands?.[node.id] !== undefined) {
            node.baseDemand = activeScenario.overrides.nodeDemands[node.id];
          }
        }
      });

      // Override pipe status/roughness
      linksMap.forEach(link => {
        if (link.type === 'pipe') {
          if (activeScenario.overrides?.pipeStatus?.[link.id]) {
            link.status = activeScenario.overrides.pipeStatus[link.id];
          }
          if (activeScenario.overrides?.pipeRoughness?.[link.id]) {
            link.roughness = activeScenario.overrides.pipeRoughness[link.id];
          }
        }
      });
    }

    // Identify fixed head nodes (Reservoirs and Tanks)
    const fixedHeadNodes = new Set<string>();
    nodesMap.forEach(node => {
      if (node.type === 'reservoir') {
        node.totalHead = node.totalHead || (node.elevation + 30);
        node.hydraulicGrade = node.totalHead;
        fixedHeadNodes.add(node.id);
      } else if (node.type === 'tank') {
        const head = node.elevation + (node.currentLevel ?? node.initLevel);
        node.hydraulicGrade = head;
        node.totalHead = head;
        fixedHeadNodes.add(node.id);
      } else {
        // Initial estimate for junctions: max boundary head or elevation + 20m
        node.hydraulicGrade = node.elevation + 20;
      }
    });

    if (fixedHeadNodes.size === 0) {
      addLog('error', 'Network has no boundary condition! At least one Reservoir or Tank is required.');
      return {
        updatedModel: model,
        diagnostics: {
          converged: false,
          iterations: 0,
          maxResidual: 999,
          totalSystemDemand: 0,
          totalSystemSupply: 0,
          totalFrictionLosses: 0,
          pumpEnergyKW: 0,
          logMessages: logs
        }
      };
    }

    // Initialize link flows (estimated or 10 L/s)
    linksMap.forEach(link => {
      link.flow = link.status === 'CLOSED' ? 0 : 10.0; // L/s
    });

    // Iterative Newton-Raphson Node Head Method Solver
    let converged = false;
    let iter = 0;
    const maxIter = settings.maxIterations || 100;
    const tol = settings.accuracyTolerance || 0.0001; // meters head
    let maxResidualHeadChange = 999;

    const junctions = Array.from(nodesMap.values()).filter(n => n.type === 'junction') as Junction[];

    while (iter < maxIter && !converged) {
      iter++;
      maxResidualHeadChange = 0;

      // For each junction, calculate net flow imbalance & derivative w.r.t head
      for (const junc of junctions) {
        let sumQ = -junc.baseDemand; // Demand leaves junction (negative)
        let sumdQdH = 0;

        // Find all connected links
        linksMap.forEach(link => {
          if (link.status === 'CLOSED') return;

          let isStart = link.startNodeId === junc.id;
          let isEnd = link.endNodeId === junc.id;

          if (!isStart && !isEnd) return;

          const otherNodeId = isStart ? link.endNodeId : link.startNodeId;
          const otherNode = nodesMap.get(otherNodeId);
          if (!otherNode) return;

          const hJunc = junc.hydraulicGrade || (junc.elevation + 20);
          const hOther = otherNode.hydraulicGrade || (otherNode.elevation + 20);

          // Flow direction: from higher head to lower head
          let dH = isStart ? (hJunc - hOther) : (hOther - hJunc);

          let qLink = 0;
          let dQdH_link = 0;

          if (link.type === 'pipe') {
            const pipe = link as Pipe;
            const res = this.calculatePipeFlowAndDerivative(pipe, Math.abs(dH), settings.headlossFormula);
            qLink = dH >= 0 ? -res.q : res.q; // If hJunc > hOther, flow leaves junc
            dQdH_link = res.dqdh;
          } else if (link.type === 'pump') {
            const pump = link as Pump;
            if (pump.status === 'OFF') {
              qLink = 0;
              dQdH_link = 0;
            } else {
              // Pump adds head: hOther = hJunc + H_pump (if start=junc)
              const headGain = isStart ? (hOther - hJunc) : (hJunc - hOther);
              const pumpRes = this.calculatePumpFlow(pump, headGain);
              qLink = isStart ? pumpRes.q : -pumpRes.q;
              dQdH_link = pumpRes.dqdh;
            }
          } else if (link.type === 'valve') {
            const valve = link as Valve;
            // Valve loss approximation
            const res = this.calculateValveFlow(valve, dH);
            qLink = dH >= 0 ? -res.q : res.q;
            dQdH_link = res.dqdh;
          }

          sumQ += qLink;
          sumdQdH += dQdH_link;
        });

        // Newton step: deltaH = - sumQ / sumdQdH
        if (Math.abs(sumdQdH) > 1e-9) {
          let deltaH = sumQ / sumdQdH;
          // Relaxation dampening to avoid oscillation
          if (Math.abs(deltaH) > 20) {
            deltaH = Math.sign(deltaH) * 20;
          }

          const oldH = junc.hydraulicGrade || (junc.elevation + 20);
          let newH = oldH + deltaH;

          // Keep head above ground elevation by at least -50m
          if (newH < junc.elevation - 50) newH = junc.elevation - 50;

          junc.hydraulicGrade = newH;
          const headChange = Math.abs(newH - oldH);
          if (headChange > maxResidualHeadChange) {
            maxResidualHeadChange = headChange;
          }
        }
      }

      if (maxResidualHeadChange < tol) {
        converged = true;
      }
    }

    addLog(
      converged ? 'info' : 'warning',
      `Solver finished in ${iter} iterations with max head change = ${maxResidualHeadChange.toFixed(6)} m.`
    );

    // Calculate final link flows, velocities, headlosses, and node pressures
    let totalDemand = 0;
    let totalSupply = 0;
    let totalHeadloss = 0;
    let totalPumpPowerKW = 0;

    // Node pressures & actual demands
    nodesMap.forEach(node => {
      const hg = node.hydraulicGrade || node.elevation;
      const headMeters = hg - node.elevation;
      node.pressure = headMeters * 9.80665; // kPa

      if (node.type === 'junction') {
        const j = node as Junction;
        j.actualDemand = j.baseDemand;
        totalDemand += j.baseDemand;
      }
    });

    // Link hydraulics calculation
    linksMap.forEach(link => {
      const startNode = nodesMap.get(link.startNodeId);
      const endNode = nodesMap.get(link.endNodeId);

      if (!startNode || !endNode) return;

      const h1 = startNode.hydraulicGrade || startNode.elevation;
      const h2 = endNode.hydraulicGrade || endNode.elevation;
      const dH = h1 - h2;

      if (link.type === 'pipe') {
        const pipe = link as Pipe;
        if (pipe.status === 'CLOSED') {
          pipe.flow = 0;
          pipe.velocity = 0;
          pipe.headloss = 0;
          pipe.headlossGradient = 0;
        } else {
          const res = this.calculatePipeFlowAndDerivative(pipe, Math.abs(dH), settings.headlossFormula);
          pipe.flow = dH >= 0 ? res.q : -res.q; // positive = start -> end
          
          // Velocity = Q (m3/s) / A (m2)
          const qM3S = Math.abs(pipe.flow) / 1000.0;
          const diameterM = pipe.diameter / 1000.0;
          const areaM2 = (Math.PI * diameterM * diameterM) / 4.0;
          pipe.velocity = areaM2 > 0 ? qM3S / areaM2 : 0;

          pipe.headloss = Math.abs(dH);
          const lengthKm = pipe.length / 1000.0;
          pipe.headlossGradient = lengthKm > 0 ? pipe.headloss / lengthKm : 0;

          // Reynolds number: Re = V * D / nu (kinematic viscosity ~ 1.004e-6 m2/s for water at 20C)
          const nu = 1.004e-6;
          pipe.reynoldsNumber = (pipe.velocity * diameterM) / nu;

          totalHeadloss += pipe.headloss;
        }
      } else if (link.type === 'pump') {
        const pump = link as Pump;
        if (pump.status === 'OFF') {
          pump.flow = 0;
          pump.headGain = 0;
          pump.powerConsumption = 0;
        } else {
          const headGain = h2 - h1; // Head added by pump
          const pumpRes = this.calculatePumpFlow(pump, headGain);
          pump.flow = pumpRes.q;
          pump.headGain = Math.max(0, headGain);

          // Power = (rho * g * Q * H) / efficiency
          const qM3S = Math.abs(pump.flow) / 1000.0;
          const eff = (pump.efficiency || 75) / 100.0;
          pump.powerConsumption = (WATER_DENSITY * GRAVITY * qM3S * pump.headGain) / (eff * 1000.0); // kW
          totalPumpPowerKW += pump.powerConsumption;
        }
      } else if (link.type === 'valve') {
        const valve = link as Valve;
        const res = this.calculateValveFlow(valve, dH);
        valve.flow = dH >= 0 ? res.q : -res.q;
        const qM3S = Math.abs(valve.flow) / 1000.0;
        // Assume 150mm valve pipe equivalent
        const areaM2 = (Math.PI * 0.15 * 0.15) / 4.0;
        valve.velocity = qM3S / areaM2;
        valve.headloss = Math.abs(dH);
      }
    });

    // Net reservoir/tank supply
    fixedHeadNodes.forEach(id => {
      let netFlow = 0;
      linksMap.forEach(link => {
        if (link.startNodeId === id) {
          netFlow += link.flow || 0; // Leaving reservoir = positive supply
        } else if (link.endNodeId === id) {
          netFlow -= link.flow || 0; // Entering reservoir
        }
      });

      const node = nodesMap.get(id);
      if (node && (node.type === 'reservoir' || node.type === 'tank')) {
        (node as Reservoir | Tank).netInflow = -netFlow;
        if (netFlow > 0) totalSupply += netFlow;
      }
    });

    const duration = (performance.now() - startTime).toFixed(1);
    addLog('info', `Simulation completed successfully in ${duration} ms.`);

    // Build updated model structure
    const updatedModel: NetworkModel = {
      ...model,
      nodes: nodesMap,
      links: linksMap
    };

    return {
      updatedModel,
      diagnostics: {
        converged,
        iterations: iter,
        maxResidual: maxResidualHeadChange,
        totalSystemDemand: Math.round(totalDemand * 100) / 100,
        totalSystemSupply: Math.round(totalSupply * 100) / 100,
        totalFrictionLosses: Math.round(totalHeadloss * 100) / 100,
        pumpEnergyKW: Math.round(totalPumpPowerKW * 100) / 100,
        logMessages: logs
      }
    };
  }

  /**
   * Helper: Pipe flow Q (L/s) given headloss hf (m) using Hazen-Williams or Darcy-Weisbach
   */
  private static calculatePipeFlowAndDerivative(
    pipe: Pipe,
    headlossMeters: number,
    formula: 'Hazen-Williams' | 'Darcy-Weisbach' | 'Chezy-Manning'
  ): { q: number; dqdh: number } {
    if (headlossMeters < 1e-6 || pipe.length <= 0 || pipe.diameter <= 0) {
      return { q: 0, dqdh: 1e-4 };
    }

    const D_m = pipe.diameter / 1000.0; // mm -> m
    const L_m = pipe.length; // m

    if (formula === 'Hazen-Williams') {
      // hf = 10.67 * L * Q^1.852 / (C^1.852 * D^4.871) for Q in m3/s
      const C = pipe.roughness || 130;
      const K_hw = (10.67 * L_m) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.871));

      // Q_m3s = (hf / K_hw) ^ (1 / 1.852)
      const q_m3s = Math.pow(headlossMeters / K_hw, 1 / 1.852);
      const q_lps = q_m3s * 1000.0;

      // dQ/dhf = (1 / (1.852 * K_hw)) * (hf / K_hw) ^ (1/1.852 - 1)
      const dqdh_m3s = (1 / (1.852 * K_hw)) * Math.pow(headlossMeters / K_hw, (1 / 1.852) - 1);
      const dqdh_lps = dqdh_m3s * 1000.0;

      return { q: q_lps, dqdh: Math.max(1e-4, dqdh_lps) };
    } else {
      // Darcy-Weisbach: hf = f * (L/D) * (V^2 / 2g) = [8 f L / (pi^2 g D^5)] * Q^2
      // Swamee-Jain approximation for f (roughness height e in mm -> m)
      const e_m = (pipe.roughness || 0.05) / 1000.0; // mm -> m
      const f_estimate = 0.25 / Math.pow(Math.log10(e_m / (3.7 * D_m) + 5.74 / Math.pow(40000, 0.9)), 2);

      const K_dw = (8.0 * f_estimate * L_m) / (Math.PI * Math.PI * GRAVITY * Math.pow(D_m, 5));

      const q_m3s = Math.sqrt(headlossMeters / K_dw);
      const q_lps = q_m3s * 1000.0;

      // dQ/dh = 1 / (2 * sqrt(K_dw * h))
      const dqdh_m3s = 1.0 / (2.0 * Math.sqrt(K_dw * headlossMeters));
      const dqdh_lps = dqdh_m3s * 1000.0;

      return { q: q_lps, dqdh: Math.max(1e-4, dqdh_lps) };
    }
  }

  /**
   * Helper: Pump flow Q (L/s) given head gain H (m)
   */
  private static calculatePumpFlow(pump: Pump, headGain: number): { q: number; dqdh: number } {
    const designQ = pump.designFlow || 50; // L/s
    const designH = pump.designHead || 40; // m
    const shutoffH = pump.shutoffHead || designH * 1.33; // m

    // Quadratic pump curve: H_pump = shutoffH - A * Q^2
    // At design point: designH = shutoffH - A * designQ^2  =>  A = (shutoffH - designH) / designQ^2
    const A = Math.max(1e-6, (shutoffH - designH) / (designQ * designQ));

    // headGain = shutoffH - A * Q^2  => Q = sqrt((shutoffH - headGain) / A)
    if (headGain >= shutoffH) {
      return { q: 0, dqdh: 1e-4 };
    }

    const diffH = Math.max(0.1, shutoffH - headGain);
    const q_lps = Math.sqrt(diffH / A);

    // dQ/dH = -1 / (2 * A * Q)
    const dqdh = 1.0 / (2.0 * A * Math.max(1, q_lps));

    return { q: q_lps, dqdh };
  }

  /**
   * Helper: Valve flow
   */
  private static calculateValveFlow(valve: Valve, dH: number): { q: number; dqdh: number } {
    const head = Math.abs(dH);
    // K_valve minor loss
    const K = valve.minorLoss || 2.0;
    const D_m = 0.15; // 150mm equivalent
    const K_val = K / (2 * GRAVITY * Math.pow((Math.PI * D_m * D_m) / 4, 2));

    const q_m3s = Math.sqrt(head / Math.max(1e-4, K_val));
    const q_lps = q_m3s * 1000.0;
    const dqdh = 1.0 / (2.0 * Math.sqrt(Math.max(1e-4, K_val * head))) * 1000.0;

    return { q: q_lps, dqdh: Math.max(1e-4, dqdh) };
  }
}
