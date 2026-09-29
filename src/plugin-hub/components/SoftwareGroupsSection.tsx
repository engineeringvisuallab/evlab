import React, { useState, useMemo } from 'react';
import { Language, SoftwareGroup } from '../types';
import { SOFTWARE_GROUPS } from '../data/softwareGroups';
import { PLUGINS_DATA } from '../data/plugins';
import {
  Download,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  FolderArchive,
  Check,
  ExternalLink,
  Laptop,
  Search,
  SlidersHorizontal,
  Compass,
  FileCheck,
} from 'lucide-react';
import { triggerSoftwareGroupDownload } from '../utils/fileDownloader';

// Only plugins that have a standalone detail page can open the modal; group-only
// items (e.g. Blender / 3ds Max / bundled packs) are shown as plain, non-clickable chips.
const DETAIL_PLUGIN_IDS = new Set(PLUGINS_DATA.map((p) => p.id));

interface SoftwareGroupsSectionProps {
  lang: Language;
  onOpenPluginModal?: (pluginId: string) => void;
}

export const SoftwareGroupsSection: React.FC<SoftwareGroupsSectionProps> = ({
  lang,
  onOpenPluginModal,
}) => {
  const isBn = lang === 'bn';
  const [selectedSoftware, setSelectedSoftware] = useState<string>('all');
  const [selectedWorkCategory, setSelectedWorkCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingGroupId, setDownloadingGroupId] = useState<string | null>(null);
  const [successGroupId, setSuccessGroupId] = useState<string | null>(null);

  const softwareFilterOptions = [
    { id: 'all', nameEn: 'All Softwares', nameBn: 'সকল সফটওয়্যার', icon: '🌐' },
    { id: 'sketchup', nameEn: 'SketchUp (.rbz)', nameBn: 'স্কেচআপ (.rbz)', icon: '🏛️' },
    { id: 'autocad', nameEn: 'AutoCAD (.lsp)', nameBn: 'অটোক্যাড (.lsp)', icon: '📐' },
    { id: 'blender', nameEn: 'Blender (.py)', nameBn: 'ব্লেন্ডার (.py)', icon: '🎨' },
    { id: '3dsmax', nameEn: '3ds Max (.ms)', nameBn: 'থ্রিডিএস ম্যাক্স (.ms)', icon: '🏢' },
    { id: 'revit', nameEn: 'Revit (.dyn)', nameBn: 'রেভিট (.dyn)', icon: '🏗️' },
  ];

  const workCategories = [
    { id: 'all', nameEn: 'All Works', nameBn: 'সকল কাজের গ্রুপ' },
    { id: 'transportation', nameEn: 'Transportation', nameBn: 'ট্রান্সপোর্টেশন ও অবকাঠামো' },
    { id: 'architecture', nameEn: 'Architecture', nameBn: 'আর্কিটেকচারাল উপাদান' },
    { id: 'estimating', nameEn: 'Estimating & BOQ', nameBn: 'এস্টিমেটিং ও পরিমাপ' },
    { id: 'survey_civil', nameEn: 'Survey & Site', nameBn: 'সার্ভে ও সাইট সিভিল' },
    { id: 'vertex_3d', nameEn: '3D Mesh & Sculpt', nameBn: '৩ডি ম্যাশ ও ভার্টেক্স' },
    { id: 'bim', nameEn: 'BIM Automation', nameBn: 'বিম অটোমেশন' },
  ];

  const filteredGroups = useMemo(() => {
    return SOFTWARE_GROUPS.filter((group) => {
      // Software filter
      if (selectedSoftware !== 'all' && group.softwareId !== selectedSoftware && group.softwareId !== 'all') {
        return false;
      }
      // Work category filter
      if (
        selectedWorkCategory !== 'all' &&
        group.workCategoryKey !== selectedWorkCategory &&
        group.workCategoryKey !== 'all'
      ) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle =
          group.nameEn.toLowerCase().includes(q) ||
          group.nameBn.toLowerCase().includes(q) ||
          group.downloadFileName.toLowerCase().includes(q);
        const matchDesc =
          group.descriptionEn.toLowerCase().includes(q) ||
          group.descriptionBn.toLowerCase().includes(q) ||
          group.workCategoryEn.toLowerCase().includes(q);
        const matchPlugins = group.includedPlugins.some(
          (p) =>
            p.nameEn.toLowerCase().includes(q) ||
            p.nameBn.toLowerCase().includes(q) ||
            p.descriptionEn.toLowerCase().includes(q),
        );
        return matchTitle || matchDesc || matchPlugins;
      }
      return true;
    });
  }, [selectedSoftware, selectedWorkCategory, searchQuery]);

  const handleDownload = async (group: SoftwareGroup) => {
    setDownloadingGroupId(group.id);
    const ok = await triggerSoftwareGroupDownload(group);
    setDownloadingGroupId(null);
    if (ok) {
      setSuccessGroupId(group.id);
      setTimeout(() => setSuccessGroupId(null), 3500);
    }
  };

  return (
    <section className="space-y-6">
      {/* Filter and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 transition-colors">
        {/* Row 1: Software Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">
              {isBn ? 'সফটওয়্যার:' : 'Software:'}
            </span>
            {softwareFilterOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedSoftware(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSoftware === opt.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{isBn ? opt.nameBn : opt.nameEn}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'গ্রুপ বা ফাইলের নাম খুঁজুন...' : 'Search groups or file names...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Row 2: Work / Discipline Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isBn ? 'কাজের ধরন:' : 'Work Type:'}</span>
          </span>
          {workCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedWorkCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedWorkCategory === cat.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {isBn ? cat.nameBn : cat.nameEn}
            </button>
          ))}
          {(selectedSoftware !== 'all' || selectedWorkCategory !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedSoftware('all');
                setSelectedWorkCategory('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-medium">
        <span>
          {isBn
            ? `মোট ${filteredGroups.length}টি গ্রুপ প্যাকেজ পাওয়া গেছে`
            : `Showing ${filteredGroups.length} group packages`}
        </span>
        <span className="hidden sm:inline">
          {isBn
            ? 'সরাসরি এক্সটেনশন ফাইল (.rbz / .zip) ডাউনলোড হবে'
            : 'Downloads direct extension files ready to install'}
        </span>
      </div>

      {/* Grid of Software & Task Groups */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isBn ? 'কোনো গ্রুপ পাওয়া যায়নি' : 'No matching groups found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isBn ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try changing your filters or search term.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSoftware('all');
              setSelectedWorkCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
          >
            {isBn ? 'সকল গ্রুপ দেখুন' : 'Show All Groups'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const isDownloading = downloadingGroupId === group.id;
            const isSuccess = successGroupId === group.id;
            const isSketchupRbz = group.fileFormat === '.rbz';

            return (
              <div
                key={group.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Header color accent bar */}
                <div className={`h-2.5 w-full bg-gradient-to-r ${group.accentGradient}`} />

                <div className="p-5 space-y-4 flex-1">
                  {/* Software Badge & Title */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                        {group.icon}
                      </span>
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span>{group.softwareName}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {isBn ? group.workCategoryBn : group.workCategoryEn}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                          {isBn ? group.nameBn : group.nameEn}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* File Format & File Size Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                        isSketchupRbz
                          ? 'bg-sky-100 dark:bg-sky-950 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-extrabold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {group.downloadFileName}
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}>
                      {isBn ? group.badgeBn : group.badgeEn}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold ml-auto">
                      {group.fileCount} {isBn ? 'টি প্লাগইন' : 'plugins'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isBn ? group.descriptionBn : group.descriptionEn}
                  </p>

                  {/* Included Plugins List */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>
                        {isBn
                          ? `গ্রুপে অন্তর্ভুক্ত প্লাগইনসমূহ (${group.includedPlugins.length}টি):`
                          : `Included Tools in Group (${group.includedPlugins.length}):`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {group.includedPlugins.map((plugin) => {
                        const hasDetail = DETAIL_PLUGIN_IDS.has(plugin.id);
                        return (
                        <div
                          key={plugin.id}
                          onClick={hasDetail ? () => onOpenPluginModal && onOpenPluginModal(plugin.id) : undefined}
                          className={hasDetail ? "flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-300 dark:hover:border-amber-700 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group/item" : "flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-700 dark:text-slate-300 group/item"}
                        >
                          <div className="truncate">
                            <span className="font-bold text-slate-900 dark:text-white group-hover/item:text-amber-800 dark:group-hover/item:text-amber-400">
                              {isBn ? plugin.nameBn : plugin.nameEn}
                            </span>
                          </div>
                          {hasDetail && (
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover/item:text-amber-600 shrink-0" />
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Installation Guide Note */}
                  <div className="bg-slate-50/90 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                      <span>{isBn ? 'সহজ ইনস্টলেশন পদ্ধতি:' : 'Quick Installation:'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-mono">
                      {isBn ? group.quickInstallBn : group.quickInstallEn}
                    </p>
                  </div>
                </div>

                {/* Direct 1-Click Download Button */}
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDownload(group)}
                    disabled={isDownloading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : isDownloading
                        ? 'bg-slate-400 text-white cursor-wait'
                        : isSketchupRbz
                        ? 'bg-sky-700 hover:bg-sky-800 text-white active:scale-[0.99]'
                        : 'bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 active:scale-[0.99]'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isBn ? 'ডাউনলোড সম্পন্ন হয়েছে!' : 'Download Completed!'}</span>
                      </>
                    ) : isDownloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {isBn
                            ? `${group.downloadFileName} প্রস্তুত হচ্ছে...`
                            : `Preparing ${group.downloadFileName}...`}
                        </span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-amber-300 dark:text-slate-950" />
                        <span>
                          {isBn
                            ? `ডাউনলোড করুন ${group.downloadFileName}`
                            : `Download ${group.downloadFileName}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
