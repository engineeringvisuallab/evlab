import { HeroSection } from '@/components/home/HeroSection'
import { IntroductionSection } from '@/components/home/IntroductionSection'
import { EngineeringFieldGrid } from '@/components/home/EngineeringFieldGrid'
import { UELEPreview } from '@/components/home/UELEPreview'
import { EcosystemStats } from '@/components/home/EcosystemStats'
import { EcosystemFeatures } from '@/components/home/EcosystemFeatures'
import { EngineeringConnection } from '@/components/home/EngineeringConnection'
import { AudienceSection } from '@/components/home/AudienceSection'
import { PhilosophySection } from '@/components/home/PhilosophySection'
import { FinalCTA } from '@/components/home/FinalCTA'
import { useRouter } from '@/context/RouterContext'

/** Maps the home components' (sectionId, fieldId) callback shape onto our path-based router. */
const SECTION_PATHS: Record<string, string> = {
  overview: '/',
  home: '/',
  roadmap: '/career-roadmap',
  'career-roadmap': '/career-roadmap',
  uele: '/uele',
  learn: '/learn',
  resources: '/resources',
  plugins: '/plugins',
  projects: '/projects',
  software: '/software',
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
    <div className="flex w-full flex-col space-y-4">
      <HeroSection onNavigate={handleNavigate} />
      <EcosystemStats />
      <IntroductionSection />
      <EngineeringFieldGrid onNavigate={handleNavigate} />
      <UELEPreview onNavigate={handleNavigate} />
      <EcosystemFeatures onNavigate={handleNavigate} />
      <EngineeringConnection />
      <AudienceSection />
      <PhilosophySection />
      <FinalCTA onNavigate={handleNavigate} />
    </div>
  )
}
