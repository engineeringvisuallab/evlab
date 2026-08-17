import { ArrowUpRight, Boxes, Network, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { listApplications } from '@/core/registry/applicationRegistry'

interface EVSoftwareLandingPageProps {
  onEnterWorkspace: () => void
}

/**
 * EV Software entry page — a feature inside the existing EVLab site, not a
 * separate product. Introduces the ecosystem framing (independent sibling
 * applications connected through EV Software Core) and links into the
 * workspace. No engineering computation happens here.
 */
export function EVSoftwareLandingPage({ onEnterWorkspace }: EVSoftwareLandingPageProps) {
  const applications = listApplications()
  const liveCount = applications.filter((a) => a.releaseStatus === 'live').length

  return (
    <Container size="lg" className="py-16">
      <SectionHeader
        badge="EV Software"
        badgeVariant="blue"
        title="One connected engineering software ecosystem"
        description="EV Software is EVLab's engineering software layer — the same tools you already use (WTP, GIS, Mini CAD, BOQ, and more), gaining a shared workspace, project context, and controlled data exchange through EV Software Core."
        align="left"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card padding="lg">
          <Boxes className="h-6 w-6 text-[var(--accent-blue)]" />
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            {liveCount} independent applications, each owning its own engineering domain.
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

      <div className="mt-10">
        <Button variant="primary" size="lg" rightIcon={<ArrowUpRight className="h-4 w-4" />} onClick={onEnterWorkspace}>
          Enter EV Software Workspace
        </Button>
      </div>
    </Container>
  )
}
