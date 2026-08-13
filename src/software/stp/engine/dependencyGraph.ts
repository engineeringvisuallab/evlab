/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Design Dependency Graph & Impact Engine
 * @license Apache-2.0
 */

export interface DependencyNode {
  id: string; // Parameter ID or Calculation ID
  type: 'PARAMETER' | 'CALCULATION' | 'BOQ' | 'BIM' | 'REPORT';
  name: string;
  subsystem: string;
  upstreamIds: string[];   // What this node depends on
  downstreamIds: string[]; // Nodes that depend on this node
}

export class DependencyGraphEngine {
  private nodes: Record<string, DependencyNode> = {};

  constructor() {
    this.buildGraph();
  }

  /**
   * Initializes baseline engineering dependency linkages.
   */
  private buildGraph(): void {
    // 1. Demographics & Flows
    this.addNode('STP.DEMO.P_PRES', 'PARAMETER', 'Present Population', 'Design Basis');
    this.addNode('STP.DEMO.GR_PCT', 'PARAMETER', 'Growth Rate', 'Design Basis');
    this.addNode('STP.DEMO.HORIZON', 'PARAMETER', 'Design Horizon', 'Design Basis');

    this.addNode('STP.DEMO.P_DES', 'CALCULATION', 'Design Population', 'Design Basis', ['STP.DEMO.P_PRES', 'STP.DEMO.GR_PCT', 'STP.DEMO.HORIZON']);
    this.addNode('STP.FLOW.PER_CAP_DEMAND', 'PARAMETER', 'Per Capita Demand', 'Design Basis');
    this.addNode('STP.FLOW.RETURN_FACTOR', 'PARAMETER', 'Sewer Return Factor', 'Design Basis');

    this.addNode('STP.FLOW.ADWF', 'CALCULATION', 'Average Dry Weather Flow (ADWF)', 'Hydraulics', ['STP.DEMO.P_DES', 'STP.FLOW.PER_CAP_DEMAND', 'STP.FLOW.RETURN_FACTOR']);
    this.addNode('STP.FLOW.PEAK_FACTOR', 'PARAMETER', 'Peak Factor', 'Hydraulics', ['STP.DEMO.P_DES']);
    this.addNode('STP.FLOW.PWWF', 'CALCULATION', 'Peak Wet Weather Flow (PWWF)', 'Hydraulics', ['STP.FLOW.ADWF', 'STP.FLOW.PEAK_FACTOR']);

    // 2. Process Sizing
    this.addNode('CALC-BIO-REACTOR_VOLUME', 'CALCULATION', 'Biological Aeration Tank Volume', 'Biological Treatment', ['STP.FLOW.ADWF', 'STP.QUAL.BOD5', 'STP.BIO.MLSS']);
    this.addNode('CALC-AERATION-AIRFLOW', 'CALCULATION', 'Aeration Blower Airflow Demand', 'Aeration System', ['CALC-BIO-REACTOR_VOLUME', 'STP.QUAL.BOD5', 'STP.QUAL.TEMP']);
    this.addNode('CALC-ELEC-POWER_DEMAND', 'CALCULATION', 'Plant Connected Electrical Load', 'Electrical Power', ['CALC-AERATION-AIRFLOW']);

    // 3. Downstream BOQ, BIM & Reports
    this.addNode('BOQ-CIV-CONCRETE', 'BOQ', 'Concrete Tank Quantity Takeoff', 'Civil', ['CALC-BIO-REACTOR_VOLUME']);
    this.addNode('BIM-PSET-PROCESS', 'BIM', 'IFC Pset_StpProcess Attributes', 'BIM', ['STP.FLOW.ADWF', 'CALC-BIO-REACTOR_VOLUME']);
    this.addNode('REPORT-SEC-09', 'REPORT', 'Master Report Chapter 09 Process Design', 'Report', ['CALC-BIO-REACTOR_VOLUME', 'CALC-AERATION-AIRFLOW']);
  }

  private addNode(id: string, type: DependencyNode['type'], name: string, subsystem: string, upstreamIds: string[] = []): void {
    if (!this.nodes[id]) {
      this.nodes[id] = {
        id,
        type,
        name,
        subsystem,
        upstreamIds,
        downstreamIds: [],
      };
    }

    // Connect upstream nodes to this downstream node
    upstreamIds.forEach((upId) => {
      if (this.nodes[upId]) {
        if (!this.nodes[upId].downstreamIds.includes(id)) {
          this.nodes[upId].downstreamIds.push(id);
        }
      }
    });
  }

  /**
   * Traverses graph to find all downstream nodes affected by a parameter change.
   */
  public getAffectedNodes(changedNodeId: string): DependencyNode[] {
    const affected: DependencyNode[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = this.nodes[nodeId];
      if (node && nodeId !== changedNodeId) {
        affected.push(node);
      }

      if (node) {
        node.downstreamIds.forEach((childId) => traverse(childId));
      }
    };

    traverse(changedNodeId);
    return affected;
  }

  public getGraph(): Record<string, DependencyNode> {
    return this.nodes;
  }
}
