/**
 * EVLab — Minimal client-side router.
 *
 * Per the Master Plan's architecture strategy ("dynamic hash/path
 * routing"), EVLab uses the native History API rather than pulling in
 * a routing library. This keeps the dependency footprint the same as
 * the audited baseline (Stage 01 Rule: do not add React Router unless
 * absolutely required).
 *
 * BASE-PATH AWARENESS: when deployed to a sub-path (e.g. GitHub Pages
 * project sites at username.github.io/repo-name/), Vite's `base`
 * config controls the real URL prefix. The rest of the app always
 * works with clean, app-relative absolute paths like "/uele" or
 * "/career-roadmap/civil-engineering" — this module transparently
 * adds/strips the deployment base so app code never has to know about it.
 *
 * This module only provides navigation primitives. Route -> component
 * matching for each section is introduced stage by stage as those
 * pages are actually built.
 */

export type RouteChangeListener = (path: string) => void

const listeners = new Set<RouteChangeListener>()

// import.meta.env.BASE_URL is injected by Vite from the `base` config,
// always with a leading and trailing slash (e.g. "/" or "/evlab/").
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') // strip trailing slash, "" for root

/** Converts a real browser pathname into a clean app-relative path (strips the deployment base). */
function stripBase(pathname: string): string {
  if (BASE && pathname.startsWith(BASE)) {
    const rest = pathname.slice(BASE.length)
    return rest === '' ? '/' : rest.startsWith('/') ? rest : `/${rest}`
  }
  return pathname || '/'
}

/** Converts a clean app-relative path into the real browser pathname (adds the deployment base). */
export function toRealPath(appPath: string): string {
  if (!BASE) return appPath
  if (appPath === '/') return `${BASE}/`
  return `${BASE}${appPath}`
}

export function getCurrentPath(): string {
  if (typeof window === 'undefined') return '/'
  return stripBase(window.location.pathname)
}

export function navigate(path: string): void {
  if (typeof window === 'undefined') return
  if (path === getCurrentPath()) return
  window.history.pushState({}, '', toRealPath(path))
  listeners.forEach((listener) => listener(path))
}

export function subscribeToRouteChanges(listener: RouteChangeListener): () => void {
  listeners.add(listener)
  const onPopState = () => listener(getCurrentPath())
  window.addEventListener('popstate', onPopState)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('popstate', onPopState)
  }
}

/** Returns true if `path` is the current route, or a parent of it (for active-nav-item highlighting). */
export function isActivePath(current: string, target: string): boolean {
  if (target === '/') return current === '/'
  return current === target || current.startsWith(`${target}/`)
}
