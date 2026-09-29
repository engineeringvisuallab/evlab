export type ObjectType =
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'arc'
  | 'text'
  | 'dimension'
  | 'box_3d'
  | 'cylinder_3d'
  | 'sphere_3d'
  | 'cone_3d';

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
  lineWeight: number;
  lineType: 'solid' | 'dashed' | 'dotted';
}

export interface BaseCADObject {
  id: string;
  type: ObjectType;
  layerId: string;
  color?: string; // Optional override color, defaults to layer color
  lineWeight?: number;
  lineType?: 'solid' | 'dashed' | 'dotted';
  selected?: boolean;
  
  // 3D Extrusion & Z Elevation properties for 2D shapes
  extrudeHeight?: number; // Height to extrude 2D shape in 3D mode
  zPos?: number;          // Base Z elevation (defaults to 0)
}

export interface LineObject extends BaseCADObject {
  type: 'line';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface PolylineObject extends BaseCADObject {
  type: 'polyline';
  points: Point2D[];
  closed?: boolean;
}

export interface RectangleObject extends BaseCADObject {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleObject extends BaseCADObject {
  type: 'circle';
  centerX: number;
  centerY: number;
  radius: number;
}

export interface ArcObject extends BaseCADObject {
  type: 'arc';
  centerX: number;
  centerY: number;
  radius: number;
  startAngle: number; // in radians
  endAngle: number;   // in radians
}

export interface TextObject extends BaseCADObject {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

export interface DimensionObject extends BaseCADObject {
  type: 'dimension';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  offset: number;
  label?: string;
}

// Native 3D CAD Objects
export interface Box3DObject extends BaseCADObject {
  type: 'box_3d';
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  height: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
}

export interface Cylinder3DObject extends BaseCADObject {
  type: 'cylinder_3d';
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;
  segments?: number;
}

export interface Sphere3DObject extends BaseCADObject {
  type: 'sphere_3d';
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface Cone3DObject extends BaseCADObject {
  type: 'cone_3d';
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;
}

export type CADObject =
  | LineObject
  | PolylineObject
  | RectangleObject
  | CircleObject
  | ArcObject
  | TextObject
  | DimensionObject
  | Box3DObject
  | Cylinder3DObject
  | Sphere3DObject
  | Cone3DObject;

export type SnapType = 'grid' | 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'perpendicular';

export interface SnapPoint {
  point: Point2D;
  type: SnapType;
  label: string;
  sourceObjectId?: string;
}

export type ToolType =
  | 'select'
  | 'pan'
  | 'line'
  | 'polyline'
  | 'rectangle'
  | 'circle'
  | 'arc'
  | 'text'
  | 'dimension'
  | 'move'
  | 'copy'
  | 'rotate'
  | 'scale'
  | 'mirror'
  | 'erase'
  | 'trim'
  | 'extend'
  | 'offset'
  | 'fillet'
  | 'chamfer'
  | 'break'
  | 'join'
  | 'explode'
  // 3D Tools
  | 'box_3d'
  | 'cylinder_3d'
  | 'sphere_3d'
  | 'cone_3d'
  | 'extrude_tool'
  | 'orbit_3d';

export type ViewMode = '2d' | '3d';

export type View3DPreset = 'isometric' | 'top' | 'front' | 'right';

export type Shading3DMode = 'shaded_wire' | 'pure_wire' | 'flat' | 'xray' | 'matcap';

export interface TransformState {
  panX: number;
  panY: number;
  zoom: number; // 1.0 = 100%
}

export interface SnapSettings {
  grid: boolean;
  endpoint: boolean;
  midpoint: boolean;
  center: boolean;
  gridSize: number; // e.g. 10 units
}

export interface CommandLog {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'cmd';
  timestamp: string;
}

export interface HistoryEntry {
  objects: CADObject[];
  layers: Layer[];
}

export interface GripPoint {
  id: string;
  point: Point2D;
  type: 'endpoint' | 'midpoint' | 'center' | 'quadrant' | 'vertex' | 'corner' | 'origin';
  label?: string;
  sourceObjectId: string;
  pointIndex?: number;
}

export interface ActiveGrip {
  objectId: string;
  gripType: 'start' | 'end' | 'center' | 'vertex' | 'corner' | 'quadrant' | 'midpoint' | 'origin';
  pointIndex?: number;
  startPt: Point2D;
  originalObject: CADObject;
}
