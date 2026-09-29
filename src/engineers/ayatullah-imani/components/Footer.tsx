import React from 'react';
import { PORTFOLIO_CONFIG, getWhatsAppLink } from '../data/config';
import { ExternalLink, ArrowUp, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import { LinkedinIcon, GithubIcon, FacebookIcon } from './BrandIcons';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050812] border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold text-white tracking-tight font-display">
              {PORTFOLIO_CONFIG.fullName}
            </h3>
            
            <div className="font-mono text-cyan-400 text-xs font-semibold">
              {PORTFOLIO_CONFIG.primaryPositioning}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              AutoCAD & ArcGIS water network design, 61 DMA demarcation, transmission mains, standard chambers, Civil 3D profiles, and building bored pile construction supervision.
            </p>

            {/* Social & Contact Channels */}
            <div className="pt-2 flex items-center gap-2.5">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href={PORTFOLIO_CONFIG.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/60 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={PORTFOLIO_CONFIG.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              {PORTFOLIO_CONFIG.facebookUrl && (
                <a
                  href={PORTFOLIO_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/60 flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              <a
                href={`mailto:${PORTFOLIO_CONFIG.email}`}
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Initiatives & Projects (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Other Initiatives
            </h4>

            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-amber-400">Engineering Initiative</div>
                  <div className="text-xs font-semibold text-white">EVLab</div>
                </div>
                <a
                  href={PORTFOLIO_CONFIG.evlabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 hover:text-amber-200"
                >
                  <span>Visit ↗</span>
                </a>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400">Digital Venture</div>
                  <div className="text-xs font-semibold text-white">AYT Mart</div>
                </div>
                <a
                  href={PORTFOLIO_CONFIG.aytMartUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300 hover:text-cyan-200"
                >
                  <span>Visit ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Quick Links
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a href="#what-i-do" className="hover:text-cyan-300 transition-colors py-0.5">What I Do</a>
              <a href="#projects" className="hover:text-cyan-300 transition-colors py-0.5">Projects</a>
              <a href="#building-projects" className="hover:text-cyan-300 transition-colors py-0.5">Buildings</a>
              <a href="#water-civil-projects" className="hover:text-cyan-300 transition-colors py-0.5">Water & Civil</a>
              <a href="#visualization" className="hover:text-cyan-300 transition-colors py-0.5">3D Visuals</a>
              <a href="#tools" className="hover:text-cyan-300 transition-colors py-0.5">Tools</a>
              <a href="#about" className="hover:text-cyan-300 transition-colors py-0.5">About</a>
              <a href="#contact" className="hover:text-cyan-300 transition-colors py-0.5">Hire Me</a>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-mono">
          <div>
            © {currentYear} {PORTFOLIO_CONFIG.fullName}. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Professional CAD & Engineering Documentation</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
