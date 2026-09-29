/**
 * EVLab WaterFlow - Longitudinal Profile Engineering Drawing Generator
 * Renders Ground Elevation profile, Pipe Invert Line, Hydraulic Grade Line (HGL), and Pressure Heads.
 */

import React, { useState, useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Junction, Pipe, NetworkNode, getNodesList, getLinksList } from '../../types/waterflow';
import { X, Activity, Download, Printer, CheckCircle2 } from 'lucide-react';

export const ProfileViewDialog: React.FC = () => {
  const { model, profileNodeIds, toggleProfileNode, setActiveDialog } = useWaterFlow();

  const nodesMap = useMemo(() => {
    const nodes = getNodesList(model.nodes);
    const map = new Map<string, NetworkNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [model.nodes]);

  const links = useMemo(() => {
    return getLinksList(model.links);
  }, [model.links]);

  // Compute profile path distance chainages and hydraulic grades along selected profile nodes
  const profilePoints = useMemo(() => {
    if (profileNodeIds.length < 2) return [];

    let chainage = 0;
    const points: {
      nodeId: string;
      label: string;
      chainage: number;
      groundElev: number;
      pipeElev: number;
      hgl: number;
      pressureKPa: number;
    }[] = [];

    for (let i = 0; i < profileNodeIds.length; i++) {
      const nodeId = profileNodeIds[i];
      const node = nodesMap.get(nodeId);
      if (!node) continue;

      if (i > 0) {
        const prevNodeId = profileNodeIds[i - 1];
        const prevNode = nodesMap.get(prevNodeId);
        if (prevNode) {
          // Find connecting link
          const connectingPipe = links.find(l =>
            (l.startNodeId === prevNodeId && l.endNodeId === nodeId) ||
            (l.startNodeId === nodeId && l.endNodeId === prevNodeId)
          );
          const segLength = (connectingPipe as Pipe)?.length || Math.hypot((node.x ?? 0) - (prevNode.x ?? 0), (node.y ?? 0) - (prevNode.y ?? 0));
          chainage += segLength;
        }
      }

      const groundElev = node.elevation || 0;
      const pipeElev = groundElev - 1.5; // Default 1.5m burial depth
      const hgl = node.hydraulicGrade || groundElev + 25;
      const pressure = (node as Junction).pressure || (hgl - groundElev) * 9.806;

      points.push({
        nodeId,
        label: node.label || node.id,
        chainage,
        groundElev,
        pipeElev,
        hgl,
        pressureKPa: pressure
      });
    }

    return points;
  }, [profileNodeIds, nodesMap, links]);

  // Default path if none selected: Reservoir R-101 -> J-01 -> J-02 -> J-03 -> J-06
  const presetPaths = [
    { name: 'Main Transmission Main (R-101 to TANK-201)', path: ['R-101', 'J-00', 'J-01', 'J-02', 'J-03', 'TANK-201'] },
    { name: 'South Residential Grid Main (J-01 to J-07)', path: ['J-01', 'J-04', 'J-05', 'J-07'] }
  ];

  const handleApplyPreset = (path: string[]) => {
    path.forEach(nodeId => {
      if (!profileNodeIds.includes(nodeId)) toggleProfileNode(nodeId);
    });
  };

  // SVG Chart bounds
  const chartWidth = 780;
  const chartHeight = 320;
  const padding = 50;

  const minChainage = 0;
  const maxChainage = Math.max(100, profilePoints[profilePoints.length - 1]?.chainage || 1000);

  const minElev = Math.min(...profilePoints.map(p => Math.min(p.groundElev, p.pipeElev, p.hgl))) - 10;
  const maxElev = Math.max(...profilePoints.map(p => Math.max(p.groundElev, p.pipeElev, p.hgl))) + 15;

  const scaleX = (chainage: number) => padding + ((chainage - minChainage) / (maxChainage - minChainage)) * (chartWidth - 2 * padding);
  const scaleY = (elev: number) => chartHeight - padding - ((elev - minElev) / (maxElev - minElev)) * (chartHeight - 2 * padding);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Longitudinal Hydraulic Profile Viewer</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Preset Path Selection */}
          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold">Select Profile Path Preset:</span>
            {presetPaths.map(pp => (
              <button
                key={pp.name}
                onClick={() => handleApplyPreset(pp.path)}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2.5 py-1 rounded border border-slate-700 transition"
              >
                {pp.name}
              </button>
            ))}
          </div>

          {/* SVG Longitudinal Chart */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 flex justify-center">
            {profilePoints.length < 2 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                <p>Select at least 2 connected nodes or click a preset path above to view profile.</p>
              </div>
            ) : (
              <svg width={chartWidth} height={chartHeight} className="overflow-visible font-mono text-[10px]">
                {/* Axes */}
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#334155" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#334155" strokeWidth="1" />

                {/* Ground Elevation Line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points={profilePoints.map(p => `${scaleX(p.chainage)},${scaleY(p.groundElev)}`).join(' ')}
                />

                {/* Pipe Invert Line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  points={profilePoints.map(p => `${scaleX(p.chainage)},${scaleY(p.pipeElev)}`).join(' ')}
                />

                {/* Hydraulic Grade Line (HGL) */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  points={profilePoints.map(p => `${scaleX(p.chainage)},${scaleY(p.hgl)}`).join(' ')}
                />

                {/* Points and Labels */}
                {profilePoints.map((pt, idx) => {
                  const cx = scaleX(pt.chainage);
                  const cyGround = scaleY(pt.groundElev);
                  const cyHGL = scaleY(pt.hgl);

                  return (
                    <g key={idx}>
                      {/* Vertical Grid Line */}
                      <line x1={cx} y1={padding} x2={cx} y2={chartHeight - padding} stroke="#1e293b" strokeDasharray="3 3" />

                      {/* HGL Point */}
                      <circle cx={cx} cy={cyHGL} r="4" fill="#38bdf8" />
                      {/* Ground Point */}
                      <circle cx={cx} cy={cyGround} r="4" fill="#10b981" />

                      {/* Node Label */}
                      <text x={cx} y={chartHeight - padding + 15} textAnchor="middle" fill="#94a3b8">
                        {pt.label}
                      </text>
                      <text x={cx} y={chartHeight - padding + 28} textAnchor="middle" fill="#64748b" fontSize="9">
                        {pt.chainage.toFixed(0)}m
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Profile Legend */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-emerald-500 rounded"></span> Ground Elevation Line
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 bg-blue-500 rounded"></span> Pipe Invert Level
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-1 border-b-2 border-dashed border-cyan-400"></span> Hydraulic Grade Line (HGL)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
