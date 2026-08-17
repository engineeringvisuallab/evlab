import type React from 'react'
import { Droplets, Waves, PenTool, Box, Map, Calculator, Table2, GanttChartSquare, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { listApplications } from '@/core/registry/applicationRegistry'
import type { ApplicationDescriptor } from '@/core/types/application'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets,
  Waves,
  PenTool,
  Box,
  Map,
  Calculator,
  Table2,
  GanttChartSquare,
}

const STATUS_LABEL: Record<ApplicationDescriptor['integrationStatus'], string> = {
  NOT_CONNECTED: 'Not connected',
  ADAPTER_READY: 'Adapter ready',
  PARTIALLY_CONNECTED: 'Partially connected',
  CORE_CONNECTED: 'Core connected',
  FULLY_INTEGRATED: 'Fully integrated',
}

interface EVSoftwareWorkspacePageProps {
  onOpenTool: (route: string) => void
}

/**
 * EV Software Workspace — launches the EXISTING applications (unmodified)
 * via the Core application registry, which reads evlab-tools.json rather
 * than hard-coding a second, duplicate software list.
 */
export function EVSoftwareWorkspacePage({ onOpenTool }: EVSoftwareWorkspacePageProps) {
  const applications = listApplications()

  return (
    <Container size="lg" className="py-16">
      <SectionHeader
        badge="Workspace"
        badgeVariant="purple"
        title="Applications"
        description="Every EV Software application, launched here through the Core registry. Each opens as its existing, fully-functional implementation — nothing here is a rebuild."
        align="left"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => {
          const Icon = ICONS[app.icon] ?? Box
          return (
            <Card key={app.id} padding="lg" hoverable>
              <div className="flex items-start justify-between gap-3">
                <Icon className="h-6 w-6 text-[var(--accent-blue)]" />
                {app.hasAdapter && (
                  <Badge variant="default">{STATUS_LABEL[app.integrationStatus]}</Badge>
                )}
              </div>
              <h3 className="mt-3 font-semibold text-[var(--text-primary)]">{app.shortName}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{app.tagline}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowUpRight className="h-3.5 w-3.5" />}
                  onClick={() => onOpenTool(app.route)}
                  disabled={app.releaseStatus !== 'live'}
                >
                  {app.releaseStatus === 'live' ? 'Open' : 'Coming soon'}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </Container>
  )
}
