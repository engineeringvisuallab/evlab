import React from 'react';
import { SoftwareInfo, SoftwareId, Language } from '../types';
import { UI_TEXT } from '../data/translations';

interface SoftwareTabsProps {
  softwares: SoftwareInfo[];
  selectedSoftware: SoftwareId | 'all';
  onSelectSoftware: (id: SoftwareId | 'all') => void;
  pluginCounts: Record<string, number>;
  lang: Language;
}

export const SoftwareTabs: React.FC<SoftwareTabsProps> = ({
  softwares,
  selectedSoftware,
  onSelectSoftware,
  pluginCounts,
  lang,
}) => {
  const t = UI_TEXT[lang];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          {t.selectSoftwareLabel}
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {Object.values(pluginCounts).reduce((a, b) => a + b, 0)} {t.showingCount}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* 'All' Tab */}
        <button
          type="button"
          onClick={() => onSelectSoftware('all')}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
            selectedSoftware === 'all'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>{t.allSoftwares}</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
              selectedSoftware === 'all' ? 'bg-slate-700 dark:bg-slate-950 text-white dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {Object.values(pluginCounts).reduce((a, b) => a + b, 0)}
          </span>
        </button>

        {/* Individual Software Tabs */}
        {softwares.map((sw) => {
          const isSelected = selectedSoftware === sw.id;
          const count = pluginCounts[sw.id] || 0;

          return (
            <button
              key={sw.id}
              type="button"
              onClick={() => onSelectSoftware(sw.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: sw.brandColor }}
              />
              <span>{sw.shortName}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono ${
                  isSelected ? 'bg-slate-700 dark:bg-slate-950 text-white dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {sw.fileFormat}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
