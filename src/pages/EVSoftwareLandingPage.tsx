import { ArrowUpRight, Boxes, Network, ShieldCheck, Orbit, Sparkles } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { CoreProvider, useCore } from '@/core/store/coreStore'

interface EVSoftwareLandingPageProps {
  onEnterWorkspace: () => void
  /** Optional — links back to the planetary Space Universe view (the
   * default view at /ev-software) when this page is reached on its own,
   * e.g. via a shared /ev-software/about link. */
  onViewUniverse?: () => void
}

/**
 * EV Software entry page — a feature inside the existing EVLab site, not a
 * separate product. Introduces the ecosystem framing (independent sibling
 * applications connected through EV Software Core) and links into the
 * workspace. No engineering computation happens here.
 *
 * Backed by EV Software Core: a shared application registry, project
 * context, dataset/revision model, validation + audit trail, and a
 * controlled transfer state machine between sibling applications
 * (EV GIS, EV Mini CAD, EV WTP, EV STP, EV BOQ, EV WaterFlow, EV Sheet,
 * EV BIM, EV Project Planner).
 */
function EVSoftwareLandingContent({ onEnterWorkspace, onViewUniverse }: EVSoftwareLandingPageProps) {
  const { applications } = useCore()
  const liveCount = applications.filter((a) => a.releaseStatus === 'ga').length

  return (
    <Container size="lg" className="py-16">
      <SectionHeader
        badge="EV Software"
        badgeVariant="blue"
        title="One connected engineering software ecosystem"
        description="EV Software is EVLab's engineering software layer — the same tools you already use (WTP, STP, GIS, Mini CAD, BOQ, WaterFlow, Sheet, BIM, Project Planner), gaining a shared workspace, project context, and controlled data exchange through EV Software Core."
        align="left"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card padding="lg">
          <Boxes className="h-6 w-6 text-[var(--accent-blue)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            {liveCount} registered sibling applications, each owning its own engineering domain.
          </p>
        </Card>
        <Card padding="lg">
          <Network className="h-6 w-6 text-[var(--accent-emerald)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            A shared project context, so work started in one tool can be found from another.
          </p>
        </Card>
        <Card padding="lg">
          <ShieldCheck className="h-6 w-6 text-[var(--accent-purple)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Explicit, auditable data exchange — no silent cross-application edits.
          </p>
        </Card>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <Button variant="primary" size="lg" rightIcon={<ArrowUpRight className="h-4 w-4" />} onClick={onEnterWorkspace}>
          Enter EV Software Workspace
        </Button>
        {onViewUniverse && (
          <Button variant="secondary" size="lg" rightIcon={<Sparkles className="h-4 w-4" />} onClick={onViewUniverse}>
            View Space Universe
          </Button>
        )}
        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Orbit className="h-3.5 w-3.5" /> Dashboard, Registry, Projects, Transfers, Datasets, Validation, Audit, Storage &amp; SDK Explorer
        </span>
      </div>
    </Container>
  )
}

export function EVSoftwareLandingPage(props: EVSoftwareLandingPageProps) {
  return (
    <CoreProvider>
      <EVSoftwareLandingContent {...props} />
    </CoreProvider>
  )
}
