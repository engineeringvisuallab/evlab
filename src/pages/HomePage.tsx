import { HeroSection } from '@/components/home/HeroSection'
import { SixModuleCards } from '@/components/home/SixModuleCards'
import { BottomDisciplinesNewsletter } from '@/components/home/BottomDisciplinesNewsletter'
import { FloatingRightDock } from '@/components/layout/FloatingRightDock'
import { useRouter } from '@/context/RouterContext'

/** Maps the home components' (sectionId, fieldId/param) callback shape onto our path-based router. */
const SECTION_PATHS: Record<string, string> = {
  overview: '/',
  home: '/',
  roadmap: '/career-roadmap',
  'career-roadmap': '/career-roadmap',
  uele: '/uele',
  'uele-game': '/uele/play',
  learn: '/learn',
  resources: '/resources',
  plugins: '/plugins',
  projects: '/projects',
  'ev-software': '/ev-software',
  consultancy: '/work',
  work: '/work',
  about: '/about',
}

export function HomePage() {
  const { navigate } = useRouter()

  const handleNavigate = (sectionId: string, fieldId?: string) => {
    const base = SECTION_PATHS[sectionId] ?? `/${sectionId}`
    navigate(fieldId ? `${base}/${fieldId}` : base)
  }

  return (
    <div className="flex w-full flex-col bg-[#070B14] relative">
      <HeroSection onNavigate={handleNavigate} />
      <SixModuleCards onNavigate={handleNavigate} />
      <BottomDisciplinesNewsletter onNavigate={handleNavigate} />
      <FloatingRightDock onNavigate={handleNavigate} />
    </div>
  )
}
