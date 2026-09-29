/**
 * EVLab BOQ - Resource Libraries & Engineering Master Templates
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Library, Layers, BookOpen, FileCode } from 'lucide-react';

export const LibrariesPage: React.FC = () => {
  const { materials, labour, equipment } = useAppStore();

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Library className="w-5 h-5 text-cyan-400" />
          <span>Resource Libraries & Master Engineering Assemblies</span>
        </h1>
        <p className="text-xs text-slate-400">
          Centralized repository of material specifications, labour coefficients, and parametric takeoff templates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <BookOpen className="w-4 h-4" />
            <span>Materials Schedule</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{materials.length} Master Items</p>
          <p className="text-slate-400 text-[11px] font-sans">
            Standard market material database covering cement, steel, aggregates, bitumen, and piping components.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Layers className="w-4 h-4" />
            <span>Labour Trades</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{labour.length} Skilled Trades</p>
          <p className="text-slate-400 text-[11px] font-sans">
            Wage rate schedules covering masons, steel fixers, plumbers, electricians, and heavy machine operators.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold">
            <FileCode className="w-4 h-4" />
            <span>Plant & Machinery</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100">{equipment.length} Equipment Types</p>
          <p className="text-slate-400 text-[11px] font-sans">
            Machinery hourly operating and hire rate database for civil engineering infrastructure projects.
          </p>
        </div>
      </div>
    </div>
  );
};
