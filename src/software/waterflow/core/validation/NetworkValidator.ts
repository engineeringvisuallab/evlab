/**
 * EVLab WaterFlow - Network Validation Engine
 * Audits model topology, node elevation data, pipe geometries, boundary conditions, and hydraulic ranges.
 */

import { NetworkModel, ValidationIssue, NetworkNode, NetworkLink, Pipe, Junction } from '../../types/waterflow';

export class NetworkValidator {
  static validate(model: NetworkModel): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const nodes = model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
    const links = model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);

    const nodeIds = new Set(nodes.map(n => n.id));
    const linkIds = new Set(links.map(l => l.id));

    // 1. Check duplicate IDs
    if (nodes.length !== nodeIds.size) {
      issues.push({
        id: 'dup-node-id',
        severity: 'ERROR',
        category: 'Topology',
        message: 'Duplicate Node IDs found in the network.',
        recommendation: 'Ensure every node has a unique identifier.'
      });
    }

    if (links.length !== linkIds.size) {
      issues.push({
        id: 'dup-link-id',
        severity: 'ERROR',
        category: 'Topology',
        message: 'Duplicate Link IDs found in the network.',
        recommendation: 'Ensure every pipe, pump, and valve has a unique identifier.'
      });
    }

    // 2. Boundary conditions
    const reservoirsAndTanks = nodes.filter(n => n.type === 'reservoir' || n.type === 'tank');
    if (reservoirsAndTanks.length === 0) {
      issues.push({
        id: 'no-boundary',
        severity: 'ERROR',
        category: 'Topology',
        message: 'No boundary condition found (Reservoir or Tank missing).',
        recommendation: 'Add at least one Reservoir or Storage Tank to supply pressure/head to the network.'
      });
    }

    // 3. Node connectivity count
    const nodeConnectionCounts: Record<string, number> = {};
    nodes.forEach(n => (nodeConnectionCounts[n.id] = 0));

    links.forEach(l => {
      // Check link endpoints
      if (!nodeIds.has(l.startNodeId)) {
        issues.push({
          id: `missing-start-${l.id}`,
          elementId: l.id,
          elementType: l.type,
          severity: 'ERROR',
          category: 'Topology',
          message: `Link ${l.label} (${l.id}) start node "${l.startNodeId}" does not exist.`,
          recommendation: 'Connect link to a valid junction, reservoir, or tank.'
        });
      } else {
        nodeConnectionCounts[l.startNodeId]++;
      }

      if (!nodeIds.has(l.endNodeId)) {
        issues.push({
          id: `missing-end-${l.id}`,
          elementId: l.id,
          elementType: l.type,
          severity: 'ERROR',
          category: 'Topology',
          message: `Link ${l.label} (${l.id}) end node "${l.endNodeId}" does not exist.`,
          recommendation: 'Connect link to a valid junction, reservoir, or tank.'
        });
      } else {
        nodeConnectionCounts[l.endNodeId]++;
      }
    });

    // Check disconnected nodes
    nodes.forEach(n => {
      if ((nodeConnectionCounts[n.id] || 0) === 0) {
        issues.push({
          id: `disconnected-${n.id}`,
          elementId: n.id,
          elementType: n.type,
          severity: 'WARNING',
          category: 'Topology',
          message: `Node ${n.label} (${n.id}) is completely disconnected from the network.`,
          recommendation: 'Connect this node using a pipe or remove it.'
        });
      }
    });

    // 4. Pipe parameters check
    links.forEach(l => {
      if (l.type === 'pipe') {
        const pipe = l as Pipe;
        if (pipe.diameter <= 0) {
          issues.push({
            id: `pipe-diam-${pipe.id}`,
            elementId: pipe.id,
            elementType: 'pipe',
            severity: 'ERROR',
            category: 'Data',
            message: `Pipe ${pipe.label} has zero or negative diameter (${pipe.diameter} mm).`,
            recommendation: 'Set diameter to a valid physical size (e.g., 100mm, 150mm).'
          });
        }
        if (pipe.length <= 0) {
          issues.push({
            id: `pipe-len-${pipe.id}`,
            elementId: pipe.id,
            elementType: 'pipe',
            severity: 'WARNING',
            category: 'Data',
            message: `Pipe ${pipe.label} has zero or negative length (${pipe.length} m).`,
            recommendation: 'Specify a positive pipe length.'
          });
        }
        if (pipe.velocity && Math.abs(pipe.velocity) > 3.5) {
          issues.push({
            id: `high-vel-${pipe.id}`,
            elementId: pipe.id,
            elementType: 'pipe',
            severity: 'WARNING',
            category: 'Hydraulics',
            message: `Pipe ${pipe.label} velocity is high (${pipe.velocity.toFixed(2)} m/s > 3.5 m/s).`,
            recommendation: 'Consider upsizing pipe diameter to prevent water hammer and excessive friction loss.'
          });
        }
      }
    });

    // 5. Junction pressures check
    nodes.forEach(n => {
      if (n.type === 'junction') {
        const junc = n as Junction;
        if (junc.pressure !== undefined) {
          if (junc.pressure < 0) {
            issues.push({
              id: `neg-press-${junc.id}`,
              elementId: junc.id,
              elementType: 'junction',
              severity: 'ERROR',
              category: 'Hydraulics',
              message: `Junction ${junc.label} has negative pressure (${junc.pressure.toFixed(1)} kPa).`,
              recommendation: 'Check source head, pipe sizing, or elevation levels.'
            });
          } else if (junc.pressure < 100) {
            issues.push({
              id: `low-press-${junc.id}`,
              elementId: junc.id,
              elementType: 'junction',
              severity: 'INFO',
              category: 'Hydraulics',
              message: `Junction ${junc.label} pressure is below recommended municipal service level (${junc.pressure.toFixed(1)} kPa < 100 kPa / 10m).`,
              recommendation: 'Evaluate booster pump addition or head tank increase.'
            });
          }
        }
      }
    });

    return issues;
  }
}
