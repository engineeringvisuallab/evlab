/**
 * EVLab BOQ - Project Management Modal (Create / Edit Project)
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ProjectType, MeasurementSystem, CurrencyCode } from '../../types';
import { X, FolderPlus, Save, Building, MapPin, Calendar, DollarSign } from 'lucide-react';

interface ProjectModalProps {
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ onClose }) => {
  const { createNewProject, activeProject, updateActiveProjectInfo } = useAppStore();

  const isEditing = false; // By default create new in this modal instance

  const [formData, setFormData] = useState({
    name: 'South Region Sewerage & Drainage Treatment Works',
    code: `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
    client: 'Dhaka WASA / Chattogram WASA',
    employer: 'Local Government Engineering Department (LGED)',
    consultant: 'EVLab Civil Engineering Partners Ltd.',
    contractor: 'Max Infrastructure & Engineering Ltd.',
    projectType: 'Sewerage' as ProjectType,
    location: 'Halishahar, Chattogram',
    contractNumber: 'CWASA/SD/2026/04',
    tenderNumber: 'TND-2026-8812',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
    currencyCode: 'BDT' as CurrencyCode,
    measurementSystem: 'metric' as MeasurementSystem,
    rateDatabase: 'PWD-2024-Schedule-of-Rates',
    description: 'Construction of Trunk Sewerage Mains, Lift Stations, and Primary Treatment Units.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNewProject({
      ...formData,
      currency: {
        code: formData.currencyCode,
        symbol: formData.currencyCode === 'BDT' ? '৳ ' : '$ ',
        decimalPlaces: 2,
        thousandSeparator: ',',
        decimalSeparator: '.',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FolderPlus className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100 font-mono">Create Engineering Project</h3>
              <p className="text-[11px] text-slate-400">Initialize new civil engineering BOQ workspace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans max-h-[80vh] overflow-y-auto">
          {/* General Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Project ID / Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Project Type</label>
              <select
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value as ProjectType })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="Building">Building</option>
                <option value="Road">Road & Highways</option>
                <option value="Bridge">Bridge & Structure</option>
                <option value="Water Supply">Water Supply Network</option>
                <option value="Sewerage">Sewerage & Drainage</option>
                <option value="WTP">Water Treatment Plant (WTP)</option>
                <option value="STP">Sewage Treatment Plant (STP)</option>
                <option value="Pump Station">Pump Station</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="General Civil">General Civil Works</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Currency</label>
              <select
                value={formData.currencyCode}
                onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value as CurrencyCode })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="BDT">BDT (৳ Taka)</option>
                <option value="USD">USD ($ Dollar)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="GBP">GBP (£ Pound)</option>
                <option value="INR">INR (₹ Rupee)</option>
                <option value="AED">AED (Dirham)</option>
                <option value="SAR">SAR (Riyal)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Measurement System</label>
              <select
                value={formData.measurementSystem}
                onChange={(e) => setFormData({ ...formData, measurementSystem: e.target.value as MeasurementSystem })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="metric">Metric System (m, m², m³, kg, ton)</option>
                <option value="imperial">Imperial System (ft, ft², ft³, lbs)</option>
              </select>
            </div>
          </div>

          {/* Stakeholders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Client Authority</label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Consultant Firm</label>
              <input
                type="text"
                value={formData.consultant}
                onChange={(e) => setFormData({ ...formData, consultant: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Main Contractor</label>
              <input
                type="text"
                value={formData.contractor}
                onChange={(e) => setFormData({ ...formData, contractor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Location / Site</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Dates & Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Contract No</label>
              <input
                type="text"
                value={formData.contractNumber}
                onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Tender No</label>
              <input
                type="text"
                value={formData.tenderNumber}
                onChange={(e) => setFormData({ ...formData, tenderNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Project Scope & Remarks</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center space-x-1.5 shadow-lg shadow-cyan-950/50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Initialize Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
