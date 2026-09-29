import React from 'react';
import {
  MousePointer,
  Square,
  Circle as CircleIcon,
  Ruler,
  Type,
  Trash2,
  Hand,
  Compass,
  Spline,
  Move,
  Copy,
  RotateCw,
  Scaling,
  FlipHorizontal,
  Box,
  Cylinder,
  Pyramid,
  Maximize2,
  Orbit,
  Scissors,
  ArrowRightToLine,
  CopyPlus,
  CornerUpRight,
  Slash,
  Split,
  Link,
  Ungroup,
} from 'lucide-react';
import { ToolType, ViewMode } from '../types/cad';

interface LeftToolPanelProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  viewMode?: ViewMode;
}

interface ToolGroup {
  category: string;
  tools: {
    id: ToolType;
    label: string;
    shortcut: string;
    icon: React.ReactNode;
    description: string;
  }[];
}

export const LeftToolPanel: React.FC<LeftToolPanelProps> = ({ activeTool, onSelectTool, viewMode = '2d' }) => {
  const toolGroups: ToolGroup[] = [
    {
      category: 'SELECT',
      tools: [
        {
          id: 'select',
          label: 'Select',
          shortcut: 'S',
          icon: <MousePointer className="w-4 h-4" />,
          description: 'Click to select objects or drag window selection box',
        },
        {
          id: 'pan',
          label: 'Pan',
          shortcut: 'H',
          icon: <Hand className="w-4 h-4" />,
          description: 'Pan drawing canvas (or hold Middle Mouse / Spacebar)',
        },
        ...(viewMode === '3d'
          ? [
              {
                id: 'orbit_3d' as ToolType,
                label: 'Orbit 3D',
                shortcut: 'O',
                icon: <Orbit className="w-4 h-4 text-cyan-400" />,
                description: 'Drag mouse to rotate / orbit 3D view camera',
              },
            ]
          : []),
      ],
    },
    {
      category: '2D DRAW',
      tools: [
        {
          id: 'line',
          label: 'Line',
          shortcut: 'L',
          icon: (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-current rotate-[-35deg]" />
            </div>
          ),
          description: 'Create straight line segment between two points',
        },
        {
          id: 'polyline',
          label: 'Polyline',
          shortcut: 'P',
          icon: <Spline className="w-4 h-4" />,
          description: 'Create multi-segment line sequence',
        },
        {
          id: 'rectangle',
          label: 'Rectangle',
          shortcut: 'R',
          icon: <Square className="w-4 h-4" />,
          description: 'Draw 2-point corner rectangle',
        },
        {
          id: 'circle',
          label: 'Circle',
          shortcut: 'C',
          icon: <CircleIcon className="w-4 h-4" />,
          description: 'Draw center-radius or center-point circle',
        },
        {
          id: 'arc',
          label: 'Arc',
          shortcut: 'A',
          icon: <Compass className="w-4 h-4" />,
          description: 'Draw 3-point or center-angle arc',
        },
        {
          id: 'text',
          label: 'Text',
          shortcut: 'T',
          icon: <Type className="w-4 h-4" />,
          description: 'Insert CAD text annotation',
        },
      ],
    },
    {
      category: '3D SOLID',
      tools: [
        {
          id: 'box_3d',
          label: '3D Box',
          shortcut: 'B',
          icon: <Box className="w-4 h-4 text-cyan-400" />,
          description: 'Draw 3D Box / Cube solid block',
        },
        {
          id: 'cylinder_3d',
          label: '3D Cyl',
          shortcut: 'Y',
          icon: <Cylinder className="w-4 h-4 text-green-400" />,
          description: 'Draw 3D Cylinder column',
        },
        {
          id: 'sphere_3d',
          label: '3D Sphere',
          shortcut: 'U',
          icon: <CircleIcon className="w-4 h-4 text-purple-400" />,
          description: 'Draw 3D Sphere dome',
        },
        {
          id: 'cone_3d',
          label: '3D Cone',
          shortcut: 'N',
          icon: <Pyramid className="w-4 h-4 text-amber-400" />,
          description: 'Draw 3D Cone / Pyramid solid',
        },
        {
          id: 'extrude_tool',
          label: 'Extrude',
          shortcut: 'X',
          icon: <Maximize2 className="w-4 h-4 text-cyan-300" />,
          description: 'Pull / Extrude 2D blueprint shape into 3D solid model',
        },
      ],
    },
    {
      category: 'MEASURE',
      tools: [
        {
          id: 'dimension',
          label: 'Dimension',
          shortcut: 'D',
          icon: <Ruler className="w-4 h-4" />,
          description: 'Add CAD linear dimension line with measurement text',
        },
      ],
    },
    {
      category: 'MODIFY',
      tools: [
        {
          id: 'move',
          label: 'Move',
          shortcut: 'M',
          icon: <Move className="w-4 h-4" />,
          description: 'Move selected object(s) from base point to destination',
        },
        {
          id: 'copy',
          label: 'Copy',
          shortcut: 'CO',
          icon: <Copy className="w-4 h-4" />,
          description: 'Duplicate selected object(s) across destination points',
        },
        {
          id: 'rotate',
          label: 'Rotate',
          shortcut: 'RO',
          icon: <RotateCw className="w-4 h-4" />,
          description: 'Rotate selected object(s) around a base point',
        },
        {
          id: 'scale',
          label: 'Scale',
          shortcut: 'SC',
          icon: <Scaling className="w-4 h-4" />,
          description: 'Scale selected object(s) relative to a base point',
        },
        {
          id: 'mirror',
          label: 'Mirror',
          shortcut: 'MI',
          icon: <FlipHorizontal className="w-4 h-4" />,
          description: 'Mirror selected object(s) across a 2-point axis line',
        },
        {
          id: 'erase',
          label: 'Erase',
          shortcut: 'E',
          icon: <Trash2 className="w-4 h-4" />,
          description: 'Delete selected object(s)',
        },
        {
          id: 'trim',
          label: 'Trim',
          shortcut: 'TR',
          icon: <Scissors className="w-4 h-4 text-cyan-400" />,
          description: 'Trim object portion at boundary intersections',
        },
        {
          id: 'extend',
          label: 'Extend',
          shortcut: 'EX',
          icon: <ArrowRightToLine className="w-4 h-4 text-amber-400" />,
          description: 'Extend object line/arc to nearest boundary',
        },
        {
          id: 'offset',
          label: 'Offset',
          shortcut: 'O',
          icon: <CopyPlus className="w-4 h-4 text-emerald-400" />,
          description: 'Create parallel / concentric offset curve',
        },
        {
          id: 'fillet',
          label: 'Fillet',
          shortcut: 'F',
          icon: <CornerUpRight className="w-4 h-4 text-blue-400" />,
          description: 'Round corner between two lines with arc radius',
        },
        {
          id: 'chamfer',
          label: 'Chamfer',
          shortcut: 'CHA',
          icon: <Slash className="w-4 h-4 text-orange-400" />,
          description: 'Bevel corner between two lines with distances',
        },
        {
          id: 'break',
          label: 'Break',
          shortcut: 'BR',
          icon: <Split className="w-4 h-4 text-purple-400" />,
          description: 'Break object between two points',
        },
        {
          id: 'join',
          label: 'Join',
          shortcut: 'J',
          icon: <Link className="w-4 h-4 text-teal-400" />,
          description: 'Join connected lines or polyline segments into polyline',
        },
        {
          id: 'explode',
          label: 'Explode',
          shortcut: 'X',
          icon: <Ungroup className="w-4 h-4 text-pink-400" />,
          description: 'Explode rectangle or polyline into individual line segments',
        },
      ],
    },
  ];

  return (
    <div className="w-14 bg-[#1a1c22] border-r border-[#2d3139] flex flex-col items-center py-2 select-none z-10 space-y-4 overflow-y-auto custom-scrollbar">
      {toolGroups.map((group) => (
        <div key={group.category} className="w-full flex flex-col items-center space-y-1">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest text-center px-1">
            {group.category}
          </div>

          {group.tools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                title={`${tool.label} (${tool.shortcut}) - ${tool.description}`}
                className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center relative transition-all group ${
                  isActive
                    ? 'bg-[#0078d4] text-white shadow-lg ring-2 ring-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-[#282c35]'
                }`}
              >
                {tool.icon}
                <span className="text-[9px] font-medium leading-none mt-1">{tool.label}</span>

                {/* Shortcut badge */}
                <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono text-gray-400 bg-black/40 px-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {tool.shortcut}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
