import { SectionDimensions, SectionProperties, SectionType } from '../types';

export function calculateSectionProperties(type: SectionType, dims: SectionDimensions): SectionProperties {
  switch (type) {
    case 'rectangle': {
      const b = dims.width || 100;
      const h = dims.height || 200;
      const area = b * h;
      const centroidY = h / 2;
      const Ix = (b * Math.pow(h, 3)) / 12;
      const Iy = (h * Math.pow(b, 3)) / 12;
      const J = Ix + Iy;
      const Zx = Ix / (h / 2);
      const Zy = Iy / (b / 2);
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      // Qmax for rectangle at NA: (b * h/2) * (h/4) = b * h^2 / 8
      const Qmax = (b * Math.pow(h, 2)) / 8;
      const bAtNA = b;

      return {
        type,
        name: `Rectangular ${b} × ${h} mm`,
        dimensions: { width: b, height: h },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'square': {
      const a = dims.width || 100;
      const area = a * a;
      const centroidY = a / 2;
      const Ix = Math.pow(a, 4) / 12;
      const Iy = Ix;
      const J = Ix + Iy;
      const Zx = Ix / (a / 2);
      const Zy = Zx;
      const rx = Math.sqrt(Ix / area);
      const ry = rx;
      const Qmax = Math.pow(a, 3) / 8;
      const bAtNA = a;

      return {
        type,
        name: `Square ${a} × ${a} mm`,
        dimensions: { width: a, height: a },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'circle': {
      const d = dims.diameter || 100;
      const r = d / 2;
      const area = (Math.PI * Math.pow(d, 2)) / 4;
      const centroidY = r;
      const Ix = (Math.PI * Math.pow(d, 4)) / 64;
      const Iy = Ix;
      const J = (Math.PI * Math.pow(d, 4)) / 32;
      const Zx = (Math.PI * Math.pow(d, 3)) / 32;
      const Zy = Zx;
      const rx = d / 4;
      const ry = rx;
      // Qmax for circle: semicircle area * centroid = (pi*r^2/2) * (4r/(3pi)) = 2/3 * r^3
      const Qmax = (2 / 3) * Math.pow(r, 3);
      const bAtNA = d;

      return {
        type,
        name: `Solid Circular ⌀${d} mm`,
        dimensions: { width: d, height: d, diameter: d },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'hollow_circle': {
      const D = dims.diameter || 120;
      const d = dims.innerDiameter || 100;
      const R = D / 2;
      const r = d / 2;
      const area = (Math.PI / 4) * (Math.pow(D, 2) - Math.pow(d, 2));
      const centroidY = R;
      const Ix = (Math.PI / 64) * (Math.pow(D, 4) - Math.pow(d, 4));
      const Iy = Ix;
      const J = (Math.PI / 32) * (Math.pow(D, 4) - Math.pow(d, 4));
      const Zx = Ix / R;
      const Zy = Zx;
      const rx = Math.sqrt(Ix / area);
      const ry = rx;
      const Qmax = (2 / 3) * (Math.pow(R, 3) - Math.pow(r, 3));
      const bAtNA = D - d; // Two wall thicknesses

      return {
        type,
        name: `Pipe OD ⌀${D} / ID ⌀${d} mm`,
        dimensions: { width: D, height: D, diameter: D, innerDiameter: d },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'i_beam': {
      const bf = dims.flangeWidth || 150;
      const tf = dims.flangeThickness || 15;
      const h = dims.height || 300;
      const tw = dims.webThickness || 10;
      const hw = h - 2 * tf; // web height
      const area = 2 * (bf * tf) + hw * tw;
      const centroidY = h / 2; // Symmetric
      // Ix = (bf * h^3 - (bf - tw) * hw^3) / 12
      const Ix = (bf * Math.pow(h, 3) - (bf - tw) * Math.pow(hw, 3)) / 12;
      // Iy = 2 * (tf * bf^3 / 12) + (hw * tw^3 / 12)
      const Iy = 2 * ((tf * Math.pow(bf, 3)) / 12) + (hw * Math.pow(tw, 3)) / 12;
      const J = Ix + Iy;
      const Zx = Ix / (h / 2);
      const Zy = Iy / (bf / 2);
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      // Qmax = Flange area * (h/2 - tf/2) + Half-web area * (hw/4)
      const Qmax = (bf * tf) * (h / 2 - tf / 2) + (tw * (hw / 2)) * (hw / 4);
      const bAtNA = tw;

      return {
        type,
        name: `I-Beam ${h}×${bf} (tw=${tw}, tf=${tf})`,
        dimensions: { width: bf, height: h, flangeWidth: bf, flangeThickness: tf, webThickness: tw },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 't_section': {
      const bf = dims.flangeWidth || 140;
      const tf = dims.flangeThickness || 16;
      const h = dims.height || 200;
      const tw = dims.webThickness || 12;
      const hw = h - tf;
      const areaFlange = bf * tf;
      const areaWeb = hw * tw;
      const area = areaFlange + areaWeb;
      // Centroid from bottom of web:
      // y_web = hw / 2, y_flange = hw + tf / 2
      const centroidY = (areaWeb * (hw / 2) + areaFlange * (hw + tf / 2)) / area;
      // Parallel Axis Theorem for Ix:
      const IxWeb = (tw * Math.pow(hw, 3)) / 12 + areaWeb * Math.pow(centroidY - hw / 2, 2);
      const IxFlange = (bf * Math.pow(tf, 3)) / 12 + areaFlange * Math.pow(hw + tf / 2 - centroidY, 2);
      const Ix = IxWeb + IxFlange;
      const Iy = (tf * Math.pow(bf, 3)) / 12 + (hw * Math.pow(tw, 3)) / 12;
      const J = Ix + Iy;
      const yMax = Math.max(centroidY, h - centroidY);
      const Zx = Ix / yMax;
      const Zy = Iy / (bf / 2);
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      // Qmax is calculated for area below NA (web part below NA)
      const Qmax = (tw * centroidY) * (centroidY / 2);
      const bAtNA = tw;

      return {
        type,
        name: `T-Section ${h}×${bf} (tf=${tf}, tw=${tw})`,
        dimensions: { width: bf, height: h, flangeWidth: bf, flangeThickness: tf, webThickness: tw },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'box': {
      const b = dims.width || 150;
      const h = dims.height || 250;
      const t = dims.thickness || 10;
      const bi = b - 2 * t;
      const hi = h - 2 * t;
      const area = b * h - bi * hi;
      const centroidY = h / 2;
      const Ix = (b * Math.pow(h, 3) - bi * Math.pow(hi, 3)) / 12;
      const Iy = (h * Math.pow(b, 3) - hi * Math.pow(bi, 3)) / 12;
      const J = Ix + Iy;
      const Zx = Ix / (h / 2);
      const Zy = Iy / (b / 2);
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      const Qmax = (b * t) * (h / 2 - t / 2) + 2 * (t * (hi / 2)) * (hi / 4);
      const bAtNA = 2 * t; // 2 sidewalls

      return {
        type,
        name: `Hollow Box ${b}×${h} (t=${t}mm)`,
        dimensions: { width: b, height: h, thickness: t },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'channel': {
      const b = dims.width || 100;
      const h = dims.height || 200;
      const tf = dims.flangeThickness || 12;
      const tw = dims.webThickness || 8;
      const hw = h - 2 * tf;
      const area = 2 * (b * tf) + hw * tw;
      const centroidY = h / 2;
      const Ix = (b * Math.pow(h, 3) - (b - tw) * Math.pow(hw, 3)) / 12;
      const Iy = (2 * tf * Math.pow(b, 3) + hw * Math.pow(tw, 3)) / 12;
      const J = Ix + Iy;
      const Zx = Ix / (h / 2);
      const Zy = Iy / b;
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      const Qmax = (b * tf) * (h / 2 - tf / 2) + (tw * (hw / 2)) * (hw / 4);
      const bAtNA = tw;

      return {
        type,
        name: `C-Channel ${h}×${b} (tw=${tw}, tf=${tf})`,
        dimensions: { width: b, height: h, flangeThickness: tf, webThickness: tw },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'triangle': {
      const b = dims.width || 120;
      const h = dims.height || 180;
      const area = (b * h) / 2;
      const centroidY = h / 3;
      const Ix = (b * Math.pow(h, 3)) / 36; // About centroidal axis
      const Iy = (h * Math.pow(b, 3)) / 48; // Isosceles
      const J = Ix + Iy;
      const Zx = Ix / ((2 * h) / 3);
      const Zy = Iy / (b / 2);
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      // Width at NA (which is at h/3 from base, so 2h/3 from apex): b * (2/3)
      const bAtNA = (2 / 3) * b;
      const Qmax = (b * Math.pow(h, 2)) / 24;

      return {
        type,
        name: `Triangular Base ${b} × Height ${h} mm`,
        dimensions: { width: b, height: h },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    case 'angle_l': {
      const b = dims.width || 100;
      const h = dims.height || 100;
      const t = dims.thickness || 10;
      const area = (b + h - t) * t;
      // Centroid:
      const a1 = b * t;
      const y1 = t / 2;
      const a2 = (h - t) * t;
      const y2 = t + (h - t) / 2;
      const centroidY = (a1 * y1 + a2 * y2) / area;
      const Ix = (b * Math.pow(t, 3)) / 12 + a1 * Math.pow(centroidY - y1, 2) +
                 (t * Math.pow(h - t, 3)) / 12 + a2 * Math.pow(y2 - centroidY, 2);
      const Iy = Ix; // If equal leg
      const J = Ix + Iy;
      const Zx = Ix / (h - centroidY);
      const Zy = Zx;
      const rx = Math.sqrt(Ix / area);
      const ry = Math.sqrt(Iy / area);
      const bAtNA = t;
      const Qmax = a1 * (centroidY - y1);

      return {
        type,
        name: `Equal Angle L ${b}×${h}×${t} mm`,
        dimensions: { width: b, height: h, thickness: t },
        area,
        centroidY,
        Ix,
        Iy,
        J,
        Zx,
        Zy,
        rx,
        ry,
        Qmax,
        bAtNA,
      };
    }

    default:
      return calculateSectionProperties('rectangle', { width: 100, height: 200 });
  }
}

export const STANDARD_SECTIONS: (SectionProperties & { id: string })[] = [
  {
    id: 'w200_46_1',
    ...calculateSectionProperties('i_beam', {
      flangeWidth: 203,
      flangeThickness: 11.0,
      height: 203,
      webThickness: 7.2,
    }),
    name: 'W200 × 46.1 Wide-Flange I-Beam',
    d: 203,
  },
  {
    id: 'w310_79',
    ...calculateSectionProperties('i_beam', {
      flangeWidth: 254,
      flangeThickness: 14.6,
      height: 306,
      webThickness: 8.8,
    }),
    name: 'W310 × 79 Structural Steel Girder',
    d: 306,
  },
  {
    id: 'rect_100_200',
    ...calculateSectionProperties('rectangle', { width: 100, height: 200 }),
    name: 'Rectangular 100 × 200 mm Beam',
    d: 200,
  },
  {
    id: 'rect_150_250',
    ...calculateSectionProperties('rectangle', { width: 150, height: 250 }),
    name: 'Rectangular 150 × 250 mm Heavy Section',
    d: 250,
  },
  {
    id: 'solid_circle_80',
    ...calculateSectionProperties('circle', { diameter: 80 }),
    name: 'Solid Circular Shaft ⌀80 mm',
    d: 80,
  },
  {
    id: 'solid_circle_120',
    ...calculateSectionProperties('circle', { diameter: 120 }),
    name: 'Solid Circular Shaft ⌀120 mm',
    d: 120,
  },
  {
    id: 'pipe_114_6',
    ...calculateSectionProperties('hollow_circle', { diameter: 114.3, innerDiameter: 102.3 }),
    name: 'Steel Pipe OD ⌀114.3 / Wall 6.0 mm (Sch 40)',
    d: 114.3,
  },
  {
    id: 'hss_box_150',
    ...calculateSectionProperties('box', { width: 150, height: 150, thickness: 8 }),
    name: 'HSS Square Tube 150 × 150 × 8 mm',
    d: 150,
  },
  {
    id: 'channel_200',
    ...calculateSectionProperties('channel', { width: 75, height: 200, flangeThickness: 11.5, webThickness: 7.0 }),
    name: 'C-Channel 200 × 75 mm (C200×20.5)',
    d: 200,
  },
  {
    id: 'angle_100',
    ...calculateSectionProperties('angle_l', { width: 100, height: 100, thickness: 10 }),
    name: 'Equal Angle L 100 × 100 × 10 mm',
    d: 100,
  },
  {
    id: 't_section_150',
    ...calculateSectionProperties('t_section', { flangeWidth: 150, height: 150, flangeThickness: 12, webThickness: 8 }),
    name: 'T-Section 150 × 150 × 12 mm',
    d: 150,
  },
];

export function getSectionById(id: string): SectionProperties {
  const found = STANDARD_SECTIONS.find(s => s.id === id);
  return found || STANDARD_SECTIONS[0];
}
