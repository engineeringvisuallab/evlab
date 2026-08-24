/**
 * EVLab BOQ - Measurement Book (MB) Module
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency } from '../core/currency';
import { BookOpenCheck, Plus, Trash2 } from 'lucide-react';

export const MeasurementPage: React.FC = () => {
  const { activeProject, boqItems, measurements, addMeasurement } = useAppStore();

  const [boqItemId, setBoqItemId] = useState(boqItems.find((i) => !i.isHeader)?.id || '');
  const [desc, setDesc] = useState('Site Measurement Record');
  const [loc, setLoc] = useState('Ch 0+000 to Ch 0+500');
  const [len, setLen] = useState(500);
  const [wid, setWid] = useState(2);
  const [dep, setDep] = useState(1.5);
  const [num, setNum] = useState(1);

  const calculatedQty = len * wid * dep * num;

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addMeasurement({
      boqItemId,
      description: desc,
      location: loc,
      length: len,
      width: wid,
      depth: dep,
      number: num,
      quantity: calculatedQty,
      previousQuantity: 0,
    });
    alert('Added measurement record to Measurement Book!');
  };

  return (
    <div className="p-5 space-y-5 text-slate-100 font-sans max-w-[1600px] mx-auto">
      <div className="border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100 font-mono flex items-center space-x-2">
          <BookOpenCheck className="w-5 h-5 text-cyan-400" />
          <span>Measurement Book (MB Record)</span>
        </h1>
        <p className="text-xs text-slate-400">
          Field site quantity measurements linked directly to BOQ line items
        </p>
      </div>

      {/* Add Measurement Form */}
      <form onSubmit={handleAddMeasurement} className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-cyan-300 uppercase">Record Field Measurement</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-slate-400">BOQ Item</label>
            <select
              value={boqItemId}
              onChange={(e) => setBoqItemId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 mt-1"
            >
              {boqItems.filter((i) => !i.isHeader).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.itemCode} - {item.description.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 mt-1"
            />
          </div>

          <div>
            <label className="text-slate-400">Location / Chainage</label>
            <input
              type="text"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100 mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Entry</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="text-slate-400">Length (L)</label>
            <input type="number" step="any" value={len} onChange={(e) => setLen(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100" />
          </div>
          <div>
            <label className="text-slate-400">Width (W)</label>
            <input type="number" step="any" value={wid} onChange={(e) => setWid(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100" />
          </div>
          <div>
            <label className="text-slate-400">Depth / Height (D)</label>
            <input type="number" step="any" value={dep} onChange={(e) => setDep(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100" />
          </div>
          <div>
            <label className="text-slate-400">Number (N)</label>
            <input type="number" step="any" value={num} onChange={(e) => setNum(parseFloat(e.target.value) || 0)} className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-100" />
          </div>
          <div>
            <label className="text-slate-400">Calculated Quantity</label>
            <div className="p-1 bg-slate-950 text-emerald-300 font-bold rounded border border-slate-800 text-right">
              {calculatedQty}
            </div>
          </div>
        </div>
      </form>

      {/* Measurement Book Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
            <tr>
              <th className="p-2.5">MB No</th>
              <th className="p-2.5">Date</th>
              <th className="p-2.5">BOQ Item</th>
              <th className="p-2.5">Description</th>
              <th className="p-2.5">Location</th>
              <th className="p-2.5 text-right">L</th>
              <th className="p-2.5 text-right">W</th>
              <th className="p-2.5 text-right">D</th>
              <th className="p-2.5 text-right">N</th>
              <th className="p-2.5 text-right">Current Qty</th>
              <th className="p-2.5 text-right">Cumulative Qty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {measurements.map((m) => {
              const item = boqItems.find((i) => i.id === m.boqItemId);
              return (
                <tr key={m.id} className="hover:bg-slate-950/60">
                  <td className="p-2.5 font-bold text-cyan-400">{m.measurementNo}</td>
                  <td className="p-2.5 text-slate-400">{m.date}</td>
                  <td className="p-2.5 font-bold text-amber-300">{item?.itemCode || '---'}</td>
                  <td className="p-2.5 text-slate-200 font-sans">{m.description}</td>
                  <td className="p-2.5 text-slate-400">{m.location}</td>
                  <td className="p-2.5 text-right">{m.length}</td>
                  <td className="p-2.5 text-right">{m.width}</td>
                  <td className="p-2.5 text-right">{m.depth}</td>
                  <td className="p-2.5 text-right">{m.number}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-300">{m.quantity}</td>
                  <td className="p-2.5 text-right font-bold text-cyan-300">{m.cumulativeQuantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
