import React, { useState } from 'react';
import { Language, PluginSuite, SuiteDownloadTarget } from '../types';
import { PLUGIN_SUITES } from '../data/suites';
import { PLUGINS_DATA } from '../data/plugins';
import {
  Download,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  FolderArchive,
  ChevronRight,
  HardDrive,
  Info,
  Check,
  ExternalLink,
} from 'lucide-react';
import { triggerSuiteDownload } from '../utils/fileDownloader';

interface SuiteBundlesSectionProps {
  lang: Language;
  onOpenPluginModal?: (pluginId: string) => void;
}

export const SuiteBundlesSection: React.FC<SuiteBundlesSectionProps> = ({
  lang,
  onOpenPluginModal,
}) => {
  const isBn = lang === 'bn';
  const [downloadingSuiteId, setDownloadingSuiteId] = useState<string | null>(null);
  const [successSuiteId, setSuccessSuiteId] = useState<string | null>(null);
  const [selectedSoftwareTargets, setSelectedSoftwareTargets] = useState<
    Record<string, SuiteDownloadTarget>
  >({
    'suite-architect': 'all',
    'suite-transportation': 'all',
    'suite-vertex': 'all',
    'suite-master-all': 'all',
  });

  const handleDownloadSuite = async (suite: PluginSuite) => {
    const target = selectedSoftwareTargets[suite.id] || 'all';
    setDownloadingSuiteId(suite.id);
    const ok = await triggerSuiteDownload(suite, target);
    setDownloadingSuiteId(null);
    if (ok) {
      setSuccessSuiteId(suite.id);
      setTimeout(() => setSuccessSuiteId(null), 3500);
    }
  };

  const setTarget = (suiteId: string, target: SuiteDownloadTarget) => {
    setSelectedSoftwareTargets((prev) => ({ ...prev, [suiteId]: target }));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-800 text-white shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Package className="w-3.5 h-3.5" />
            <span>{isBn ? 'গ্রুপ / স্যুট বান্ডেল ডাউনলোড' : 'Group & Suite Bundles'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isBn
              ? 'ক্যাটাগরি ভিত্তিক কমপ্লিট প্যাকেজ ডাউনলোড'
              : 'One-Click Engineering & Architectural Suites'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isBn
              ? 'আলাদা আলাদা একটি করে প্লাগইন না নামিয়ে আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ স্যুট এক ক্লিকে ডাউনলোড করুন। সব সফটওয়্যারের (SketchUp, AutoCAD, Blender, 3ds Max) স্ক্রিপ্ট সুসংগঠিত ফোল্ডারে অন্তর্ভুক্ত।'
              : 'Download complete plugin ecosystems in unified ZIP archives. Includes sorted directories and master auto-loaders for SketchUp, AutoCAD, Blender, and 3ds Max.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <FolderArchive className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <div className="font-bold text-white">{isBn ? '১০০% অফলাইন' : '100% Offline'}</div>
            <div className="text-slate-400">{isBn ? 'মাস্টার অটো-লোডার সহ' : 'Auto-Loaders included'}</div>
          </div>
        </div>
      </div>

      {/* Grid of Suites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLUGIN_SUITES.map((suite) => {
          const currentTarget = selectedSoftwareTargets[suite.id] || 'all';
          const isDownloading = downloadingSuiteId === suite.id;
          const isSuccess = successSuiteId === suite.id;

          // Find included plugins
          const includedPlugins = PLUGINS_DATA.filter((p) =>
            suite.includedPluginIds.includes(p.id),
          );

          return (
            <div
              key={suite.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Top Accent Strip */}
              <div className={`h-2.5 w-full bg-gradient-to-r ${suite.accentColor}`} />

              <div className="p-5 sm:p-6 space-y-4 flex-1">
                {/* Badges & Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{suite.icon}</span>
                    <span className="font-mono text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                      {suite.codeName}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${suite.badgeColor}`}>
                    {isBn ? suite.badgeBn : suite.badgeEn}
                  </span>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                    {isBn ? suite.nameBn : suite.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isBn ? suite.taglineBn : suite.taglineEn}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isBn ? suite.descriptionBn : suite.descriptionEn}
                </p>

                {/* Included Plugins Pills */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{isBn ? `অন্তর্ভুক্ত প্লাগইন (${includedPlugins.length}টি):` : `Bundled Tools (${includedPlugins.length}):`}</span>
                    <span className="text-slate-400 font-normal">{suite.estimatedTotalSize}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {includedPlugins.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onOpenPluginModal && onOpenPluginModal(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-[11px] text-slate-700 hover:text-amber-900 transition-colors"
                        title={isBn ? p.nameBn : p.nameEn}
                      >
                        <span className="font-semibold">{p.fileName.replace(/\.[a-z]+$/i, '')}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Highlights List */}
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                  {(isBn ? suite.highlightsBn : suite.highlightsEn).slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="bg-slate-50/90 p-4 sm:p-5 border-t border-slate-100 space-y-3">
                {/* Target Software Format Selector */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600">
                    {isBn ? 'সফটওয়্যার টার্গেট পছন্দ করুন:' : 'Target Software Format:'}
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTarget(suite.id, 'all')}
                      className={`px-2 py-1.5 rounded-lg border font-medium transition-all text-center ${
                        currentTarget === 'all'
                          ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {isBn ? 'সব সফটওয়্যার (ZIP)' : 'All Software (.zip)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarget(suite.id, 'sketchup')}
                      className={`px-2 py-1.5 rounded-lg border font-medium transition-all text-center ${
                        currentTarget === 'sketchup'
                          ? 'bg-sky-600 border-sky-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      SketchUp (.rbz)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTarget(suite.id, 'autocad')}
                      className={`px-2 py-1.5 rounded-lg border font-medium transition-all text-center ${
                        currentTarget === 'autocad'
                          ? 'bg-red-600 border-red-600 text-white font-bold shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      AutoCAD (.lsp)
                    </button>
                  </div>
                </div>

                {/* 1-Click Suite Download Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSuite(suite)}
                  disabled={isDownloading}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold shadow-sm transition-all ${
                    isSuccess
                      ? 'bg-emerald-600 text-white'
                      : isDownloading
                      ? 'bg-slate-400 text-white cursor-wait'
                      : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-[0.99]'
                  }`}
                >
                  {isSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isBn ? 'স্যুট ডাউনলোড সম্পন্ন হয়েছে!' : 'Suite Download Completed!'}</span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isBn ? 'স্যুট প্যাকেজ তৈরি হচ্ছে...' : 'Compressing Suite ZIP...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-amber-300" />
                      <span>
                        {isBn
                          ? `ডাউনলোড ${suite.codeName} কমপ্লিট স্যুট (.ZIP)`
                          : `Download ${suite.codeName} Complete Suite (.ZIP)`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
