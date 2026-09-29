import { useEffect, useState } from 'react'
import { Boxes, Menu, Search, X } from 'lucide-react'
import { Link } from '@/components/shared/Link'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { NAV_SECTIONS } from '@/components/layout/navConfig'
import { useRouter } from '@/context/RouterContext'
import { isActivePath } from '@/utils/router'

export function Navbar() {
  const { path } = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
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

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_SECTIONS.map((item) => {
            const active = isActivePath(path, item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'text-[var(--accent-blue)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-brand-blue to-cyan-glow" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-subtle)] sm:flex"
          >
            <Search size={15} />
            <span className="hidden md:inline">Search anything…</span>
            <kbd className="hidden rounded border border-[var(--border-color)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] md:inline">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] sm:hidden"
          >
            <Search size={16} />
          </button>

          <ThemeToggle />

          <Link
            to="/work"
            className="hidden items-center rounded-xl bg-gradient-to-r from-brand-blue to-roadmap-purple px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90 sm:flex"
          >
            Get Started
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_SECTIONS.map((item) => {
              const active = isActivePath(path, item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active
                      ? 'bg-[var(--bg-elevated)] text-[var(--accent-blue)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              to="/work"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-blue to-roadmap-purple px-5 py-2.5 text-sm font-semibold text-white"
            >
              Get Started
            </Link>
          </div>
        </nav>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  )
}
