import React from 'react';
import {
  Compass,
  BookOpen,
  Wrench,
  GraduationCap,
  Cpu,
  FolderGit2,
  FileCode2,
  Sparkles,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';
import { Badge } from '../shared/Badge';

export interface EcosystemFeaturesProps {
  onNavigate: (sectionId: string) => void;
}

export const EcosystemFeatures: React.FC<EcosystemFeaturesProps> = ({ onNavigate }) => {
  const features = [
    {
      id: 'roadmap',
      title: 'Career Roadmap',
      desc: 'Find your engineering path from undergraduate choices to specialist roles.',
      icon: Compass,
      badge: 'Primary',
      color: 'purple',
    },
    {
      id: 'learn',
      title: 'Engineering Knowledge',
      desc: 'Understand the fundamental hydraulics, structural, electrical and physical theory.',
      icon: BookOpen,
      badge: 'Core',
      color: 'blue',
    },
    {
      id: 'software',
      title: 'Software & Tools',
      desc: 'Discover WaterCAD, EPANET, Civil 3D, Revit, SAP2000, ETABS and MATLAB.',
      icon: Wrench,
      badge: 'Tools',
      color: 'cyan',
    },
    {
      id: 'learn',
      title: 'Courses & Masterclasses',
      desc: 'Structured technical training courses for software modeling and engineering design.',
      icon: GraduationCap,
      badge: 'Learning',
      color: 'amber',
    },
    {
      id: 'plugins',
      title: 'Plugins & Add-ons',
      desc: 'Custom automation plugins and scripts for Civil 3D, Revit and GIS workflows.',
      icon: Cpu,
      badge: 'Software',
      color: 'blue',
    },
    {
      id: 'resources',
      title: 'Resources & Drawings',
      desc: 'CAD/BIM drawings, calculation spreadsheets, AWWA/ISO codes and specs.',
      icon: FileCode2,
      badge: 'Library',
      color: 'emerald',
    },
    {
      id: 'projects',
      title: 'Case Study Projects',
      desc: 'Learn from actual infrastructure projects, water treatment plants and bridges.',
      icon: FolderGit2,
      badge: 'Practice',
      color: 'purple',
    },
    {
      id: 'learn',
      title: 'Technical Training',
      desc: 'Workshops, industry bootcamps and professional development programs.',
      icon: Sparkles,
      badge: 'Workshops',
      color: 'amber',
    },
    {
      id: 'consultancy',
      title: 'Engineering Consultancy',
      desc: 'Connect deep technical knowledge with real-world infrastructure project delivery.',
      icon: Building2,
      badge: 'Services',
      color: 'emerald',
    },
  ];

  return (
    <section className="py-12 lg:py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Ecosystem Matrix"
          badgeVariant="blue"
          title="Everything an Engineer Needs."
          description="One connected platform uniting career direction, theoretical knowledge, software tools, learning resources, and real project practice."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;

            return (
              <Card
                key={idx}
                hoverable
                padding="md"
                className="space-y-4 cursor-pointer group flex flex-col justify-between"
                onClick={() => onNavigate(feat.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] group-hover:border-[var(--accent-blue)] transition-colors">
                      <Icon className="w-5 h-5 text-[var(--accent-blue)]" />
                    </div>
                    <Badge variant={feat.color as any} size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-blue)] transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent-blue)] transition-colors">
                  <span>Explore {feat.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
