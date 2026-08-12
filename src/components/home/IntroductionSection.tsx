import React from 'react';
import { Compass, BookOpen, Wrench, FolderGit2, Layers, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';

export const IntroductionSection: React.FC = () => {
  const connectionItems = [
    {
      title: 'Career Direction',
      description: 'Structured pathways from undergraduate choices to senior specialist roles.',
      icon: Compass,
      color: 'purple',
    },
    {
      title: 'Engineering Knowledge',
      description: 'Hydraulics, mechanics, structural theory, thermodynamics, and systems.',
      icon: BookOpen,
      color: 'blue',
    },
    {
      title: 'Digital Tools & Software',
      description: 'WaterCAD, EPANET, Civil 3D, Revit, SAP2000, ETABS, MATLAB, and GIS.',
      icon: Wrench,
      color: 'cyan',
    },
    {
      title: 'Standards & Codes',
      description: 'AWWA, ISO, ACI, Eurocodes, ASTM, and regional engineering specifications.',
      icon: ShieldCheck,
      color: 'amber',
    },
    {
      title: 'Real-World Projects',
      description: 'Case studies, design calculations, BIM models, and construction drawings.',
      icon: FolderGit2,
      color: 'emerald',
    },
    {
      title: 'Interactive 3D UELE',
      description: 'Visual exploration of physical infrastructure and engineering systems.',
      icon: Layers,
      color: 'emerald',
    },
  ];

  return (
    <section className="py-12 lg:py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Ecosystem Vision"
          badgeVariant="blue"
          title="Engineering, Connected."
          description="EVLab connects the core pillars of an engineering career into one unified digital ecosystem — bridging theoretical knowledge with software tools, standards, and real project practice."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectionItems.map((item, idx) => {
            const Icon = item.icon;
            const accentClass = {
              purple: 'text-[var(--accent-purple)] bg-[var(--accent-purple-bg)] border-[var(--accent-purple)]/20',
              blue: 'text-[var(--accent-blue)] bg-[var(--accent-blue-bg)] border-[var(--accent-blue)]/20',
              cyan: 'text-[var(--accent-cyan)] bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)]/20',
              amber: 'text-[var(--accent-warning)] bg-[var(--accent-warning-bg)] border-[var(--accent-warning)]/20',
              emerald: 'text-[var(--accent-emerald)] bg-[var(--accent-emerald-bg)] border-[var(--accent-emerald)]/20',
            }[item.color];

            return (
              <Card key={idx} hoverable padding="md" className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${accentClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
