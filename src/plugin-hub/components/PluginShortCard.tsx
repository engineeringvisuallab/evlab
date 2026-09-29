import React, { useState } from 'react';
import {
  Download,
  FileCode,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PluginItem, SoftwareInfo, Language } from '../types';
import { UI_TEXT } from '../data/translations';
import { triggerPluginDownload } from '../utils/fileDownloader';

interface PluginShortCardProps {
  plugin: PluginItem;
  software: SoftwareInfo;
  lang: Language;
  onOpenDetails: (plugin: PluginItem) => void;
}

export const PluginShortCard: React.FC<PluginShortCardProps> = ({
  plugin,
  software,
  lang,
  onOpenDetails,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const t = UI_TEXT[lang];

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    const success = await triggerPluginDownload(plugin);
    setIsDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  const name = lang === 'bn' ? plugin.nameBn : plugin.nameEn;
  const summary = lang === 'bn' ? plugin.shortSummaryBn : plugin.shortSummaryEn;
  const category = lang === 'bn' ? plugin.categoryBn : plugin.categoryEn;

  return (
    <div
      onClick={() => onOpenDetails(plugin)}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${software.accentBg} ${software.textColor} border ${software.borderColor}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: software.brandColor }}
            />
            {software.shortName}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-900 dark:bg-slate-800 text-amber-300">
              <FileCode className="w-3 h-3" />
              {plugin.fileFormat}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{plugin.fileSize}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
          {name}
        </h3>

        {/* Category tag */}
        <div className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
          {category}
        </div>

        {/* Short Summary (1-2 lines) */}
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* View Details button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(plugin);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white group-hover:translate-x-0.5 transition-all cursor-pointer"
        >
          <span>{t.viewDetailsBtn}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Direct Download button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            downloadSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 active:scale-95'
          }`}
          title={`${t.downloadBtn} ${plugin.fileName}`}
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>{t.downloaded}</span>
            </>
          ) : isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>{t.downloading}</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadBtn} ({plugin.fileFormat})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
