import React from 'react';
import { GraduationCap, Wrench, Building2, Shield, BookOpen, Search } from 'lucide-react';
import { SectionHeader } from '../shared/SectionHeader';
import { Card } from '../shared/Card';

export const AudienceSection: React.FC = () => {
  const audiences = [
    {
      title: 'Students',
      desc: 'Find your engineering direction, explore fields, and understand what software and skills to master early.',
      icon: GraduationCap,
      color: 'purple',
    },
    {
      title: 'Engineers',
      desc: 'Deepen your technical skills, master advanced modeling software, and navigate career specialization paths.',
      icon: Wrench,
      color: 'blue',
    },
    {
      title: 'Consultants',
      desc: 'Bridge theory with project practice, access design codes, calculation sheets, and BIM drawings.',
      icon: Building2,
      color: 'emerald',
    },
    {
      title: 'Organizations',
      desc: 'Develop engineering workforce capability, standardize technical workflows, and upskill teams.',
      icon: Shield,
      color: 'cyan',
    },
    {
      title: 'Educators',
      desc: 'Structure curriculum with real-world software, standards, and interactive 3D engineering models.',
      icon: BookOpen,
      color: 'amber',
    },
    {
      title: 'Researchers',
      desc: 'Connect advanced engineering research with practical software implementation and infrastructure case studies.',
      icon: Search,
      color: 'purple',
    },
  ];

  return (
    <section className="py-12 lg:py-16 border-t border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          badge="Who EVLab Is For"
          badgeVariant="cyan"
          title="Built for Everyone Who Builds the World."
          description="Whether you are an engineering student discovering your path or a senior consultant designing complex infrastructure, EVLab provides the connected knowledge you need."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {audiences.map((aud, idx) => {
            const Icon = aud.icon;

            return (
              <Card key={idx} hoverable padding="md" className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--accent-blue)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    {aud.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {aud.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
