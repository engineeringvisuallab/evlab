import React, { useState } from 'react';
import { PROJECTS_DATA, Project } from '../data/projects';
import { ProjectModal } from './ProjectModal';
import { ArrowUpRight, Eye, Layers, Box, CheckCircle2 } from 'lucide-react';

export function WaterInfrastructureShowcase() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter civil / water / sewerage / WTP projects
  const waterProjects = PROJECTS_DATA.filter((p) =>
    p.filterCategories.some((cat) => ['water-supply', 'sewerage', 'wtp-intake', 'transmission-main'].includes(cat))
  );

  return (
    <section id="water-civil-projects" className="py-20 sm:py-28 relative bg-[#070d1a] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>WATER & CIVIL SPECIALIZATION</span>
              <span className="text-slate-600">·</span>
              <span>ENGINEERING DRAWINGS & DOCUMENTATION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Water Supply, Sewerage & WTP Projects
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm sm:text-right">
            Distribution network plans, continuous longitudinal profiles, valve chamber details, and WTP general arrangements.
          </p>
        </div>

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {waterProjects.slice(0, 6).map((project) => (
            <div
              key={project.id}
              className="group rounded-3xl bg-[#091122] border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl"
            >
              {/* Media Thumbnail */}
              <div
                className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#091122] via-transparent to-black/40" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="bg-black/80 px-2.5 py-0.5 rounded-lg text-cyan-300 border border-cyan-500/30">
                    {project.category}
                  </span>
                  <span className="bg-black/80 px-2 py-0.5 rounded text-slate-300">
                    {project.year}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <span className="bg-slate-900/80 px-2 py-0.5 rounded text-slate-300">
                    {project.drawings.length} CAD Sheets
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Drawings</span>
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-display line-clamp-2 cursor-pointer mb-2"
                  >
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {project.oneLineSummary}
                  </p>
                </div>

                {/* Actual Drawings Delivered preview */}
                <div className="space-y-1 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                    Key Drawings Prepared:
                  </span>
                  {project.drawings.slice(0, 2).map((dwg, dIdx) => (
                    <div key={dIdx} className="truncate flex items-center gap-1.5">
                      <span className="text-cyan-400">·</span>
                      <span className="text-slate-300">{dwg}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-slate-950 bg-slate-900 group-hover:bg-cyan-400 rounded-xl transition-all duration-150 cursor-pointer"
                  >
                    <span>View Project Drawings</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
