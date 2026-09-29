import React from 'react';
import { Search, Sparkles, Layers, Package, Sun, Moon } from 'lucide-react';
import { Language, MainNavTab, Theme } from '../types';
import { UI_TEXT } from '../data/translations';
import { SOFTWARE_GROUPS } from '../data/softwareGroups';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentNavTab: MainNavTab;
  onNavTabChange: (tab: MainNavTab) => void;
  pluginCount: number;
  theme: Theme;
  onToggleTheme?: () => void;
  lang?: Language;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  currentNavTab,
  onNavTabChange,
  pluginCount,
  theme,
  onToggleTheme,
  lang = 'en',
}) => {
  const t = UI_TEXT.en;

  return (
    <header className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between min-h-14 sm:min-h-16 py-2 gap-2 sm:gap-4">
          {/* 1. Left: Logo & Branding in 2 Lines */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white uppercase sm:normal-case">
                EVLab
              </span>
              <span className="text-[11px] sm:text-xs font-black text-amber-600 dark:text-amber-500 tracking-tight mt-0.5">
                Plugin Hub
              </span>
            </div>
          </div>

          {/* 2. Primary Navigation Buttons */}
          <div className="flex items-center order-3 sm:order-none w-full sm:w-auto bg-slate-100/95 dark:bg-slate-800/90 p-1 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
            <button
              type="button"
              onClick={() => onNavTabChange('plugins')}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentNavTab === 'plugins'
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 shrink-0 ${currentNavTab === 'plugins' ? (theme === 'dark' ? 'text-slate-950' : 'text-amber-400') : 'text-slate-500 dark:text-slate-400'}`} />
              <span><span className="hidden sm:inline">Individual </span>Plugins</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                  currentNavTab === 'plugins'
                    ? (theme === 'dark' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-300')
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {pluginCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavTabChange('software_groups')}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentNavTab === 'software_groups'
                  ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
              }`}
            >
              <Package className={`w-3.5 h-3.5 shrink-0 ${currentNavTab === 'software_groups' ? (theme === 'dark' ? 'text-slate-950' : 'text-white') : 'text-slate-500 dark:text-slate-400'}`} />
              <span><span className="hidden sm:inline">Group </span>Packages</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                  currentNavTab === 'software_groups'
                    ? (theme === 'dark' ? 'bg-slate-950 text-amber-300' : 'bg-amber-700 text-amber-100')
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {SOFTWARE_GROUPS.length}
              </span>
            </button>
          </div>

          {/* 3. Right: Search bar & Dark/Light Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative w-36 sm:w-44 md:w-52 lg:w-60">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                id="search-plugins-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-6 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Theme toggle only when the host doesn't already provide one (EVLab navbar does). */}
            {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:text-slate-950 dark:hover:text-amber-300 hover:bg-slate-200/70 dark:hover:bg-slate-750 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 stroke-[2.2] text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 stroke-[2.2] text-slate-600" />
              )}
            </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


