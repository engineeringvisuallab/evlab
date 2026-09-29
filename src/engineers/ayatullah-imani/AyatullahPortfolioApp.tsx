import { useState } from 'react';
import './portfolio.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { WhatClientsHireMeFor } from './components/WhatClientsHireMeFor';
import { Projects } from './components/Projects';
import { BuildingProjectsShowcase } from './components/BuildingProjectsShowcase';
import { WaterInfrastructureShowcase } from './components/WaterInfrastructureShowcase';
import { VisualizationLab } from './components/VisualizationLab';
import { ToolsIUse } from './components/ToolsIUse';
import { AutomationSection } from './components/AutomationSection';
import { WhatYouGet } from './components/WhatYouGet';
import { About } from './components/About';
import { Experience } from './components/Experience';
import { EVLabSection } from './components/EVLabSection';
import { AYTMartSection } from './components/AYTMartSection';
import { HiringInquiry } from './components/HiringInquiry';
import { Footer } from './components/Footer';

/**
 * Md. Ayatullah Imani — full standalone engineering portfolio, ported in as-is
 * from its own AI-Studio project and embedded at /engineers/ayatullah-imani.
 * Renders full-screen with its own nav/theme (same treatment as the other
 * standalone /software/* and /uele/play tools) rather than EVLab's chrome.
 */
export default function AyatullahPortfolioApp() {
  const [selectedServiceInquiry, setSelectedServiceInquiry] = useState<string>('AutoCAD');

  const handleScrollToProjects = () => {
    const el = document.querySelector('#projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToHire = () => {
    const el = document.querySelector('#contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectServiceForInquiry = (serviceTitle: string) => {
    // Map service title to the allowed dropdown value
    if (serviceTitle.includes('AutoCAD')) setSelectedServiceInquiry('AutoCAD');
    else if (serviceTitle.includes('Civil 3D')) setSelectedServiceInquiry('Civil 3D');
    else if (serviceTitle.includes('Revit')) setSelectedServiceInquiry('Revit');
    else if (serviceTitle.includes('Water') || serviceTitle.includes('Sewerage')) setSelectedServiceInquiry('Water / Sewerage Drawings');
    else if (serviceTitle.includes('Documentation') || serviceTitle.includes('Estimation')) setSelectedServiceInquiry('Documentation / Estimation');
    else if (serviceTitle.includes('Visualization') || serviceTitle.includes('3D')) setSelectedServiceInquiry('3D Visualization');
    else setSelectedServiceInquiry('Other');

    handleScrollToHire();
  };

  return (
    <div className="ayt-portfolio min-h-screen bg-[#060b17] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 flex flex-col font-sans">
      {/* Navigation Header (includes the "back to Engineers directory" link) */}
      <Navbar onHireClick={handleScrollToHire} />

      <main className="flex-1">
        {/* 1. HERO */}
        <Hero
          onPortfolioClick={handleScrollToProjects}
          onHireClick={handleScrollToHire}
        />

        {/* 2. WHAT CLIENTS HIRE ME FOR (Exactly 6 Services with Visual Drawings) */}
        <WhatClientsHireMeFor onSelectService={handleSelectServiceForInquiry} />

        {/* 3. SELECTED PROJECTS */}
        <Projects />

        {/* 4. BUILDING PROJECTS (Major Category) */}
        <BuildingProjectsShowcase />

        {/* 5. WATER / SEWERAGE / WTP PROJECTS */}
        <WaterInfrastructureShowcase />

        {/* 6. 3D VISUALIZATION */}
        <VisualizationLab />

        {/* 7. TOOLS I USE */}
        <ToolsIUse />

        {/* 8. ADDITIONAL: CAD / GIS TOOL DEVELOPMENT */}
        <AutomationSection />

        {/* WHAT YOU GET (Client Assurance of Handed-Over Deliverables) */}
        <WhatYouGet onHireClick={handleScrollToHire} />

        {/* 9. SHORT ABOUT ME */}
        <About />

        {/* 10. EXPERIENCE / EDUCATION */}
        <Experience />

        {/* 11. EVLAB (Small Secondary Initiative) */}
        <EVLabSection />

        {/* 12. AYT MART (Small Secondary Project) */}
        <AYTMartSection />

        {/* 13. HIRE ME / CONTACT (Practical Client Inquiry Form) */}
        <HiringInquiry initialService={selectedServiceInquiry} />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
