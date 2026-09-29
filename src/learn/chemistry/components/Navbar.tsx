import React, { useState } from 'react';
import { AcademicLevel } from '../types/chemistry';
import {
  FlaskConical,
  Atom,
  Calculator,
  Search,
  GraduationCap,
  Menu,
  X,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: 'home' | 'experiments' | 'molecules' | 'learn' | 'calculator') => void;
  academicLevel: AcademicLevel;
  onAcademicLevelChange: (level: AcademicLevel) => void;
  onSearchQuery?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  academicLevel,
  onAcademicLevelChange,
  onSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const levels: AcademicLevel[] = [
    'Class 9-10',
    'HSC',
    'Diploma',
    'University',
    'Engineering'
  ];

  const navItems: Array<{ id: 'home' | 'experiments' | 'molecules' | 'learn' | 'calculator'; label: string }> = [
    { id: 'home', label: 'DASHBOARD' },
    { id: 'learn', label: 'LEARN' },
    { id: 'experiments', label: 'VIRTUAL LAB' },
    { id: 'molecules', label: 'MOLECULAR 3D' },
    { id: 'calculator', label: 'CALCULATOR' }
  ];

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-40">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-4 lg:gap-8">
        {/* Brand Icon & Title */}
        <div
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          id="nav-brand-logo"
        >
          <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-bold text-slate-900 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            EV
          </div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight uppercase text-white">
            EVLab <span className="text-teal-400">Chemistry</span>
          </h1>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold tracking-wider">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`transition-colors uppercase tracking-wider py-1 ${
                  isActive
                    ? 'text-teal-400 border-b-2 border-teal-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                id={`nav-tab-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Status Pill, Academic Tier, Search, AI Mentor */}
      <div className="flex items-center gap-3">
        {/* System Ready Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 border border-slate-700/60 px-3 py-1 rounded-full text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-500/50"></span>
          <span>SYSTEM READY</span>
        </div>

        {/* Academic Tier Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#111A2E] border border-slate-800 rounded px-2.5 py-1">
          <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
          <select
            value={academicLevel}
            onChange={(e) => onAcademicLevelChange(e.target.value as AcademicLevel)}
            className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
            id="select-academic-level"
          >
            {levels.map((lvl) => (
              <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          id="btn-mobile-menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 right-0 border-b border-slate-800 bg-[#0F172A] px-4 pt-3 pb-5 space-y-3 z-50 shadow-2xl">
          {/* Academic Level on Mobile */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#111A2E] border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-400" /> Academic Tier:
            </span>
            <select
              value={academicLevel}
              onChange={(e) => onAcademicLevelChange(e.target.value as AcademicLevel)}
              className="bg-transparent text-xs text-teal-300 font-semibold focus:outline-none"
            >
              {levels.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Nav Items */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center p-2.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/40'
                      : 'text-slate-300 bg-slate-900/60 hover:bg-slate-800'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
