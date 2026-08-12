import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  stageNote: string
}

/**
 * Temporary placeholder so every nav link resolves to something real
 * instead of a dead link, without pre-building any page's actual
 * design or functionality ahead of its assigned stage.
 */
export function PlaceholderPage({ title, stageNote }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-color)] text-[var(--text-muted)]">
        <Construction size={24} />
      </span>
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{stageNote}</p>
    </div>
  )
}
