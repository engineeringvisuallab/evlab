import { Boxes, Globe, Link2, Mail, Rss } from 'lucide-react'
import { Link } from '@/components/shared/Link'

const FOOTER_COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Career Roadmap', to: '/career-roadmap' },
      { label: 'UELE Ecosystem', to: '/uele' },
      { label: 'Learn & Courses', to: '/learn' },
      { label: 'EV Software', to: '/ev-software' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Resource Library', to: '/resources' },
      { label: 'Plugin Hub', to: '/plugins' },
      { label: 'Projects & Case Studies', to: '/projects' },
      { label: 'Consultancy', to: '/work' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About EVLab', to: '/about' },
      { label: 'Contact / Work With Us', to: '/work' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-blue to-roadmap-purple text-white">
                <Boxes size={18} />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-[17px] font-bold text-[var(--text-primary)]">
                  EVLab
                </span>
                <span className="block text-[10px] font-medium tracking-wide text-[var(--text-muted)]">
                  Engineering Visual Lab
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-[var(--text-secondary)]">
              A digital engineering ecosystem connecting career guidance, knowledge, software,
              learning, resources, and real-world engineering exploration.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Globe, Rss, Link2, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-blue)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[var(--border-color)] pt-6 text-xs text-[var(--text-muted)] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} EVLab — Engineering Visual Lab. All rights reserved.</p>
          <p>Your Future. Our Mission. Engineering For The World.</p>
          <Link to="/admin" className="text-[var(--text-muted)] transition-colors hover:text-[var(--accent-blue)]">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
