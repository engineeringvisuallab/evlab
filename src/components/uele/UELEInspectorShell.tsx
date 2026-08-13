import React, { useState } from 'react';
import {
  Info,
  Layers,
  Sliders,
  Code,
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Map,
  Box,
  CheckCircle2,
  Table,
  MapPin,
} from 'lucide-react';
import { UELEFacility, UELESystemCategoryMeta } from '../../types/adminUele';
import { GISFeature } from '../../data/sherpur-gis-data';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

export interface UELEInspectorShellProps {
  selectedFeature?: GISFeature | null;
  selectedFacility?: UELEFacility | null;
  selectedCategory?: UELESystemCategoryMeta | null;
  onNavigateToRoadmap?: (roadmapFieldId?: string) => void;
  onClose?: () => void;
}

type InspectorTab =
  | 'overview'
  | 'attributes'
  | 'engineering-info'
  | 'components'
  | 'parameters'
  | 'software'
  | 'standards'
  | 'courses'
  | 'videos'
  | 'resources'
  | 'career-roadmap';

export const UELEInspectorShell: React.FC<UELEInspectorShellProps> = ({
  selectedFeature,
  selectedFacility,
  selectedCategory,
  onNavigateToRoadmap,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('overview');

  const tabs: { id: InspectorTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'attributes', label: 'Attribute Table', icon: Table },
    { id: 'engineering-info', label: 'Engineering Info', icon: Layers },
    { id: 'components', label: 'Components', icon: Box },
    { id: 'parameters', label: 'Parameters', icon: Sliders },
    { id: 'software', label: 'Software', icon: Code },
    { id: 'standards', label: 'Standards', icon: BookOpen },
    { id: 'courses', label: 'Courses', icon: GraduationCap },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'career-roadmap', label: 'Career Roadmap', icon: Map },
  ];

  // Derive feature properties
  const featureProps = selectedFeature?.properties;
  const title = featureProps?.name || selectedFacility?.name || null;
  const category = featureProps?.category || selectedFacility?.category || selectedCategory?.id || 'GIS';
  const description = featureProps?.description || selectedFacility?.description || '';
  const attributes = featureProps?.attributes || {};
  const lat = featureProps?.lat || selectedFacility?.coordinates?.lat;
  const lng = featureProps?.lng || selectedFacility?.coordinates?.lng;
  const elevation = featureProps?.elevation || selectedFacility?.coordinates?.elevation || 0;
  const source = featureProps?.source || 'system';
  const engineeringInfo = featureProps?.engineeringInfo || selectedFacility?.engineeringInfo;
  const parameters = featureProps?.parameters || selectedFacility?.parameters || [];

  if (!title) {
    return (
      <Card padding="md" className="space-y-4 bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-[var(--text-primary)] uppercase">
                ENGINEERING INSPECTOR
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                Spatial Feature & Attribute Inspector
              </p>
            </div>
          </div>
          {selectedCategory && (
            <Badge variant="emerald" size="sm">
              Focus: {selectedCategory.title}
            </Badge>
          )}
        </div>

        {/* Empty State Banner */}
        <div className="p-6 rounded-2xl bg-[var(--bg-elevated)]/50 border border-dashed border-[var(--border-color)] text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-[var(--text-primary)]">
              {selectedCategory ? `${selectedCategory.title} Focused` : 'No GIS Feature Selected'}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
              Click any river, road, WTP, facility, boundary or imported Shapefile feature on the 2D/3D map to view its attributes, geometry & engineering specs.
            </p>
          </div>

          {selectedCategory && (
            <div className="pt-2 text-[10px] text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GIS Layer Data Active</span>
            </div>
          )}
        </div>

        {/* Category Systems List */}
        {selectedCategory?.systems && selectedCategory.systems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
              {selectedCategory.title} Subsystems
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedCategory.systems.map((sys) => (
                <span
                  key={sys}
                  className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)]"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card padding="md" className="space-y-4 bg-[var(--bg-surface)] border border-cyan-500/40 shadow-xl font-mono">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--border-color)] pb-3">
        <div className="space-y-1 min-w-0 pr-2">
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <Badge variant="cyan">{category}</Badge>
            {source && (
              <Badge variant="muted" size="sm">
                SRC: {source}
              </Badge>
            )}
          </div>
          <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-tight truncate">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-color)]">
        {tabs.map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[220px] text-xs text-[var(--text-secondary)] space-y-3">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-3">
            <p className="text-[var(--text-primary)] leading-relaxed text-xs">
              {engineeringInfo?.overview || description || 'GIS spatial feature representation.'}
            </p>
            {lat && lng && (
              <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] space-y-1.5 text-xs">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Real Spatial Alignment (WGS84 EPSG:4326):</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Latitude: {lat.toFixed(6)}° N | Longitude: {lng.toFixed(6)}° E
                </div>
                <div className="text-[11px] text-slate-400">Elevation: {elevation} m AMSL</div>
              </div>
            )}
          </div>
        )}

        {/* ATTRIBUTE TABLE TAB */}
        {activeTab === 'attributes' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
              <span>DBF / GeoJSON Attributes</span>
              <span className="text-cyan-400">{Object.keys(attributes).length} fields</span>
            </div>
            {Object.keys(attributes).length === 0 ? (
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-center text-slate-400 text-xs">
                No custom attribute fields found in source data.
              </div>
            ) : (
              <div className="max-h-[240px] overflow-y-auto rounded-xl border border-[var(--border-color)] bg-slate-950 divide-y divide-slate-800">
                {Object.entries(attributes).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 text-[11px] font-mono">
                    <span className="text-cyan-300 font-bold uppercase truncate max-w-[45%]">
                      {key}
                    </span>
                    <span className="text-slate-200 truncate max-w-[50%] text-right font-medium">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ENGINEERING INFO TAB */}
        {activeTab === 'engineering-info' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-bold text-[var(--text-primary)]">Engineering Purpose</h4>
              <p className="text-xs text-slate-300">
                {engineeringInfo?.purpose || 'Multi-disciplinary infrastructure application.'}
              </p>
            </div>
            {engineeringInfo?.designStandards && (
              <div className="space-y-1">
                <h4 className="font-bold text-[var(--text-primary)]">Design Standards</h4>
                <div className="flex flex-wrap gap-1">
                  {engineeringInfo.designStandards.map((std) => (
                    <Badge key={std} variant="muted" size="sm">
                      {std}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PARAMETERS TAB */}
        {activeTab === 'parameters' && (
          <div className="space-y-2">
            {parameters.length > 0 ? (
              parameters.map((param) => (
                <div key={param.id} className="flex justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs">
                  <span className="text-slate-300">{param.name}</span>
                  <span className="font-bold text-cyan-400">
                    {param.value} {param.unit || ''}
                  </span>
                </div>
              ))
            ) : (
              <p className="italic text-[var(--text-muted)] text-xs">
                No quantitative parameters assigned.
              </p>
            )}
          </div>
        )}

        {/* CAREER ROADMAP TAB */}
        {activeTab === 'career-roadmap' && (
          <div className="space-y-3 text-xs">
            <p>Connect this spatial engineering feature directly to career engineering disciplines:</p>
            <Button
              variant="roadmap"
              size="sm"
              leftIcon={<Map className="w-4 h-4" />}
              onClick={() => onNavigateToRoadmap?.()}
            >
              Open Career Roadmap
            </Button>
          </div>
        )}

        {/* OTHER TABS */}
        {['components', 'software', 'standards', 'courses', 'videos', 'resources'].includes(activeTab) && (
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/50 border border-dashed border-[var(--border-color)] text-center italic text-[var(--text-muted)] text-xs">
            No linked {activeTab} records attached to this GIS feature yet.
          </div>
        )}
      </div>
    </Card>
  );
};
