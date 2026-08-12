import React, { useState, useMemo } from 'react'
import { UELEObject, UELEHotspot, UELEComponent } from '@/types/uele'
import ueleObjectsData from '@/data/uele-objects.json'
import { EnvironmentSelector, UELEZoneFilter } from '@/components/uele/EnvironmentSelector'
import { MasterEngineeringMap2D } from '@/components/uele/MasterEngineeringMap2D'
import { ObjectInspector } from '@/components/uele/ObjectInspector'
import { Container } from '@/components/shared/Container'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card } from '@/components/shared/Card'
import { useRouter } from '@/context/RouterContext'
import {
  ArrowLeft,
  Box,
  Search,
  Map,
  CheckCircle2,
  Workflow,
  ChevronRight,
  Globe,
} from 'lucide-react'

export const UELEPage: React.FC = () => {
  const { navigate } = useRouter()

  const [currentEnv, setCurrentEnv] = useState<UELEZoneFilter>('all')
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('raw-water-intake')
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [selectedHotspot, setSelectedHotspot] = useState<UELEHotspot | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const allObjects: UELEObject[] = ueleObjectsData as UELEObject[]

  const handleNavigateHome = () => navigate('/')
  const handleNavigateToRoadmap = (roadmapId?: string) =>
    navigate(roadmapId ? `/career-roadmap/${roadmapId}` : '/career-roadmap')

  // Environment Counts mapping
  const envCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allObjects.forEach((obj) => {
      counts[obj.environment] = (counts[obj.environment] || 0) + 1
    })
    return counts
  }, [allObjects])

  // Catalog Objects filtered by current zone filter & search query
  const catalogObjects = useMemo(() => {
    return allObjects.filter((obj) => {
      const matchEnv = currentEnv === 'all' || obj.environment === currentEnv
      const matchSearch =
        searchQuery === '' ||
        obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.disciplines.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())) ||
        obj.components.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchEnv && matchSearch
    })
  }, [allObjects, currentEnv, searchQuery])

  // Selected Object instance
  const selectedObject = useMemo(() => {
    if (!selectedObjectId) return null
    return allObjects.find((obj) => obj.id === selectedObjectId) || null
  }, [allObjects, selectedObjectId])

  // Handlers
  const handleSelectObject = (obj: UELEObject) => {
    setSelectedObjectId(obj.id)
    setSelectedComponentId(null)
    setSelectedHotspot(null)
  }

  const handleSelectComponent = (obj: UELEObject, comp: UELEComponent) => {
    setSelectedObjectId(obj.id)
    setSelectedComponentId(comp.id)
    setSelectedHotspot(null)
  }

  const handleSelectHotspot = (obj: UELEObject, hs: UELEHotspot) => {
    setSelectedObjectId(obj.id)
    setSelectedComponentId(hs.componentId || null)
    setSelectedHotspot(hs)
  }

  const handleNavigateToObject = (objectId: string) => {
    const target = allObjects.find((o) => o.id === objectId)
    if (target) {
      if (currentEnv !== 'all' && target.environment !== currentEnv) {
        setCurrentEnv(target.environment as UELEZoneFilter)
      }
      setSelectedObjectId(target.id)
      setSelectedComponentId(null)
      setSelectedHotspot(null)
    }
  }

  // Water World Process Pipeline steps
  const waterWorldProcessPipeline = [
    { id: 'raw-water-intake', label: '1. Raw Intake' },
    { id: 'raw-water-pumping-station', label: '2. Low-Lift Pumps' },
    { id: 'coagulation-flocculation-basin', label: '3. Flocculation' },
    { id: 'sedimentation-clarifier-tank', label: '4. Clarifier' },
    { id: 'rapid-sand-filter-unit', label: '5. Sand Filter' },
    { id: 'clear-well-disinfection-unit', label: '6. Clear Well' },
    { id: 'elevated-water-storage-tower', label: '7. Elevated Tower' },
    { id: 'distribution-pump-house', label: '8. Booster House' },
  ]

  return (
    <Container size="xl" className="py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={handleNavigateHome}
        >
          Back to Master Homepage
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="roadmap"
            size="sm"
            leftIcon={<Map className="w-4 h-4" />}
            onClick={() => handleNavigateToRoadmap()}
          >
            Switch to Career Roadmap
          </Button>
          <Badge variant="emerald" icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}>
            LIVE GIS & 3D MAP — SHERPUR, BOGURA ACTIVE
          </Badge>
        </div>
      </div>

      <SectionHeader
        badge="Stage 06 — Live GIS Satellite & 3D Engineering Map"
        badgeVariant="emerald"
        title="UELE — Ultimate Engineering Learning Ecosystem"
        description="Interactive GIS satellite and 3D map system centered on Sherpur, Bogura. Toggle seamlessly between 2D Satellite View, 3D Map View, and CAD Blueprints like Google Maps."
      />

      {/* Zone / Category Filter Bar */}
      <EnvironmentSelector
        currentEnv={currentEnv}
        onSelectEnv={(env) => {
          setCurrentEnv(env)
          setSelectedComponentId(null)
          setSelectedHotspot(null)
          if (env !== 'all') {
            const firstInEnv = allObjects.find((o) => o.environment === env)
            if (firstInEnv) {
              setSelectedObjectId(firstInEnv.id)
            }
          }
        }}
        envCounts={envCounts}
        totalObjectsCount={allObjects.length}
      />

      {/* Sequential Water Treatment Pipeline Shortcuts */}
      <div className="bg-[var(--bg-surface)] p-3 rounded-2xl border border-emerald-500/30 shadow-lg space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Water Treatment Process Pipeline (Sherpur WTP)</span>
          </span>
          <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
            Click a stage to inspect its engineering parameters & 3D model
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {waterWorldProcessPipeline.map((step, idx) => {
            const isSel = selectedObjectId === step.id
            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => handleNavigateToObject(step.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all duration-150 border flex items-center gap-1.5 cursor-pointer ${
                    isSel
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40 shadow-md'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-emerald-500/40 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{step.label}</span>
                </button>
                {idx < waterWorldProcessPipeline.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* UNIFIED GIS SATELLITE & 3D MAP VIEWER */}
      <MasterEngineeringMap2D
        objects={allObjects}
        selectedObject={selectedObject}
        selectedComponentId={selectedComponentId}
        selectedHotspot={selectedHotspot}
        onSelectObject={handleSelectObject}
        onSelectComponent={handleSelectComponent}
        onSelectHotspot={handleSelectHotspot}
        onNavigateToRoadmap={handleNavigateToRoadmap}
        currentEnv={currentEnv}
        onSelectEnv={(env) => setCurrentEnv(env as UELEZoneFilter)}
      />

      {/* LOWER SECTION: OBJECT INSPECTOR & FACILITIES CATALOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start pt-2">
        {/* Left Column (2 Cols): Selected Object Detailed Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <ObjectInspector
            selectedObject={selectedObject}
            selectedComponentId={selectedComponentId}
            selectedHotspot={selectedHotspot}
            onClose={() => {
              setSelectedObjectId(null)
              setSelectedComponentId(null)
              setSelectedHotspot(null)
            }}
            onSelectObject={handleSelectObject}
            onSelectComponent={handleSelectComponent}
            onFocusCamera={(obj, compId) => {
              setSelectedObjectId(obj.id)
              setSelectedComponentId(compId || null)
            }}
            onNavigateToRoadmap={(rmId) => {
              handleNavigateToRoadmap(rmId)
            }}
            onNavigateToObject={handleNavigateToObject}
          />
        </div>

        {/* Right Column (1 Col): Search & Facilities Catalog */}
        <div className="lg:col-span-1 space-y-4">
          <Card padding="md" className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[var(--text-secondary)] flex items-center gap-1.5">
                <Box className="w-4 h-4 text-emerald-400" />
                <span>Facilities Catalog ({catalogObjects.length})</span>
              </h4>
              {currentEnv !== 'all' && (
                <button
                  onClick={() => setCurrentEnv('all')}
                  className="text-[10px] text-emerald-400 hover:underline lowercase font-mono cursor-pointer"
                >
                  show all zones
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facility name or process..."
                className="w-full bg-[var(--bg-elevated)] text-xs text-[var(--text-primary)] pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-color)] focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* List of Catalog Objects */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {catalogObjects.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic p-2">
                  No engineering facilities match your search criteria.
                </p>
              ) : (
                catalogObjects.map((obj) => {
                  const isSel = selectedObjectId === obj.id
                  return (
                    <div
                      key={obj.id}
                      onClick={() => handleSelectObject(obj)}
                      className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all duration-150 flex items-center justify-between ${
                        isSel
                          ? 'bg-emerald-950/40 border-emerald-500 text-white font-semibold shadow-md'
                          : 'bg-[var(--bg-elevated)]/60 border-[var(--border-color)] hover:border-emerald-500/30 text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-bold leading-tight">{obj.name}</div>
                        <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 font-mono">
                          <span>{obj.components.length} components</span>
                          <span>•</span>
                          <span className="text-emerald-400">{obj.environment}</span>
                        </div>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </Container>
  )
}
