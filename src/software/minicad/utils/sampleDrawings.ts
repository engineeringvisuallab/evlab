import { CADObject, Layer } from '../types/cad';

export interface SampleDrawing {
  id: string;
  name: string;
  description: string;
  layers: Layer[];
  objects: CADObject[];
}

export const SAMPLE_DRAWINGS: SampleDrawing[] = [
  {
    id: 'mechanical-bracket',
    name: 'Mechanical Mounting Flange',
    description: 'Precision engineering mounting plate with bolt holes, central bore, and dimensions.',
    layers: [
      { id: 'outline', name: 'Outline', color: '#00ffff', visible: true, locked: false, lineWeight: 2, lineType: 'solid' },
      { id: 'holes', name: 'Holes & Features', color: '#33ff99', visible: true, locked: false, lineWeight: 1.5, lineType: 'solid' },
      { id: 'centerlines', name: 'Centerlines', color: '#ff5555', visible: true, locked: false, lineWeight: 1, lineType: 'dashed' },
      { id: 'dims', name: 'Dimensions', color: '#ffb703', visible: true, locked: false, lineWeight: 1, lineType: 'solid' },
    ],
    objects: [
      // Outer Plate Base
      { id: 'b1', type: 'rectangle', layerId: 'outline', x: -150, y: -100, width: 300, height: 200, color: '#00ffff', lineWeight: 2 },
      
      // Chamfers / Fillet circles
      { id: 'c_center', type: 'circle', layerId: 'holes', centerX: 0, centerY: 0, radius: 50, color: '#33ff99', lineWeight: 2 },
      { id: 'c_inner', type: 'circle', layerId: 'holes', centerX: 0, centerY: 0, radius: 30, color: '#33ff99', lineWeight: 1.5 },

      // 4 Bolt Holes at corners
      { id: 'h1', type: 'circle', layerId: 'holes', centerX: -110, centerY: 70, radius: 12, color: '#33ff99', lineWeight: 1.5 },
      { id: 'h2', type: 'circle', layerId: 'holes', centerX: 110, centerY: 70, radius: 12, color: '#33ff99', lineWeight: 1.5 },
      { id: 'h3', type: 'circle', layerId: 'holes', centerX: -110, centerY: -70, radius: 12, color: '#33ff99', lineWeight: 1.5 },
      { id: 'h4', type: 'circle', layerId: 'holes', centerX: 110, centerY: -70, radius: 12, color: '#33ff99', lineWeight: 1.5 },

      // Centerlines
      { id: 'cl1', type: 'line', layerId: 'centerlines', startX: -180, startY: 0, endX: 180, endY: 0, color: '#ff5555', lineWeight: 1, lineType: 'dashed' },
      { id: 'cl2', type: 'line', layerId: 'centerlines', startX: 0, startY: -130, endX: 0, endY: 130, color: '#ff5555', lineWeight: 1, lineType: 'dashed' },

      // Dimensions
      { id: 'd1', type: 'dimension', layerId: 'dims', startX: -150, startY: 100, endX: 150, endY: 100, offset: 25, label: '300.00 mm', color: '#ffb703' },
      { id: 'd2', type: 'dimension', layerId: 'dims', startX: -150, startY: -100, endX: -150, endY: 100, offset: -25, label: '200.00 mm', color: '#ffb703' },
      { id: 'd3', type: 'dimension', layerId: 'dims', startX: -110, startY: 70, endX: 110, endY: 70, offset: -20, label: '220.00 PCD', color: '#ffb703' },

      // Labels
      { id: 't1', type: 'text', layerId: 'dims', x: -140, y: -120, text: 'TITLE: FLANGE MOUNT PLATE - REV A', fontSize: 14, color: '#e0e0e0' },
      { id: 't2', type: 'text', layerId: 'dims', x: -140, y: -140, text: 'SCALE 1:1  |  ALL DIMS IN MM', fontSize: 11, color: '#a0a0a0' },
    ],
  },
  {
    id: 'floor-plan',
    name: 'Architectural Floor Plan',
    description: '2-Bedroom Apartment floor layout with walls, doors, windows, and room labels.',
    layers: [
      { id: 'walls', name: 'Walls', color: '#3a86ff', visible: true, locked: false, lineWeight: 3, lineType: 'solid' },
      { id: 'doors', name: 'Doors & Windows', color: '#ff006e', visible: true, locked: false, lineWeight: 1.5, lineType: 'solid' },
      { id: 'furniture', name: 'Furniture / Specs', color: '#8338ec', visible: true, locked: false, lineWeight: 1, lineType: 'solid' },
      { id: 'text', name: 'Annotations', color: '#ffffff', visible: true, locked: false, lineWeight: 1, lineType: 'solid' },
    ],
    objects: [
      // Outer Perimeter Walls
      { id: 'w1', type: 'rectangle', layerId: 'walls', x: -200, y: -150, width: 400, height: 300, color: '#3a86ff', lineWeight: 3 },
      
      // Interior Dividing Walls
      { id: 'w2', type: 'line', layerId: 'walls', startX: 0, startY: -150, endX: 0, endY: 150, color: '#3a86ff', lineWeight: 3 },
      { id: 'w3', type: 'line', layerId: 'walls', startX: -200, startY: 0, endX: 0, endY: 0, color: '#3a86ff', lineWeight: 3 },

      // Doors
      { id: 'dr1', type: 'arc', layerId: 'doors', centerX: -50, centerY: 0, radius: 40, startAngle: 0, endAngle: Math.PI / 2, color: '#ff006e', lineWeight: 1.5 },
      { id: 'dr2', type: 'line', layerId: 'doors', startX: -50, startY: 0, endX: -50, endY: 40, color: '#ff006e', lineWeight: 1.5 },
      
      { id: 'dr3', type: 'arc', layerId: 'doors', centerX: 50, centerY: -50, radius: 40, startAngle: Math.PI / 2, endAngle: Math.PI, color: '#ff006e', lineWeight: 1.5 },
      { id: 'dr4', type: 'line', layerId: 'doors', startX: 50, startY: -50, endX: 10, endY: -50, color: '#ff006e', lineWeight: 1.5 },

      // Windows
      { id: 'win1', type: 'line', layerId: 'doors', startX: -200, startY: 50, endX: -200, endY: 100, color: '#00ffff', lineWeight: 2 },
      { id: 'win2', type: 'line', layerId: 'doors', startX: 200, startY: 50, endX: 200, endY: 100, color: '#00ffff', lineWeight: 2 },

      // Room Labels
      { id: 'txt1', type: 'text', layerId: 'text', x: -140, y: 80, text: 'MASTER BEDROOM', fontSize: 14, color: '#ffffff' },
      { id: 'txt2', type: 'text', layerId: 'text', x: -140, y: 60, text: '4.0m x 3.0m', fontSize: 11, color: '#a0a0a0' },

      { id: 'txt3', type: 'text', layerId: 'text', x: -140, y: -70, text: 'GUEST ROOM', fontSize: 14, color: '#ffffff' },
      { id: 'txt4', type: 'text', layerId: 'text', x: -140, y: -90, text: '4.0m x 3.0m', fontSize: 11, color: '#a0a0a0' },

      { id: 'txt5', type: 'text', layerId: 'text', x: 60, y: 20, text: 'LIVING & DINING AREA', fontSize: 16, color: '#ffffff' },
      { id: 'txt6', type: 'text', layerId: 'text', x: 60, y: -5, text: '4.0m x 6.0m', fontSize: 11, color: '#a0a0a0' },
    ],
  },
  {
    id: 'electrical-schema',
    name: 'Electrical Circuit Schematic',
    description: 'Analog amplifier schematic with power rails, signal paths, and component symbols.',
    layers: [
      { id: 'wires', name: 'Conductors', color: '#00ff66', visible: true, locked: false, lineWeight: 2, lineType: 'solid' },
      { id: 'components', name: 'Components', color: '#ffb703', visible: true, locked: false, lineWeight: 2, lineType: 'solid' },
      { id: 'text', name: 'Labels', color: '#ffffff', visible: true, locked: false, lineWeight: 1, lineType: 'solid' },
    ],
    objects: [
      // Rail lines
      { id: 'r_top', type: 'line', layerId: 'wires', startX: -150, startY: 100, endX: 150, endY: 100, color: '#00ff66', lineWeight: 2 },
      { id: 'r_bot', type: 'line', layerId: 'wires', startX: -150, startY: -100, endX: 150, endY: -100, color: '#00ff66', lineWeight: 2 },

      // Resistor R1
      { id: 'res1', type: 'rectangle', layerId: 'components', x: -80, y: 20, width: 20, height: 50, color: '#ffb703', lineWeight: 2 },
      { id: 'w_res1_t', type: 'line', layerId: 'wires', startX: -70, startY: 100, endX: -70, endY: 70, color: '#00ff66', lineWeight: 2 },
      { id: 'w_res1_b', type: 'line', layerId: 'wires', startX: -70, startY: 20, endX: -70, endY: 0, color: '#00ff66', lineWeight: 2 },

      // Resistor R2
      { id: 'res2', type: 'rectangle', layerId: 'components', x: -80, y: -70, width: 20, height: 50, color: '#ffb703', lineWeight: 2 },
      { id: 'w_res2_t', type: 'line', layerId: 'wires', startX: -70, startY: 0, endX: -70, endY: -20, color: '#00ff66', lineWeight: 2 },
      { id: 'w_res2_b', type: 'line', layerId: 'wires', startX: -70, startY: -70, endX: -70, endY: -100, color: '#00ff66', lineWeight: 2 },

      // Transistor Circle / Symbol
      { id: 'trans_c', type: 'circle', layerId: 'components', centerX: 20, centerY: 0, radius: 25, color: '#ffb703', lineWeight: 2 },
      { id: 'w_base', type: 'line', layerId: 'wires', startX: -70, startY: 0, endX: -5, endY: 0, color: '#00ff66', lineWeight: 2 },
      { id: 'w_collector', type: 'line', layerId: 'wires', startX: 20, startY: 25, endX: 20, endY: 100, color: '#00ff66', lineWeight: 2 },
      { id: 'w_emitter', type: 'line', layerId: 'wires', startX: 20, startY: -25, endX: 20, endY: -100, color: '#00ff66', lineWeight: 2 },

      // Labels
      { id: 'lbl_vcc', type: 'text', layerId: 'text', x: 160, y: 105, text: '+VCC (12V)', fontSize: 12, color: '#ffffff' },
      { id: 'lbl_gnd', type: 'text', layerId: 'text', x: 160, y: -95, text: 'GND (0V)', fontSize: 12, color: '#ffffff' },
      { id: 'lbl_r1', type: 'text', layerId: 'text', x: -120, y: 45, text: 'R1 = 10kΩ', fontSize: 11, color: '#ffb703' },
      { id: 'lbl_r2', type: 'text', layerId: 'text', x: -120, y: -45, text: 'R2 = 2.2kΩ', fontSize: 11, color: '#ffb703' },
      { id: 'lbl_q1', type: 'text', layerId: 'text', x: 50, y: 10, text: 'Q1 (2N2222 NPN)', fontSize: 11, color: '#ffb703' },
    ],
  },
];
