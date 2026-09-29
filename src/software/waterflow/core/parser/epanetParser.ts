/**
 * EVLab WaterFlow - EPANET INP Parser & Exporter
 * Supports reading and writing EPANET .inp file format.
 */

import {
  NetworkModel,
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  NetworkNode,
  NetworkLink,
  DemandPattern
} from '../../types/waterflow';

export class EPANETParser {
  /**
   * Parse EPANET .inp file text into NetworkModel
   */
  static parseINP(inpContent: string): NetworkModel {
    const lines = inpContent.split(/\r?\n/);
    let currentSection = '';

    const nodesMap = new Map<string, NetworkNode>();
    const linksMap = new Map<string, NetworkLink>();
    const coordinatesMap = new Map<string, { x: number; y: number }>();
    const patternsMap = new Map<string, DemandPattern>();

    for (let rawLine of lines) {
      let line = rawLine.trim();
      // Skip empty lines and comments starting with ;
      if (!line || line.startsWith(';')) continue;

      // Section header e.g. [JUNCTIONS]
      if (line.startsWith('[') && line.endsWith(']')) {
        currentSection = line.substring(1, line.length - 1).toUpperCase();
        continue;
      }

      const tokens = line.split(/\s+/);

      switch (currentSection) {
        case 'JUNCTIONS':
          // ID Elev Demand Pattern
          if (tokens.length >= 2) {
            const id = tokens[0];
            const elev = parseFloat(tokens[1]) || 0;
            const demand = tokens.length >= 3 ? parseFloat(tokens[2]) || 0 : 0;
            const patternId = tokens.length >= 4 ? tokens[3] : undefined;

            const junc: Junction = {
              id,
              label: id,
              type: 'junction',
              x: 0,
              y: 0,
              elevation: elev,
              baseDemand: demand,
              demandPatternId: patternId
            };
            nodesMap.set(id, junc);
          }
          break;

        case 'RESERVOIRS':
          // ID Head Pattern
          if (tokens.length >= 2) {
            const id = tokens[0];
            const head = parseFloat(tokens[1]) || 0;
            const res: Reservoir = {
              id,
              label: id,
              type: 'reservoir',
              x: 0,
              y: 0,
              elevation: head - 10,
              totalHead: head
            };
            nodesMap.set(id, res);
          }
          break;

        case 'TANKS':
          // ID Elevation InitLevel MinLevel MaxLevel Diameter MinVol Curve
          if (tokens.length >= 6) {
            const id = tokens[0];
            const elev = parseFloat(tokens[1]) || 0;
            const initLvl = parseFloat(tokens[2]) || 0;
            const minLvl = parseFloat(tokens[3]) || 0;
            const maxLvl = parseFloat(tokens[4]) || 0;
            const diam = parseFloat(tokens[5]) || 0;

            const tank: Tank = {
              id,
              label: id,
              type: 'tank',
              x: 0,
              y: 0,
              elevation: elev,
              initLevel: initLvl,
              minLevel: minLvl,
              maxLevel: maxLvl,
              diameter: diam,
              currentLevel: initLvl
            };
            nodesMap.set(id, tank);
          }
          break;

        case 'PIPES':
          // ID Node1 Node2 Length Diameter Roughness MinorLoss Status
          if (tokens.length >= 6) {
            const id = tokens[0];
            const n1 = tokens[1];
            const n2 = tokens[2];
            const len = parseFloat(tokens[3]) || 100;
            const diam = parseFloat(tokens[4]) || 150;
            const rough = parseFloat(tokens[5]) || 130;
            const minor = tokens.length >= 7 ? parseFloat(tokens[6]) || 0 : 0;
            const statusStr = tokens.length >= 8 ? tokens[7].toUpperCase() : 'OPEN';

            const pipe: Pipe = {
              id,
              label: id,
              type: 'pipe',
              startNodeId: n1,
              endNodeId: n2,
              length: len,
              diameter: diam,
              material: 'Ductile Iron',
              roughness: rough,
              minorLoss: minor,
              status: statusStr === 'CLOSED' ? 'CLOSED' : 'OPEN'
            };
            linksMap.set(id, pipe);
          }
          break;

        case 'PUMPS':
          // ID Node1 Node2 Properties...
          if (tokens.length >= 3) {
            const id = tokens[0];
            const n1 = tokens[1];
            const n2 = tokens[2];
            const pump: Pump = {
              id,
              label: id,
              type: 'pump',
              startNodeId: n1,
              endNodeId: n2,
              curveType: 'DESIGN_POINT',
              designFlow: 50,
              designHead: 40,
              speed: 100,
              status: 'ON',
              efficiency: 75
            };
            linksMap.set(id, pump);
          }
          break;

        case 'VALVES':
          // ID Node1 Node2 Diameter Type Setting MinorLoss
          if (tokens.length >= 6) {
            const id = tokens[0];
            const n1 = tokens[1];
            const n2 = tokens[2];
            const vType = (tokens[4] as any) || 'PRV';
            const setting = parseFloat(tokens[5]) || 300;

            const valve: Valve = {
              id,
              label: id,
              type: 'valve',
              startNodeId: n1,
              endNodeId: n2,
              valveType: vType,
              setting,
              status: 'ACTIVE',
              minorLoss: 0
            };
            linksMap.set(id, valve);
          }
          break;

        case 'COORDINATES':
          // Node X-Coord Y-Coord
          if (tokens.length >= 3) {
            const id = tokens[0];
            const x = parseFloat(tokens[1]) || 0;
            const y = parseFloat(tokens[2]) || 0;
            coordinatesMap.set(id, { x, y });
          }
          break;
      }
    }

    // Apply coordinates to nodes
    nodesMap.forEach((node, id) => {
      if (coordinatesMap.has(id)) {
        const coords = coordinatesMap.get(id)!;
        node.x = coords.x;
        node.y = coords.y;
      } else {
        // Fallback grid placement if INP lacked coordinates
        const idx = nodesMap.size;
        node.x = (idx % 10) * 120 + 100;
        node.y = Math.floor(idx / 10) * 120 + 100;
      }
    });

    return {
      id: 'epanet-imported',
      title: 'Imported EPANET Model',
      nodes: nodesMap,
      links: linksMap,
      patterns: Array.from(patternsMap.values()),
      cadAnnotations: [],
      gisLayers: [],
      scenarios: [
        {
          id: 'base',
          name: 'Base Scenario',
          description: 'Original imported model settings',
          demandMultiplier: 1.0,
          overrides: {}
        }
      ],
      activeScenarioId: 'base'
    };
  }

