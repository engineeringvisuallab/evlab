import React, { useState } from 'react';
import { PORTFOLIO_CONFIG, getWhatsAppLink } from '../data/config';
import { Send, MessageSquare, Mail, CheckCircle2, Clock, DollarSign, ArrowUpRight } from 'lucide-react';

interface HiringInquiryProps {
  initialService?: string;
}

export function HiringInquiry({ initialService }: HiringInquiryProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    contactInfo: '', // WhatsApp / Email
    requiredService: initialService || 'AutoCAD',
    projectType: 'Civil / Water / Building',
    description: '',
    deliverables: 'CAD Plans, Sections & PDF Set',
    referenceLink: '',
    deadline: ''
  });

  const [submitted, setSubmitted] = useState(false);

  // EXACT dropdown options requested by user:
  const allowedServices = [
    'AutoCAD',
    'Civil 3D',
    'Revit',
    'Water / Sewerage Drawings',
    'Documentation / Estimation',
    '3D Visualization',
    'Other'
  ];

  const formattedInquiryMessage = `Hello Md. Ayatullah Imani,

I want to discuss a project with you:
- Name: ${formData.name || '[Not specified]'}
- Company: ${formData.company || '[Not specified]'}
- WhatsApp / Email: ${formData.contactInfo || '[Provided in chat]'}
- Required Service: ${formData.requiredService}
- Project Type: ${formData.projectType}
- Description: ${formData.description || 'Discuss project scope and requirements.'}
- Required Deliverables: ${formData.deliverables}
- Reference Files / Link: ${formData.referenceLink || 'None provided'}
- Deadline: ${formData.deadline || 'Standard Timeline'}

Looking forward to your scope and availability review.`;

  const whatsAppLink = getWhatsAppLink(formattedInquiryMessage);
  const emailMailtoLink = `mailto:${PORTFOLIO_CONFIG.email}?subject=${encodeURIComponent(
    `CAD & Engineering Project Inquiry: ${formData.requiredService} [${formData.name || 'New Client'}]`
  )}&body=${encodeURIComponent(formattedInquiryMessage)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.location.href = emailMailtoLink;
  };

  return (
    <section id="contact" className="py-20 sm:py-28 relative bg-[#060b17] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-cyan-400 mb-2">
            <span>CLIENT HIRING</span>
            <span className="text-slate-600">·</span>
            <span>START A PROJECT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
            Need CAD or Engineering Documentation?
          </h2>

          <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
            I can help prepare detailed CAD drawings, building documentation, Civil 3D/Revit deliverables, water supply & sewerage details, technical documentation and 3D visualizations.
          </p>

          {/* 3 Direct Header Buttons */}
          <div className="pt-5 flex flex-wrap items-center gap-3.5">
            <a
              href="#inquiry-form"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-950/50 cursor-pointer"
            >
              <span>Hire Me</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href="#inquiry-form"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <span>Send Project Details</span>
            </a>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Me</span>
            </a>
          </div>
        </div>

        {/* Project Inquiry Form */}
        <div id="inquiry-form" className="max-w-4xl p-6 sm:p-8 rounded-3xl bg-[#091122] border border-cyan-950 shadow-2xl">
          <h3 className="text-lg font-bold text-white font-display mb-1">
            Project Inquiry Form
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Fill in your project requirements below to receive a fast scope, pricing, and timeline review.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Engr. Rahman"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Design Firm / Construction Co."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            {/* WhatsApp / Email & Required Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  WhatsApp / Email *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +880 17... or client@company.com"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Required Service *
                </label>
                <select
                  value={formData.requiredService}
                  onChange={(e) => setFormData({ ...formData, requiredService: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 text-xs font-semibold"
                >
                  {allowedServices.map((service, idx) => (
                    <option key={idx} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Type & Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Project Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building / Water Supply / Infrastructure"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Deadline
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 week / Immediate / Ongoing"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs font-mono"
                />
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                Project Description *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your project, drawings needed, or specific CAD/Revit requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs leading-relaxed"
              />
            </div>

            {/* Required Deliverables & Reference Files */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Required Deliverables
                </label>
                <input
                  type="text"
                  placeholder="e.g. .DWG CAD files, PDF booklets, 3D Renders"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Reference Files / Link
                </label>
                <input
                  type="url"
                  placeholder="e.g. Google Drive / Dropbox link with sketches"
                  value={formData.referenceLink}
                  onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-950/50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Project Details</span>
              </button>

              <a
                href={whatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Me</span>
              </a>
            </div>

            {submitted && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Inquiry drafted! Click send in your email client or message via WhatsApp above.</span>
              </div>
            )}
          </form>
        </div>

      </div>
    </section>
  );
}
