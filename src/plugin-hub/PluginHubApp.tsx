import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Header } from './components/Header';
import { SoftwareTabs } from './components/SoftwareTabs';
import { PluginShortCard } from './components/PluginShortCard';
import { PluginDetailModal } from './components/PluginDetailModal';
import { QuickGuideCard } from './components/QuickGuideCard';
import { SoftwareGroupsSection } from './components/SoftwareGroupsSection';
import { SOFTWARE_LIST, PLUGINS_DATA } from './data/plugins';
import type { SoftwareId, PluginItem, Language, MainNavTab } from './types';
import { UI_TEXT } from './data/translations';
import { FilterX, Layers, PackageCheck } from 'lucide-react';
import { Link } from '@/components/shared/Link';

/**
 * EVLab Plugin Hub — embedded inside the main EVLab shell at /plugins.
 * The site-wide Navbar/Footer and the light/dark theme come from EVLab itself;
 * this component only renders the hub's own sub-header, catalog and download UI.
 */
export default function PluginHubApp() {
  // Application language is strictly English as requested
  const lang: Language = 'en';

  // Theme is owned by EVLab's ThemeProvider (toggle lives in the main Navbar).
  const { theme } = useTheme();

  const [currentNavTab, setCurrentNavTab] = useState<MainNavTab>('plugins');
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalPlugin, setActiveModalPlugin] = useState<PluginItem | null>(null);

  const t = UI_TEXT[lang];
  const isBn = false;

  // Filter plugins based on selected software tab and search query
  const filteredPlugins = useMemo(() => {
    return PLUGINS_DATA.filter((plugin) => {
      const matchesSoftware =
        selectedSoftware === 'all' || plugin.softwareId === selectedSoftware;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesSoftware;

      const matchesSearch =
        plugin.nameEn.toLowerCase().includes(q) ||
        plugin.categoryEn.toLowerCase().includes(q) ||
        plugin.shortSummaryEn.toLowerCase().includes(q) ||
        plugin.fileName.toLowerCase().includes(q) ||
        plugin.fileFormat.toLowerCase().includes(q) ||
        (plugin.quickCommand && plugin.quickCommand.toLowerCase().includes(q));

      return matchesSoftware && matchesSearch;
    });
  }, [selectedSoftware, searchQuery]);

  // Plugin counts by software
  const pluginCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SOFTWARE_LIST.forEach((sw) => {
      counts[sw.id] = PLUGINS_DATA.filter((p) => p.softwareId === sw.id).length;
    });
    return counts;
  }, []);

  const activeModalSoftware = useMemo(() => {
    if (!activeModalPlugin) return null;
    return SOFTWARE_LIST.find((s) => s.id === activeModalPlugin.softwareId) || null;
  }, [activeModalPlugin]);

  const handleOpenPluginFromSuite = (pluginId: string) => {
    const p = PLUGINS_DATA.find((item) => item.id === pluginId);
    if (p) {
      setActiveModalPlugin(p);
    }
  };

  return (
    <div className="bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      {/* Top Header with Navigation Tabs, Search and Dark/Light Mode */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={lang}
        currentNavTab={currentNavTab}
        onNavTabChange={setCurrentNavTab}
        pluginCount={PLUGINS_DATA.length}
        theme={theme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Pointer to the ready-made packs (AutoCAD Helper, SurveyPro) hosted as static downloads */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-xs text-slate-700 dark:text-slate-300">
          <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
          <span>Looking for ready-to-install combined packs (AutoCAD Helper, SurveyPro AutoLISP Suite)?</span>
          <Link to="/plugins/packs" className="font-bold text-amber-700 dark:text-amber-400 hover:underline">
            View ready packs →
          </Link>
        </div>

        {/* VIEW 1: INDIVIDUAL PLUGINS CATALOG */}
        {currentNavTab === 'plugins' && (
          <div className="space-y-6">
            {/* Software Category Filter Tabs */}
            <section>
              <SoftwareTabs
                softwares={SOFTWARE_LIST}
                selectedSoftware={selectedSoftware}
                onSelectSoftware={setSelectedSoftware}
                pluginCounts={pluginCounts}
                lang={lang}
              />
            </section>

            {/* Plugins Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  <span>
                    {selectedSoftware === 'all'
                      ? t.allSoftwares
                      : SOFTWARE_LIST.find((s) => s.id === selectedSoftware)?.name}
                  </span>
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {filteredPlugins.length} / {PLUGINS_DATA.length}
                </span>
              </div>

              {filteredPlugins.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <FilterX className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t.noResultsTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t.noResultsDesc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSoftware('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredPlugins.map((plugin) => {
                    const software = SOFTWARE_LIST.find((s) => s.id === plugin.softwareId)!;
                    return (
                      <PluginShortCard
                        key={plugin.id}
                        plugin={plugin}
                        software={software}
                        lang={lang}
                        onOpenDetails={(p) => setActiveModalPlugin(p)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: SOFTWARE & TASK GROUPS DOWNLOADS */}
        {currentNavTab === 'software_groups' && (
          <div className="space-y-6">
            <SoftwareGroupsSection
              lang={lang}
              onOpenPluginModal={handleOpenPluginFromSuite}
            />
          </div>
        )}

        {/* Engineers' Quick Guide Section */}
        <section>
          <QuickGuideCard lang={lang} />
        </section>
      </main>

      {/* Detail Modal / Popup */}
      <PluginDetailModal
        plugin={activeModalPlugin}
        software={activeModalSoftware}
        lang={lang}
        onClose={() => setActiveModalPlugin(null)}
      />
    </div>
  );
}

