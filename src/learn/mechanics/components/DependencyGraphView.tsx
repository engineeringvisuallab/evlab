import React, { useState } from 'react';
import { ArrowRight, ChevronRight, GitCommit, Info, Sparkles } from 'lucide-react';
import { DependencyNode } from '../types/unifiedModel';

interface DependencyGraphViewProps {
  nodes: DependencyNode[];
  isDark: boolean;
}

export const DependencyGraphView: React.FC<DependencyGraphViewProps> = ({
  nodes,
  isDark,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[nodes.length - 1] || nodes[0];

  // Partition nodes by category
  const inputs = nodes.filter((n) => n.category === 'input');
  const intermediates = nodes.filter((n) => n.category === 'intermediate');
  const outputs = nodes.filter((n) => n.category === 'output');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Parameter Dependency Chain (Input &rarr; Solver &rarr; Output)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click any node to inspect its mathematical formulation and upstream influences
          </p>
        </div>
      </div>

      {/* 3-Stage Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stage 1: Inputs */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500 block px-1">
            1. Input Variables ({inputs.length})
          </span>
          <div className="space-y-1.5">
            {inputs.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{node.label}</span>
                    <span className="font-mono text-[11px] font-bold">{node.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 2: Intermediate Calculations */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500 block px-1">
            2. Equilibrium & Equations ({intermediates.length})
          </span>
          <div className="space-y-1.5">
            {intermediates.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{node.label}</span>
                    <span className="font-mono text-[11px] font-bold">{node.value}</span>
                  </div>
                  {node.equation && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      {node.equation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage 3: Outputs */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500 block px-1">
            3. Solved Physical State ({outputs.length})
          </span>
          <div className="space-y-1.5">
            {outputs.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-xs'
                      : isDark
                      ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{node.label}</span>
                    <span className="font-mono text-[11px] font-bold">{node.value}</span>
                  </div>
                  {node.equation && (
                    <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
                      {node.equation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div
          className={`p-3.5 rounded-2xl border ${
            isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Node Inspector: {selectedNode.label}</span>
            <span className="font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px]">
              {selectedNode.value}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5">
            {selectedNode.description}
          </p>

          {selectedNode.equation && (
            <div className="mt-2 text-xs font-mono bg-slate-900 text-emerald-400 p-2 rounded-lg border border-slate-800">
              Formulation: {selectedNode.equation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
