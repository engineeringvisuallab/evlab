import React, { useState } from 'react';
import { PROJECTS_DATA, PROJECT_FILTER_CATEGORIES, Project } from '../data/projects';
import { ProjectModal } from './ProjectModal';
import { ArrowUpRight, Eye, Video, Box, Layers, ShieldCheck } from 'lucide-react';

export function Projects() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    if (activeFilter === 'all') return true;
    return project.filterCategories.includes(activeFilter);
  });

  return (
    <section id="projects" className="py-20 sm:py-28 relative bg-[#060c18] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-1.5">
              <span>VISUAL CASE STUDIES</span>
              <span className="text-slate-600">·</span>
              <span>ACTUAL WORK PRODUCED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Featured Project Portfolio
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>High-resolution visual submittals & models</span>
          </div>
        </div>

        {/* Filter Bar: Segmented Buttons with single-line controls */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#080f22] border border-slate-800 rounded-2xl overflow-x-auto mb-10 max-w-full">
          {PROJECT_FILTER_CATEGORIES.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Large Visual Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-3xl bg-[#081122] border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl hover:shadow-cyan-950/40"
            >
              {/* Large Image Media Header */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#081122] via-transparent to-black/40" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="bg-black/75 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-cyan-300 border border-cyan-500/30">
                    {project.category}
                  </span>
                  <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-slate-300 border border-slate-700">
                    {project.year}
                  </span>
                </div>

                {/* Media Indicators (3D, Video, Drawings) */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                  <div className="flex items-center gap-1.5">
                    {project.model3D && (
                      <span className="bg-cyan-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-800/50 flex items-center gap-1 text-[10px]">
                        <Box className="w-3 h-3 text-cyan-400" />
                        <span>3D Model</span>
                      </span>
                    )}
                    {project.videos && project.videos.length > 0 && (
                      <span className="bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 text-[10px]">
                        <Video className="w-3 h-3 text-cyan-400" />
                        <span>Walkthrough</span>
                      </span>
                    )}
                  </div>

                  <span className="bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-slate-300 flex items-center gap-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>View Project</span>
                  </span>
                </div>
              </div>

              {/* Project Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors font-display line-clamp-2 cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {project.oneLineSummary}
                  </p>
                </div>

                {/* Software Used Badges */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {project.software.slice(0, 4).map((sw, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 rounded border border-cyan-900/40"
                    >
                      {sw}
                    </span>
                  ))}
                  {project.software.length > 4 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded">
                      +{project.software.length - 4}
                    </span>
                  )}
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-200 group-hover:text-slate-950 bg-slate-900 group-hover:bg-cyan-400 rounded-xl transition-all duration-150 cursor-pointer"
                  >
                    <span>View Full Case Study</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Rich Project Submittal Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
