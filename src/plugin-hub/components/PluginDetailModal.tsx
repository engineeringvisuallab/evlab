import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Laptop,
  FileCode,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PluginItem, SoftwareInfo, Language } from '../types';
import { UI_TEXT } from '../data/translations';
import { triggerPluginDownload } from '../utils/fileDownloader';
import { InteractiveSimulator } from './InteractiveSimulator';

interface PluginDetailModalProps {
  plugin: PluginItem | null;
  software: SoftwareInfo | null;
  lang: Language;
  onClose: () => void;
}

export const PluginDetailModal: React.FC<PluginDetailModalProps> = ({
  plugin,
  software,
  lang,
  onClose,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const isOpen = Boolean(plugin && software);

  // Close on Escape + lock background scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Reset transient UI state when a different plugin is opened.
  useEffect(() => {
    setDownloadSuccess(false);
    setCopiedCommand(null);
  }, [plugin?.id]);

  if (!plugin || !software) return null;

  const t = UI_TEXT[lang];

  const handleDownload = async () => {
    setIsDownloading(true);
    const success = await triggerPluginDownload(plugin);
    setIsDownloading(false);
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    }
  };

  const handleCopyCommand = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCommand(cmd);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (error) {
      // Clipboard API can be unavailable (insecure context / denied permission).
      console.error('Copy failed:', error);
    }
  };

  const name = lang === 'bn' ? plugin.nameBn : plugin.nameEn;
  const shortSummary = lang === 'bn' ? plugin.shortSummaryBn : plugin.shortSummaryEn;
  const purpose = lang === 'bn' ? plugin.purposeBn : plugin.purposeEn;
  const category = lang === 'bn' ? plugin.categoryBn : plugin.categoryEn;
  const compatibility = lang === 'bn' ? plugin.compatibilityBn : plugin.compatibilityEn;
  const highlights = lang === 'bn' ? plugin.highlightsBn : plugin.highlightsEn;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${software.accentBg} ${software.textColor} border ${software.borderColor}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: software.brandColor }}
                />
                {software.badge}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 dark:bg-slate-800 text-amber-300">
                <FileCode className="w-3 h-3" />
                {plugin.fileFormat}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {plugin.fileName} • {plugin.fileSize} • {plugin.version}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title={t.closeModal}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Overview */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="text-slate-900 dark:text-white">{t.quickOverview} </strong>
            {shortSummary}
          </div>

          {/* Interactive Simulator */}
          <div>
            <InteractiveSimulator softwareId={plugin.softwareId} lang={lang} pluginId={plugin.id} />
          </div>

          {/* Problem & Purpose */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              {t.whyNeeded}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {purpose}
            </p>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block mb-2">
                {t.coreHighlights}
              </span>
              <ul className="space-y-1.5">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Installation */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t.installGuideTitle}
              </h4>
              {plugin.quickCommand && (
                <span className="text-xs font-mono font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded">
                  {plugin.quickCommand}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {plugin.installationSteps.map((step) => {
                const stepTitle = lang === 'bn' ? step.titleBn : step.titleEn;
                const stepInst = lang === 'bn' ? step.instructionBn : step.instructionEn;

                return (
                  <div key={step.stepNumber} className="flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold flex items-center justify-center shrink-0 text-xs">
                      {step.stepNumber}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">{stepTitle}</div>
                      <div className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{stepInst}</div>
                      {step.command && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <code className="px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-950 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                            {step.command}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(step.command!)}
                            className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            {copiedCommand === step.command ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {t.copied}
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> {t.copyCommand}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/70 dark:border-amber-900/60 text-xs text-slate-500 dark:text-slate-400">
              {t.compatibility} <strong className="text-slate-700 dark:text-slate-300">{compatibility}</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>{t.fileNameLabel} </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{plugin.fileName}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              {t.closeModal}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 active:scale-95'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  {t.downloaded}
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t.downloading}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  {t.modalDownloadBtn} ({plugin.fileFormat})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
