import { Box, MapPin } from 'lucide-react'
import type { UeleEnvironment, UeleObject } from '@/types/uele'

interface UELEViewerProps {
  environment: UeleEnvironment
  objects: UeleObject[]
  onInspect: (objectId: string) => void
}

// Deterministic-but-varied hotspot positions until real 3D coordinates exist.
const HOTSPOT_POSITIONS = [
  { top: '22%', left: '20%' },
  { top: '55%', left: '65%' },
  { top: '35%', left: '78%' },
  { top: '70%', left: '30%' },
  { top: '15%', left: '55%' },
]

export function UELEViewer({ environment, objects, onInspect }: UELEViewerProps) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-primary)] to-[var(--bg-elevated)] shadow-lg">
      {/* technical grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-emerald-bg)] via-transparent to-[var(--accent-blue-bg)]" />

      {/* center placeholder icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)]/60 text-[var(--text-muted)] backdrop-blur-sm">
          <Box size={32} />
        </span>
      </div>

      {/* hotspots */}
      {objects.map((obj, i) => {
        const pos = HOTSPOT_POSITIONS[i % HOTSPOT_POSITIONS.length]
        return (
          <button
            key={obj.id}
            type="button"
            onClick={() => onInspect(obj.id)}
            style={{ top: pos.top, left: pos.left }}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)]/90 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-md backdrop-blur-sm transition-transform group-hover:scale-105 group-hover:border-[var(--accent-emerald)]">
              <MapPin size={13} className="text-[var(--accent-emerald)]" />
              {obj.name}
              {obj.comingSoon && (
                <span className="text-[10px] text-[var(--text-muted)]">(soon)</span>
              )}
            </span>
          </button>
        )
      })}

      {objects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]/80 px-4 py-2 text-sm text-[var(--text-muted)] backdrop-blur-sm">
            {environment.name} objects are coming soon.
          </p>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)]/80 px-2.5 py-1 text-[11px] font-mono text-[var(--text-muted)] backdrop-blur-sm">
        {environment.name} · {objects.length} hotspot{objects.length === 1 ? '' : 's'}
      </div>
    </div>
  )
}
