import React, { useState } from 'react';
import { UELEObject, UELEHotspot, UELEComponent, UeleVideo } from '../../types/uele';
import {
  getKnowledgeItem,
  getSoftwareItem,
  getStandardItem,
  getCourseItem,
  getSkillItem,
  getResourceItem,
  getVideosForObject,
  getVideosForComponent,
  getVideoItem,
} from '../../utils/registryLookup';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import {
  X,
  Compass,
  Layers,
  BookOpen,
  Code2,
  FileCheck,
  Map as MapIcon,
  Focus,
  ChevronRight,
  Info,
  Sliders,
  Cpu,
  Workflow,
  HelpCircle,
  Lightbulb,
  Settings,
  ArrowLeft,
  ArrowRight,
  Wrench,
  FileText,
  Video,
  PlayCircle,
  GraduationCap,
  Clock,
} from 'lucide-react';

export interface ObjectInspectorProps {
  selectedObject: UELEObject | null;
  selectedComponentId: string | null;
  selectedHotspot: UELEHotspot | null;
  onClose: () => void;
  onSelectObject: (obj: UELEObject) => void;
  onSelectComponent: (obj: UELEObject, comp: UELEComponent) => void;
  onFocusCamera: (obj: UELEObject, compId?: string) => void;
  onNavigateToRoadmap?: (roadmapId: string) => void;
  onNavigateToObject?: (objectId: string) => void;
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  selectedObject,
  selectedComponentId,
  selectedHotspot,
  onClose,
  onSelectObject,
  onSelectComponent,
  onFocusCamera,
  onNavigateToRoadmap,
  onNavigateToObject,
}) => {
  const [activeTab, setActiveTab] = useState<
    'theory' | 'components' | 'learn' | 'parameters' | 'registry' | 'process'
  >('theory');

  if (!selectedObject) {
    return (
      <div className="bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-color)] rounded-2xl p-6 text-center text-[var(--text-secondary)] space-y-3 shadow-xl">
        <Compass className="w-8 h-8 mx-auto text-emerald-400 animate-pulse" />
        <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">
          GIS Facility & Engineering Component Inspector
        </h4>
        <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
          Select any facility, pipeline, or sub-component on the map to inspect its engineering design criteria, parameters, standards, software tools, and process workflows.
        </p>
      </div>
    );
  }

  // Find selected component if active
  const activeComponent = selectedComponentId
    ? selectedObject.components.find((c) => c.id === selectedComponentId)
    : null;

  // Active item details (either component or object)
  const activeTitle = activeComponent ? activeComponent.name : selectedObject.name;
  const activeDescription = activeComponent?.description || selectedObject.description;
  const activeWhat = activeComponent?.what || selectedObject.what;
  const activeWhy = activeComponent?.why || selectedObject.why;
  const activeHow = activeComponent?.how || selectedObject.how;
  const activePurpose = activeComponent?.engineeringPurpose || selectedObject.engineeringPurpose;
  const activeParameters = activeComponent?.parameters || selectedObject.parameters || [];
  const activeDisciplines = activeComponent?.disciplines || activeComponent?.discipline
    ? [activeComponent.discipline || 'Engineering']
    : selectedObject.disciplines;

  // Resolved Registries for Object / Component
  const knowledgeIds = activeComponent?.knowledgeIds || selectedObject.knowledgeIds || [];
  const skillIds = activeComponent?.skillIds || selectedObject.skillIds || [];
  const softwareIds = activeComponent?.softwareIds || selectedObject.softwareIds || [];
  const standardIds = activeComponent?.standardIds || selectedObject.standardIds || [];
  const courseIds = activeComponent?.courseIds || selectedObject.courseIds || [];
  const resourceIds = activeComponent?.resourceIds || selectedObject.resourceIds || [];

  const knowledgeItems = knowledgeIds.map((id) => getKnowledgeItem(id)).filter(Boolean);
  const skillItems = skillIds.map((id) => getSkillItem(id)).filter(Boolean);
  const softwareItems = softwareIds.map((id) => getSoftwareItem(id)).filter(Boolean);
  const standardItems = standardIds.map((id) => getStandardItem(id)).filter(Boolean);
  const courseItems = courseIds.map((id) => getCourseItem(id)).filter(Boolean);
  const resourceItems = resourceIds.map((id) => getResourceItem(id)).filter(Boolean);

  // Resolved Videos
  const rawVideos = activeComponent
    ? getVideosForComponent(activeComponent.id)
    : getVideosForObject(selectedObject.id);

  // Direct videoIds fallback
  const explicitVideoIds = activeComponent?.videoIds || selectedObject.videoIds || [];
  const explicitVideos = explicitVideoIds.map((vid) => getVideoItem(vid)).filter(Boolean) as UeleVideo[];

  // Merge & deduplicate videos cleanly
  const resolvedVideos: UeleVideo[] = (() => {
    const vMap = new Map<string, UeleVideo>();
    [...rawVideos, ...explicitVideos].forEach((v) => {
      if (v && v.id) vMap.set(v.id, v);
    });
    return Array.from(vMap.values());
  })();

  return (
    <Card variant="uele" padding="none" className="overflow-hidden shadow-2xl border border-emerald-500/40">
      {/* Header */}
      <div className="bg-slate-900/90 p-4 border-b border-[var(--border-color)] space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="emerald" size="sm" icon={<Layers className="w-3 h-3" />}>
                {selectedObject.environment.toUpperCase()}
              </Badge>
              {activeComponent && (
                <Badge variant="cyan" size="sm" icon={<Cpu className="w-3 h-3" />}>
                  SUB-COMPONENT ACTIVE
                </Badge>
              )}
            </div>

            {/* Breadcrumb if Component Selected */}
            {activeComponent ? (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
                <button
                  onClick={() => onSelectObject(selectedObject)}
                  className="hover:text-emerald-400 underline underline-offset-2"
                >
                  {selectedObject.name}
                </button>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="text-emerald-300 font-bold">{activeComponent.name}</span>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-white leading-tight">
                {selectedObject.name}
              </h3>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Component Header Title */}
        {activeComponent && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <h3 className="text-base font-bold text-emerald-300">{activeComponent.name}</h3>
            <button
              onClick={() => onSelectObject(selectedObject)}
              className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back to System Overview</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Hotspot Notification */}
      {selectedHotspot && (
        <div className="bg-amber-950/40 border-b border-amber-500/40 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-amber-300">Hotspot: {selectedHotspot.label}</span>
            {selectedHotspot.description && (
              <p className="text-[11px] text-amber-200/80">{selectedHotspot.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11px] font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('theory')}
          className={`py-2.5 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'theory'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Theory
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`py-2.5 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'components'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Sub-Components ({selectedObject.components.length})
        </button>
        <button
          onClick={() => setActiveTab('learn')}
          className={`py-2.5 px-3 font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'learn'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 shadow-inner'
              : 'border-transparent text-cyan-400/90 hover:text-cyan-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Learn & Practice</span>
          {resolvedVideos.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300">
              {resolvedVideos.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('parameters')}
          className={`py-2.5 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'parameters'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Design Parameters ({activeParameters.length})
        </button>
        <button
          onClick={() => setActiveTab('registry')}
          className={`py-2.5 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'registry'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Registry Matrix
        </button>
        <button
          onClick={() => setActiveTab('process')}
          className={`py-2.5 px-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'process'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          Process Chain
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 max-h-[420px] overflow-y-auto space-y-4 text-sm text-[var(--text-primary)]">
        {/* TAB 1: Engineering Theory */}
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {activeDescription}
            </p>

            {/* Structured What, Why, How, Purpose */}
            <div className="grid grid-cols-1 gap-3">
              {activeWhat && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>What is it?</span>
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{activeWhat}</p>
                </div>
              )}

              {activeWhy && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Why is it required?</span>
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{activeWhy}</p>
                </div>
              )}

              {activeHow && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                    <Settings className="w-3.5 h-3.5" />
                    <span>How does it work?</span>
                  </span>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{activeHow}</p>
                </div>
              )}

              {activePurpose && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-emerald-300 flex items-center gap-1.5 uppercase">
                    <Workflow className="w-3.5 h-3.5" />
                    <span>Engineering Purpose</span>
                  </span>
                  <p className="text-xs text-emerald-100 leading-relaxed font-mono">{activePurpose}</p>
                </div>
              )}
            </div>

            {/* Disciplines involved */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]/60">
              <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                Disciplines Involved
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeDisciplines.map((disc) => (
                  <Badge key={disc} variant="blue" size="sm">
                    {disc}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-2 flex flex-wrap gap-2">
              <Button
                variant="uele"
                size="sm"
                leftIcon={<Focus className="w-4 h-4" />}
                onClick={() => onFocusCamera(selectedObject, activeComponent?.id)}
              >
                Focus 3D Camera on {activeComponent ? activeComponent.name : 'System'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/60"
                leftIcon={<GraduationCap className="w-4 h-4" />}
                onClick={() => setActiveTab('learn')}
              >
                Learn This Component
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: Sub-Components */}
        {activeTab === 'components' && (
          <div className="space-y-3">
            <span className="text-xs font-mono text-[var(--text-muted)] block">
              Click any sub-component to highlight it in 3D and focus the camera:
            </span>

            {selectedObject.components.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic">
                No sub-components mapped for this system.
              </p>
            ) : (
              selectedObject.components.map((comp) => {
                const isSelected = selectedComponentId === comp.id;
                return (
                  <div
                    key={comp.id}
                    onClick={() => onSelectComponent(selectedObject, comp)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-200 space-y-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-lg'
                        : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-emerald-500/40 text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{comp.name}</span>
                      </div>
                      {comp.discipline && (
                        <Badge variant="cyan" size="sm">
                          {comp.discipline}
                        </Badge>
                      )}
                    </div>

                    {comp.description && (
                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {comp.description}
                      </p>
                    )}

                    {/* Render Child Components recursively if exist */}
                    {comp.childComponents && comp.childComponents.length > 0 && (
                      <div className="pt-2 pl-3 border-l-2 border-emerald-500/40 space-y-1.5">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                          Sub-Assemblies:
                        </span>
                        {comp.childComponents.map((child) => (
                          <div key={child.id} className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                            <span className="font-bold text-white">{child.name}</span>
                            {child.description && (
                              <p className="text-[10px] text-slate-300 mt-0.5">{child.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Learn & Practice Gateway (UELE-03 core) */}
        {activeTab === 'learn' && (
          <div className="space-y-5">
            {/* Banner Header */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Engineering Learning Gateway</span>
                </span>
                <Badge variant="cyan" size="sm">
                  {activeTitle}
                </Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect 3D spatial engineering models to practical theory, industrial software tools, professional training courses, technical handbooks, and career roadmaps.
              </p>
            </div>

            {/* SECTION 1: Practical Video Learning Modules */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Practical Video Modules ({resolvedVideos.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  3D Concept Walkthroughs
                </span>
              </div>

              {resolvedVideos.length === 0 ? (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] italic">
                  Video learning modules for this component are currently being prepared by EVLab Engineering Academy.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {resolvedVideos.map((video: UeleVideo) => (
                    <div
                      key={video.id}
                      className="p-3 rounded-xl bg-[var(--bg-surface)] border border-cyan-500/30 hover:border-cyan-400 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                            <h5 className="text-xs font-bold text-white leading-snug">
                              {video.title}
                            </h5>
                          </div>
                          {video.description && (
                            <p className="text-[11px] text-slate-300 line-clamp-2">
                              {video.description}
                            </p>
                          )}
                        </div>
                        {video.comingSoon && (
                          <Badge variant="amber" size="sm">
                            Coming Soon
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                          {video.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{video.duration}</span>
                            </span>
                          )}
                          {video.level && <span>Level: {video.level}</span>}
                        </div>
                        {video.provider && (
                          <span className="text-cyan-400 font-semibold">{video.provider}</span>
                        )}
                      </div>

                      {/* Render Tags */}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {video.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: Industry Software Tools & Learning Paths */}
            {softwareItems.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Software Used in Practice ({softwareItems.length})</span>
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {softwareItems.map((soft) => (
                    <div
                      key={soft?.id}
                      className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">{soft?.name}</span>
                        <Badge variant="emerald" size="sm">
                          {soft?.category || 'Software'}
                        </Badge>
                      </div>

                      {soft?.description && (
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {soft.description}
                        </p>
                      )}

                      {soft?.vendor && (
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                          Vendor: <span className="text-white">{soft.vendor}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Courses & Certification Programs */}
            {courseItems.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>Recommended Courses ({courseItems.length})</span>
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {courseItems.map((course) => (
                    <div
                      key={course?.id}
                      className="p-3 rounded-xl bg-[var(--bg-surface)] border border-amber-500/30 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300">{course?.name}</span>
                        {course?.provider && (
                          <Badge variant="amber" size="sm">
                            {course.provider}
                          </Badge>
                        )}
                      </div>

                      {course?.description && (
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {course.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                        {course?.duration && <span>Duration: {course.duration}</span>}
                        {course?.rating && (
                          <span className="text-amber-400 font-bold">★ {course.rating}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: Technical Manuals & Codes */}
            {(resourceItems.length > 0 || standardItems.length > 0) && (
              <div className="space-y-2.5">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>Technical Manuals & Design Codes</span>
                </span>

                <div className="grid grid-cols-1 gap-2">
                  {resourceItems.map((res) => (
                    <div
                      key={res?.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{res?.name}</span>
                        {res?.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {res.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="purple" size="sm">
                        {res?.category || 'Manual'}
                      </Badge>
                    </div>
                  ))}

                  {standardItems.map((std) => (
                    <div
                      key={std?.id}
                      className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white">{std?.name}</span>
                        {std?.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {std.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="blue" size="sm">
                        {std?.organization || 'Standard'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: Career Roadmap Link */}
            {selectedObject.roadmapIds.length > 0 && (
              <div className="pt-2 border-t border-[var(--border-color)]/60 space-y-2">
                <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase block">
                  Connect to Career Roadmap:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedObject.roadmapIds.map((rmId) => (
                    <Button
                      key={rmId}
                      variant="roadmap"
                      size="sm"
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigateToRoadmap?.(rmId)}
                    >
                      Launch Career Roadmap ({rmId})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Engineering Parameters Table */}
        {activeTab === 'parameters' && (
          <div className="space-y-3">
            {activeParameters.length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-1">
                <Sliders className="w-5 h-5 mx-auto text-[var(--text-muted)]" />
                <p className="text-xs font-mono text-[var(--text-muted)]">
                  Detailed design parameter data not yet available for this item.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-surface)]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-[var(--border-color)] text-emerald-400">
                    <tr>
                      <th className="p-2.5 font-bold">Parameter</th>
                      <th className="p-2.5 font-bold">Value</th>
                      <th className="p-2.5 font-bold">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60 text-[var(--text-primary)]">
                    {activeParameters.map((param, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-semibold">
                          {param.name}
                          {param.description && (
                            <span className="block text-[10px] text-[var(--text-muted)] font-sans">
                              {param.description}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-emerald-300 font-bold">{param.value}</td>
                        <td className="p-2.5 text-[var(--text-muted)]">{param.unit || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Registry Matrix */}
        {activeTab === 'registry' && (
          <div className="space-y-4">
            {/* Videos */}
            {resolvedVideos.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <Video className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Linked Video Learning Modules</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {resolvedVideos.map((vid: UeleVideo) => (
                    <div
                      key={vid.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{vid.title}</span>
                        {vid.duration && (
                          <span className="block text-[10px] text-cyan-400 font-mono">
                            Duration: {vid.duration} | {vid.category}
                          </span>
                        )}
                      </div>
                      <Badge variant="cyan" size="sm">
                        {vid.comingSoon ? 'Coming Soon' : 'Video'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge */}
            {knowledgeItems.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Linked Engineering Knowledge</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {knowledgeItems.map((item) => (
                    <div
                      key={item?.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{item?.name}</span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item?.description}
                        </p>
                      </div>
                      <Badge variant="outline" size="sm">
                        {item?.category || 'Theory'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skillItems.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Required Engineering Skills</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {skillItems.map((item) => (
                    <div
                      key={item?.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{item?.name}</span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item?.description}
                        </p>
                      </div>
                      <Badge variant="amber" size="sm">
                        {item?.category || 'Skill'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Software Tools */}
            {softwareItems.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Industry Software Tools</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {softwareItems.map((item) => (
                    <div
                      key={item?.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{item?.name}</span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item?.vendor ? `Vendor: ${item.vendor} | ` : ''}
                          {item?.description}
                        </p>
                      </div>
                      <Badge variant="emerald" size="sm">
                        {item?.category || 'CAD/BIM'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Design Standards */}
            {standardItems.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Design Standards & Codes</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {standardItems.map((item) => (
                    <div
                      key={item?.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{item?.name}</span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item?.description}
                        </p>
                      </div>
                      <Badge variant="purple" size="sm">
                        {item?.organization || 'Code'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Resources */}
            {resourceItems.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Technical Handbooks & Reference Manuals</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {resourceItems.map((item) => (
                    <div
                      key={item?.id}
                      className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{item?.name}</span>
                        <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">
                          {item?.description}
                        </p>
                      </div>
                      <Badge variant="cyan" size="sm">
                        {item?.fileFormat || 'PDF'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Roadmaps Link */}
            {selectedObject.roadmapIds.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]/60">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <MapIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Linked Career Roadmaps</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedObject.roadmapIds.map((rmId) => (
                    <Button
                      key={rmId}
                      variant="roadmap"
                      size="sm"
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      onClick={() => onNavigateToRoadmap?.(rmId)}
                    >
                      Open Career Roadmap ({rmId})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Process Chain & Related Objects */}
        {activeTab === 'process' && (
          <div className="space-y-4">
            {/* Upstream & Downstream Flow */}
            {selectedObject.process && (
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase block">
                  Hydraulic / Treatment Process Pipeline:
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {/* Upstream */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
                      <ArrowLeft className="w-3 h-3" />
                      <span>Upstream Process</span>
                    </span>
                    {selectedObject.process.upstream && selectedObject.process.upstream.length > 0 ? (
                      selectedObject.process.upstream.map((upId) => (
                        <button
                          key={upId}
                          onClick={() => onNavigateToObject?.(upId)}
                          className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 font-mono font-bold flex items-center justify-between border border-cyan-500/30"
                        >
                          <span className="line-clamp-1">{upId}</span>
                          <Focus className="w-3 h-3 text-cyan-400 shrink-0" />
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)] italic block">
                        Intake Headworks (Start of Process)
                      </span>
                    )}
                  </div>

                  {/* Downstream */}
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1.5">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1 justify-end">
                      <span>Downstream Process</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                    {selectedObject.process.downstream && selectedObject.process.downstream.length > 0 ? (
                      selectedObject.process.downstream.map((downId) => (
                        <button
                          key={downId}
                          onClick={() => onNavigateToObject?.(downId)}
                          className="w-full text-left p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 font-mono font-bold flex items-center justify-between border border-emerald-500/30"
                        >
                          <span className="line-clamp-1">{downId}</span>
                          <Focus className="w-3 h-3 text-emerald-400 shrink-0" />
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-[var(--text-muted)] italic block">
                        Distribution Network (End of Process)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Related Objects List */}
            {selectedObject.relatedObjectIds && selectedObject.relatedObjectIds.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]/60">
                <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase block">
                  Related 3D Engineering Facilities:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedObject.relatedObjectIds.map((relId) => (
                    <button
                      key={relId}
                      onClick={() => onNavigateToObject?.(relId)}
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Focus className="w-3 h-3 text-emerald-400" />
                      <span>{relId}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
