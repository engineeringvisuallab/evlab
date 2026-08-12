import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Compass, Box } from 'lucide-react'
import { useRouter } from '@/context/RouterContext'
import roadmapTree from '@/data/roadmap-tree.json'
import type { RoadmapTree } from '@/types/roadmap'
import { flattenRoadmapTree, findRoadmapPath } from '@/utils/registryLookup'
import { NAV_SECTIONS } from '@/components/layout/navConfig'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

/**
 * A working Cmd/Ctrl+K palette that searches the top-level ecosystem
 * sections and the full Career Roadmap tree (180 nodes across 26
 * fields as of the AI Studio data merge).
 *
 * Full cross-registry search (software, courses, plugins, standards,
 * etc.) with a complete zero-dead-ends audit is still Stage 10 scope.
 */
export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate } = useRouter()

  useEffect(() => {
    if (open) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const roadmapMatches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return flattenRoadmapTree(roadmapTree as RoadmapTree)
      .filter((node) => node.title.toLowerCase().includes(q))
      .slice(0, 6)
  }, [query])

  const sectionMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return NAV_SECTIONS.filter((s) => !q || s.label.toLowerCase().includes(q))
  }, [query])

  if (!open) return null

  const goToNode = (nodeId: string) => {
    const path = findRoadmapPath(roadmapTree as RoadmapTree, nodeId)
    const slug = path.map((n) => n.id).join('/')
    navigate(`/career-roadmap/${slug}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border-color)] px-4 py-3">
          <Search size={18} className="shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything… (fields, specializations, sections)"
            className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {roadmapMatches.length > 0 && (
            <div className="mb-2">
              <p className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                Career Roadmap
              </p>
              {roadmapMatches.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => goToNode(node.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                >
                  <Compass size={15} className="shrink-0 text-roadmap-purple" />
                  {node.title}
                </button>
              ))}
            </div>
          )}

          <div>
            <p className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              Sections
            </p>
            {sectionMatches.map((section) => (
              <button
                key={section.path}
                type="button"
                onClick={() => {
                  navigate(section.path)
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              >
                <Box size={15} className="shrink-0 text-brand-blue" />
                {section.label}
              </button>
            ))}
            {sectionMatches.length === 0 && roadmapMatches.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">
                No matches yet. Full ecosystem-wide search lands in a later stage.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
