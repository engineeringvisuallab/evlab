import { useEffect, useState } from 'react'
import { Cloud } from 'lucide-react'
import { CoreProvider, useCore } from '@/core/store/coreStore'
import { Sidebar as CoreSidebar, WorkspaceTab } from '@/components/layout/CoreSidebar'
import { Header as CoreHeader } from '@/components/layout/CoreHeader'
import { NotificationDrawer as CoreNotificationDrawer } from '@/components/layout/CoreNotificationDrawer'
import { QuickSearchModal } from '@/components/common/QuickSearchModal'
import { DashboardView } from '@/components/workspace/DashboardView'
import { ProjectsView } from '@/components/workspace/ProjectsView'
import { RegistryView } from '@/components/workspace/RegistryView'
import { TransfersView } from '@/components/workspace/TransfersView'
import { DatasetsView } from '@/components/workspace/DatasetsView'
import { ValidationView } from '@/components/workspace/ValidationView'
import { AuditView } from '@/components/workspace/AuditView'
import { StorageView } from '@/components/workspace/StorageView'
import { SDKExplorerView } from '@/components/workspace/SDKExplorerView'
import { ProvingBenchView } from '@/components/workspace/ProvingBenchView'
import { TestRunnerView } from '@/components/workspace/TestRunnerView'
import { SettingsView } from '@/components/workspace/SettingsView'

interface EVSoftwareWorkspacePageProps {
  onOpenTool: (route: string) => void
  /** Tab to open on mount, e.g. when arriving from a planet in the Space
   * Universe view (`/ev-software/workspace/<tab>`). Falls back to 'dashboard'. */
  initialTab?: WorkspaceTab
  /** When provided, the sidebar shows a "Space Universe" button that calls
   * this to navigate back to the planetary EV Software Space view. */
  onReturnToUniverse?: () => void
}

/**
 * EV Software Workspace — the full EV Software Core admin/dev console:
 * Dashboard, Project Workspaces, Application Registry, Data Transfers,
 * Datasets & Revisions, Validation Center, Audit Trail, Storage
 * Abstraction, SDK Explorer, the GIS <-> Mini CAD proving bench, and the
 * automated compliance Test Runner — all reading from the same shared
 * EV Software Core state (see @/core/store/coreStore).
 *
 * The real EVLab applications (WTP, STP, GIS, Mini CAD, BOQ, WaterFlow,
 * Sheet, BIM, Project Planner) are registered in the Core's application
 * registry (see @/core/store/initialData.ts) and open, unmodified, via
 * `onOpenTool`, which the parent App.tsx routes to `/software/<route>`.
 */
function EVSoftwareWorkspaceContent({ onOpenTool, initialTab, onReturnToUniverse }: EVSoftwareWorkspacePageProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab ?? 'dashboard')
  // Keep in sync if the caller navigates to a different tab while this page
  // stays mounted (e.g. re-entering the workspace at a different route).
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { applications, notifications } = useCore()
  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-[720px] overflow-hidden rounded-none border-t border-slate-800 bg-slate-950 text-slate-100">
      <CoreSidebar activeTab={activeTab} onSelectTab={setActiveTab} onReturnToUniverse={onReturnToUniverse} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <CoreHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleNotifications={() => setIsNotificationsOpen((v) => !v)}
          unreadCount={unreadCount}
        />
        <QuickSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab)
            setIsSearchOpen(false)
          }}
        />
        <CoreNotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'projects' && <ProjectsView />}
          {activeTab === 'registry' && <RegistryView />}
          {activeTab === 'transfers' && <TransfersView />}
          {activeTab === 'datasets' && <DatasetsView />}
          {activeTab === 'validation' && <ValidationView />}
          {activeTab === 'audit' && <AuditView />}
          {activeTab === 'storage' && <StorageView />}
          {activeTab === 'sdk' && <SDKExplorerView />}
          {activeTab === 'proving_bench' && <ProvingBenchView />}
          {activeTab === 'tests' && <TestRunnerView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'drive' && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
              <Cloud className="h-10 w-10" />
              <p className="max-w-sm text-sm">
                Google Drive Sync needs its own OAuth credentials and hasn't been wired into this
                deployment yet. Everything else on this page (Registry, Transfers, Datasets,
                Validation, Audit, Storage, SDK, Tests) works fully in-browser.
              </p>
            </div>
          )}
        </main>

        {activeTab === 'registry' && applications.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Open a registered app:</span>
              {applications
                .filter((app) => app.releaseStatus === 'ga' && !app.entryRoute.startsWith('ev-'))
                .map((app) => (
                  <button
                    key={app.appId}
                    onClick={() => onOpenTool(app.entryRoute)}
                    className="rounded-full border border-slate-700 px-3 py-1 hover:border-cyan-500 hover:text-cyan-300"
                  >
                    {app.name}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function EVSoftwareWorkspacePage(props: EVSoftwareWorkspacePageProps) {
  return (
    <CoreProvider>
      <EVSoftwareWorkspaceContent {...props} />
    </CoreProvider>
  )
}
