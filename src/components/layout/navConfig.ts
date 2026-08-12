import type { EcosystemSection } from '@/types/ecosystem'

export interface NavSection {
  section: EcosystemSection
  label: string
  path: string
}

/** Single source of truth for top-level ecosystem navigation, in reference-design order. */
export const NAV_SECTIONS: NavSection[] = [
  { section: 'home', label: 'Home', path: '/' },
  { section: 'career-roadmap', label: 'Career Roadmap', path: '/career-roadmap' },
  { section: 'uele', label: 'UELE', path: '/uele' },
  { section: 'learn', label: 'Learn', path: '/learn' },
  { section: 'resources', label: 'Resources', path: '/resources' },
  { section: 'plugins', label: 'Plugins', path: '/plugins' },
  { section: 'projects', label: 'Projects', path: '/projects' },
  { section: 'software', label: 'Software', path: '/software' },
  { section: 'work', label: 'Work', path: '/work' },
  { section: 'about', label: 'About', path: '/about' },
]
