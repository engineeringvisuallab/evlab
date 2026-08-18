import { Suspense, lazy } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { RouterProvider, useRouter } from '@/context/RouterContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import { UELEPage } from '@/pages/UELEPage'
import { PluginsPage } from '@/pages/PluginsPage'
import { LearnPage } from '@/pages/LearnPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { isActivePath } from '@/utils/router'

// Lazy-loaded so each EVLab-built software tool only downloads when a
// visitor actually opens it, keeping the main site bundle lean.
const WtpApp = lazy(() => import('@/software/wtp/WtpApp'))
const StpApp = lazy(() => import('@/software/stp/StpApp'))
const MiniCadApp = lazy(() => import('@/software/minicad/MiniCadApp'))
const WaterFlowApp = lazy(() => import('@/software/waterflow/WaterFlowApp'))
const GisApp = lazy(() => import('@/software/gis/GisApp'))
const BoqApp = lazy(() => import('@/software/boq/BoqApp'))
const BimViewerPage = lazy(() =>
  import('@/software/bim/BimViewer').then((m) => ({ default: m.BimViewerPage }))
)
const SheetApp = lazy(() => import('@/software/sheet/SheetApp'))
const PlannerApp = lazy(() => import('@/software/planner/PlannerApp'))
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage }))
)

// Learn > Engineering Foundations — standalone interactive subject labs,
// loaded the same lazy/standalone way as the /software tools above.
const MechanicsLab = lazy(() => import('@/learn/mechanics/MechanicsLab'))
const FluidMechanicsLab = lazy(() => import('@/learn/fluid/FluidMechanicsLab'))
const StrengthLab = lazy(() => import('@/learn/strength/StrengthLab'))
const MathematicsLab = lazy(() => import('@/learn/mathematics/MathematicsLab'))
const PhysicsLab = lazy(() => import('@/learn/physics/PhysicsLab'))
const ChemistryLab = lazy(() => import('@/learn/chemistry/ChemistryLab'))

const LAB_LOADING_LABEL: Record<string, string> = {
  mechanics: 'Loading Engineering Mechanics Lab…',
  'fluid-mechanics': 'Loading Fluid Mechanics Virtual Lab…',
  'strength-of-materials': 'Loading Strength of Materials Virtual Lab…',
  mathematics: 'Loading Mathematics Visual Lab…',
  physics: 'Loading Physics Virtual Laboratory…',
  chemistry: 'Loading Chemistry Virtual Laboratory…',
}

// EV Software — additive entry point into the existing tool ecosystem via
// EV Software Core. Does not replace /software; existing tool routes below
// are untouched.
const EVSoftwareLandingPage = lazy(() =>
  import('@/pages/EVSoftwareLandingPage').then((m) => ({ default: m.EVSoftwareLandingPage }))
)
const EVSoftwareWorkspacePage = lazy(() =>
  import('@/pages/EVSoftwareWorkspacePage').then((m) => ({ default: m.EVSoftwareWorkspacePage }))
)

const TOOL_LOADING_LABEL: Record<string, string> = {
  wtp: 'Loading EVLab WTP Design…',
  stp: 'Loading EVLab STP Design…',
  minicad: 'Loading EVLab Mini CAD…',
  waterflow: 'Loading EVLab WaterFlow…',
  gis: 'Loading EVLab GIS…',
  boq: 'Loading EVLab BOQ…',
  sheet: 'Loading EVLab Sheet…',
  planner: 'Loading EVLab Project Planner…',
}

const ROUTE_META: { path: string; title: string; stageNote: string }[] = [
  { path: '/resources', title: 'Resource Library', stageNote: 'CAD blocks, templates, and standards library are built in Stage 07.' },
  { path: '/projects', title: 'Projects & Case Studies', stageNote: 'The project showcase is built in Stage 09.' },
  { path: '/work', title: 'Work With EVLab', stageNote: 'The consultancy intake page is built in Stage 09.' },
  { path: '/about', title: 'About EVLab', stageNote: 'The mission & vision page is built in Stage 09.' },
]