  /**
   * Export NetworkModel to EPANET .inp file text format
   */
  static exportINP(model: NetworkModel): string {
    const nodes = model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
    const links = model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);

    let inp = `; EVLab WaterFlow EPANET INP Export\n; Generated: ${new Date().toISOString()}\n\n`;

    inp += `[TITLE]\n${model.title || 'EVLab WaterFlow Model'}\n\n`;

    // [JUNCTIONS]
    inp += `[JUNCTIONS]\n;ID\tElevation\tDemand\tPattern\n`;
    nodes.filter(n => n.type === 'junction').forEach(n => {
      const j = n as Junction;
      inp += `${j.id}\t${j.elevation}\t${j.baseDemand}\t${j.demandPatternId || ''}\n`;
    });
    inp += `\n`;

    // [RESERVOIRS]
    inp += `[RESERVOIRS]\n;ID\tHead\tPattern\n`;
    nodes.filter(n => n.type === 'reservoir').forEach(n => {
      const r = n as Reservoir;
      inp += `${r.id}\t${r.totalHead || r.elevation + 20}\t${r.headPatternId || ''}\n`;
    });
    inp += `\n`;

    // [TANKS]
    inp += `[TANKS]\n;ID\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\n`;
    nodes.filter(n => n.type === 'tank').forEach(n => {
      const t = n as Tank;
      inp += `${t.id}\t${t.elevation}\t${t.initLevel}\t${t.minLevel}\t${t.maxLevel}\t${t.diameter}\n`;
    });
    inp += `\n`;

    // [PIPES]
    inp += `[PIPES]\n;ID\tNode1\tNode2\tLength\tDiameter\tRoughness\tMinorLoss\tStatus\n`;
    links.filter(l => l.type === 'pipe').forEach(l => {
      const p = l as Pipe;
      inp += `${p.id}\t${p.startNodeId}\t${p.endNodeId}\t${p.length}\t${p.diameter}\t${p.roughness}\t${p.minorLoss}\t${p.status}\n`;
    });
    inp += `\n`;

    // [PUMPS]
    inp += `[PUMPS]\n;ID\tNode1\tNode2\tParameters\n`;
    links.filter(l => l.type === 'pump').forEach(l => {
      const p = l as Pump;
      inp += `${p.id}\t${p.startNodeId}\t${p.endNodeId}\tHEAD ${p.designHead || 40}\n`;
    });
    inp += `\n`;

    // [VALVES]
    inp += `[VALVES]\n;ID\tNode1\tNode2\tDiameter\tType\tSetting\tMinorLoss\n`;
    links.filter(l => l.type === 'valve').forEach(l => {
      const v = l as Valve;
      inp += `${v.id}\t${v.startNodeId}\t${v.endNodeId}\t150\t${v.valveType}\t${v.setting}\t${v.minorLoss}\n`;
    });
    inp += `\n`;

    // [COORDINATES]
    inp += `[COORDINATES]\n;Node\tX-Coord\tY-Coord\n`;
    nodes.forEach(n => {
      inp += `${n.id}\t${(n.x ?? 0).toFixed(2)}\t${(n.y ?? 0).toFixed(2)}\n`;
    });
    inp += `\n`;

    inp += `[END]\n`;

    return inp;
  }
}
