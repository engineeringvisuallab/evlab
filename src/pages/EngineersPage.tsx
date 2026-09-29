import { Building2, MapPin, UserRound, ArrowRight, Sparkles } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { Link } from '@/components/shared/Link'
import { ENGINEERS } from '@/data/engineers'

export function EngineersPage() {
  return (
    <Container size="xl" className="py-12 space-y-10">
      <SectionHeader
        badge="The Engineers"
        badgeVariant="emerald"
        title="The Engineers"
        description="Meet the engineers behind EVLab's projects and tools — their real-world CAD, GIS, and modelling work, in one directory."
        align="left"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ENGINEERS.map((engineer) => {
          const CardInner = (
            <Card
              padding="lg"
              hoverable={Boolean(engineer.profilePath)}
              className="h-full flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-elevated)]">
                  {engineer.avatar ? (
                    <img
                      src={engineer.avatar}
                      alt={engineer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserRound className="w-7 h-7 text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                    {engineer.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                    {engineer.title}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-[var(--text-muted)]">
                {engineer.employer && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    {engineer.employer}
                  </span>
                )}
                {engineer.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {engineer.location}
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {engineer.summary}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {engineer.skills.map((skill) => (
                  <Badge key={skill} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t border-[var(--border-color)]">
                {engineer.profilePath ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-emerald)]">
                    View Profile
                    <ArrowRight className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4" />
                    Profile coming soon
                  </span>
                )}
              </div>
            </Card>
          )

          return engineer.profilePath ? (
            <Link key={engineer.slug} to={engineer.profilePath} className="block h-full">
              {CardInner}
            </Link>
          ) : (
            <div key={engineer.slug} className="h-full opacity-90">
              {CardInner}
            </div>
          )
        })}
      </div>
    </Container>
  )
}