function AppShell() {
  const { path, navigate } = useRouter()

  if (path === '/') {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <HomePage />
        </main>
        <Footer />
      </div>
    )
  }

  if (isActivePath(path, '/career-roadmap')) {
    const roadmapFieldId = path
      .slice('/career-roadmap'.length)
      .split('/')
      .filter(Boolean)[0]
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <RoadmapPage
            initialFieldId={roadmapFieldId ?? null}
            onNavigateHome={() => navigate('/')}
            onNavigateToUele={(ueleId) => navigate(ueleId ? `/uele/${ueleId}` : '/uele')}
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (isActivePath(path, '/uele')) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <UELEPage
            onNavigateHome={() => navigate('/')}
            onNavigateToRoadmap={(fieldId) =>
              navigate(fieldId ? `/career-roadmap/${fieldId}` : '/career-roadmap')
            }
          />
        </main>
        <Footer />
      </div>
    )
  }

  // Standalone admin panel — no public Navbar/Footer chrome, has its own
  // login gate + shell (sidebar/header). Talks to the optional Express API
  // in server.ts (run via `npm run dev:admin`) for auth, the UELE
  // database, and GIS layer storage.
  if (isActivePath(path, '/admin')) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-sm">
            Loading EVLab Admin…
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    )
  }

  const STANDALONE_TOOL_ROUTES = [
    'wtp',
    'stp',
    'minicad',
    'waterflow',
    'gis',
    'boq',
    'sheet',
    'planner',
  ] as const

  const standaloneToolKey = STANDALONE_TOOL_ROUTES.find(
    (key) => path === `/software/${key}`
  )

  if (standaloneToolKey) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-sm">
            {TOOL_LOADING_LABEL[standaloneToolKey]}
          </div>
        }
      >
        {standaloneToolKey === 'wtp' ? (
          <WtpApp />
        ) : standaloneToolKey === 'stp' ? (
          <StpApp />
        ) : standaloneToolKey === 'minicad' ? (
          <MiniCadApp />
        ) : standaloneToolKey === 'waterflow' ? (
          <WaterFlowApp />
        ) : standaloneToolKey === 'gis' ? (
          <GisApp />
        ) : standaloneToolKey === 'boq' ? (
          <BoqApp />
        ) : standaloneToolKey === 'sheet' ? (
          <SheetApp />
        ) : (
          <PlannerApp />
        )}
      </Suspense>
    )
  }

  const LAB_ROUTES = [
    'mechanics',
    'fluid-mechanics',
    'strength-of-materials',
    'mathematics',
    'physics',
    'chemistry',
  ] as const
  const labKey = LAB_ROUTES.find((key) => path === `/learn/lab/${key}`)

  if (labKey) {
    return (
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-mono text-sm">
            {LAB_LOADING_LABEL[labKey]}
          </div>
        }
      >
        {labKey === 'mechanics' ? (
          <MechanicsLab />
        ) : labKey === 'fluid-mechanics' ? (
          <FluidMechanicsLab />
        ) : labKey === 'strength-of-materials' ? (
          <StrengthLab />
        ) : labKey === 'mathematics' ? (
          <MathematicsLab />
        ) : labKey === 'physics' ? (
          <PhysicsLab />
        ) : (
          <ChemistryLab />
        )}
      </Suspense>
    )
  }

  if (path === '/software/bim') {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="w-full h-96 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm">
                Loading EVLab BIM Viewer…
              </div>
            }
          >
            <BimViewerPage
              onNavigateHome={() => navigate('/ev-software')}
              onOpenTool={(route) => navigate(`/software/${route}`)}
            />
          </Suspense>
        </main>
        <Footer />
      </div>
    )
  }

  if (isActivePath(path, '/ev-software')) {
    const isWorkspace = path === '/ev-software/workspace'
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="w-full h-96 flex items-center justify-center text-[var(--text-muted)] font-mono text-sm">
                Loading EV Software…
              </div>
            }
          >
            {isWorkspace ? (
              <EVSoftwareWorkspacePage onOpenTool={(route) => navigate(`/software/${route}`)} />
            ) : (
              <EVSoftwareLandingPage onEnterWorkspace={() => navigate('/ev-software/workspace')} />
            )}
          </Suspense>
        </main>
        <Footer />
      </div>
    )
  }

  if (isActivePath(path, '/learn')) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <LearnPage
            onNavigateToRoadmap={(fieldId) =>
              navigate(fieldId ? `/career-roadmap/${fieldId}` : '/career-roadmap')
            }
          />
        </main>
        <Footer />
      </div>
    )
  }

  if (isActivePath(path, '/plugins')) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <Navbar />
        <main className="flex-1">
          <PluginsPage />
        </main>
        <Footer />
      </div>
    )
  }

  const match = ROUTE_META.find((r) => isActivePath(path, r.path)) ?? {
    title: '404 — Page Not Found',
    stageNote: 'This route does not exist yet.',
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar />
      <main className="flex-1">
        <PlaceholderPage title={match.title} stageNote={match.stageNote} />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <RouterProvider>
        <AppShell />
      </RouterProvider>
    </ThemeProvider>
  )
}

export default App
