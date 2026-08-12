import React, { useState } from 'react';
import { Layers, ArrowRight, Building2, Droplets, Zap, Sparkles, Box, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';
import { Button } from '../shared/Button';

// Import actual Stage 01 UELE objects data
import ueleObjectsData from '../../data/uele-objects.json';

export interface UELEPreviewProps {
  onNavigate: (sectionId: string) => void;
}

export const UELEPreview: React.FC<UELEPreviewProps> = ({ onNavigate }) => {
  const [activeEnv, setActiveEnv] = useState<string>('water-world');

  const environments = [
    { id: 'water-world', name: 'Water World', icon: Droplets, color: 'blue', desc: 'Water treatment plants, intake structures, reservoirs & pipe networks' },
    { id: 'smart-city', name: 'Smart City', icon: Building2, color: 'emerald', desc: 'Integrated urban infrastructure, BIM, roads, drainage & utilities' },
    { id: 'industrial-world', name: 'Industrial World', icon: Zap, color: 'amber', desc: 'Power substations, industrial plants, tanks, conveyors & SCADA' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Layers, color: 'purple', desc: 'Bridges, highways, railways, tunnels & structural systems' },
    { id: 'natural-world', name: 'Natural World', icon: Sparkles, color: 'cyan', desc: 'Rivers, agricultural systems, terrain, coastal & environmental' },
  ];

  // Filter or show object details for activeEnv
  const currentEnv = environments.find((e) => e.id === activeEnv) || environments[0];

  return (
    <section id="uele-section" className="py-12 lg:py-16 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="UELE 3D Ecosystem"
          badgeVariant="emerald"
          title="Explore Engineering Through the Real World."
          description="From a water treatment plant to a smart city, from an industrial facility to a village — explore the physical engineering systems behind the built world around us."
          action={
            <Button
              variant="uele"
              size="md"
              leftIcon={<Layers className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('uele')}
            >
              Enter UELE 3D Ecosystem
            </Button>
          }
        />

        {/* Environment Pills Selector */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {environments.map((env) => {
            const Icon = env.icon;
            const isActive = activeEnv === env.id;

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => setActiveEnv(env.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center space-x-2 whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--accent-emerald)] text-white border-[var(--accent-emerald)] shadow-md'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-emerald)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{env.name}</span>
              </button>
            );
          })}
        </div>

        {/* Environment Interactive Preview Box */}
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--accent-emerald)]/30 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Background */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-[var(--accent-emerald-bg)] rounded-full blur-3xl pointer-events-none opacity-50" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge variant="emerald" icon={<Box className="w-3 h-3" />}>
                  {currentEnv.name} Environment
                </Badge>
                <span className="text-xs font-mono text-[var(--text-muted)]">3D Interactive Canvas</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                {currentEnv.name} Preview
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
                {currentEnv.desc}
              </p>
            </div>

            <Button
              variant="uele"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => onNavigate('uele')}
            >
              Launch Environment
            </Button>
          </div>

          {/* Objects Showcase Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ueleObjectsData.map((obj) => (
              <Card
                key={obj.id}
                variant="uele"
                hoverable
                padding="md"
                className="space-y-3 cursor-pointer group"
                onClick={() => onNavigate('uele')}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)]">
                    <Box className="w-4 h-4" />
                  </div>
                  {obj.comingSoon ? (
                    <Badge variant="amber" size="sm">In Development</Badge>
                  ) : (
                    <Badge variant="emerald" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                      Interactive 3D
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-emerald)] transition-colors">
                    {obj.name}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1 line-clamp-2">
                    {obj.description}
                  </p>
                </div>

                {obj.components && obj.components.length > 0 && (
                  <div className="pt-2 border-t border-[var(--border-color)] text-[11px] font-mono text-[var(--text-muted)]">
                    {obj.components.length} Sub-Components (Intake, Filter, Basin)
                  </div>
                )}
              </Card>
            ))}

            {/* Placeholder Upcoming Object Card */}
            <Card
              variant="outline"
              padding="md"
              className="border-dashed space-y-3 flex flex-col justify-center items-center text-center p-6 bg-[var(--bg-elevated)]/40"
            >
              <div className="p-3 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">More Objects Loading...</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Substations, Bridges, Pumping Stations & Water Networks in pipeline.
                </p>
              </div>
              <Badge variant="muted" size="sm">Stage 06 3D Engine</Badge>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
