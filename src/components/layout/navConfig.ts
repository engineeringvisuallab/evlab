export interface NavSection {
  section: string
  label: string
  path: string
}

/** Single source of truth for top-level ecosystem navigation, in reference-design order. */
export const NAV_SECTIONS: NavSection[] = [
  { section: 'home', label: 'Home', path: '/' },
  { section: 'career-roadmap', label: 'Career Roadmap', path: '/career-roadmap' },
  { section: 'evcity', label: 'EVCity', path: '/evcity' },
  { section: 'learn', label: 'Learn & Courses', path: '/learn' },
  { section: 'resources', label: 'Resources', path: '/resources' },
  { section: 'plugins', label: 'Plugins', path: '/plugins' },
  { section: 'engineers', label: 'The Engineers', path: '/engineers' },
  { section: 'projects', label: 'Projects', path: '/projects' },
  { section: 'ev-software', label: 'EV Software', path: '/ev-software' },
  { section: 'work', label: 'Work', path: '/work' },
  { section: 'about', label: 'About', path: '/about' },
]
