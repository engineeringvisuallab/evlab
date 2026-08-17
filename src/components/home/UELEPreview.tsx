import React from 'react';
import {
  Building2,
  Home,
  Wheat,
  Droplets,
  Zap,
  Truck,
  Layers,
  Factory,
  Trees,
  Globe,
  Box,
  FolderGit2,
  ArrowRight,
  Map,
  Compass,
  Sparkles,
} from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';
import { UELE_SYSTEM_CATEGORIES } from '../../data/uele-categories';
import { UELESystemCategory } from '../../types/uele';

export interface UELEPreviewProps {
  onNavigate: (sectionId: string, paramOrFieldId?: string) => void;
}

// Icon mapping helper
const categoryIcons: Record<string, React.ElementType> = {
  Building2,
  Home,
  Wheat,
  Droplets,
  Zap,
  Truck,
  Layers,
  Factory,
  Trees,
  Globe,
  Box,
  FolderGit2,
};

export const UELEPreview: React.FC<UELEPreviewProps> = ({ onNavigate }) => {
  const handleCardClick = (catId: UELESystemCategory) => {
    onNavigate('uele', `focus=${catId}`);
  };

  return (
    <section id="uele-section" className="py-12 lg:py-16 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* SECTION HEADER & PRIMARY ACTION BUTTONS */}
        <SectionHeader
          badge="UELE Entry Portal"
          badgeVariant="emerald"
          title="Ultimate Engineering Learning Ecosystem"
          description="Explore a connected engineering world through maps, 3D models, engineering data and learning resources."
          action={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Map className="w-4 h-4 text-cyan-400" />}
                onClick={() => onNavigate('uele', 'mode=2d')}
              >
                VIEW 2D MAP
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Compass className="w-4 h-4 text-emerald-400" />}
                onClick={() => onNavigate('uele', 'mode=3d')}
              >
                VIEW 3D WORLD
              </Button>
              <Button
                variant="uele"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => onNavigate('uele')}
              >
                EXPLORE UELE
              </Button>
            </div>
          }
        />

        {/* FEATURE CARDS CONTAINER / MINI VIEWER PORTAL */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/30 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Engineering Backdrop Grid */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Banner Header inside Portal Box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="emerald" icon={<Globe className="w-3.5 h-3.5 text-emerald-400" />}>
                  Connected Engineering Country
                </Badge>
                <span className="text-xs font-mono text-[var(--text-muted)]">12 Major Systems Available</span>
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                ULTIMATE ENGINEERING WORLD
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
                Select an engineering domain below to launch directly into the main UELE map and explore its 2D GIS and 3D digital engineering layers.
              </p>
            </div>

            <Button
              variant="uele"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('uele')}
            >
              LAUNCH FULL MAP
            </Button>
          </div>

          {/* 12 VISUALLY ATTRACTIVE FEATURE CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {UELE_SYSTEM_CATEGORIES.map((cat) => {
              const IconComponent = (categoryIcons[cat.iconName] || Globe) as React.ComponentType<{ className?: string }>;

              return (
                <Card
                  key={cat.id}
                  variant="uele"
                  hoverable
                  padding="md"
                  className="space-y-3 cursor-pointer group transition-all duration-200 hover:-translate-y-1 hover:border-emerald-500/60 bg-[var(--bg-elevated)]/40 relative overflow-hidden"
                  onClick={() => handleCardClick(cat.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {cat.badge && (
                      <Badge variant="emerald" size="sm">
                        {cat.badge}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors font-mono flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 -translate-x-2 group-hover:translate-x-0 transition-transform" />
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1.5 line-clamp-2">
                      {cat.shortDescription}
                    </p>
                  </div>

                  {cat.systems && cat.systems.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-color)]/60 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-[var(--text-muted)] scrollbar-none">
                      <span className="text-emerald-400 font-semibold shrink-0">Subsystems:</span>
                      <span className="truncate">{cat.systems.slice(0, 2).join(' • ')}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
