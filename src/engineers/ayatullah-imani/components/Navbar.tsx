import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { Link as EVLabLink } from '@/components/shared/Link';
import { PORTFOLIO_CONFIG } from '../data/config';

interface NavbarProps {
  onHireClick: () => void;
}

export function Navbar({ onHireClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'What I Do', href: '#what-i-do' },
    { label: 'Projects', href: '#projects' },
    { label: 'Buildings', href: '#building-projects' },
    { label: 'Water & Civil', href: '#water-civil-projects' },
    { label: '3D Visualization', href: '#visualization' },
    { label: 'Tools', href: '#tools' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' }
  ];

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-[#060b17]/95 backdrop-blur-md border-b border-slate-800 shadow-xl'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">

          {/* Back to the EVLab Engineers directory + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <EVLabLink
            to="/engineers"
            title="Back to The Engineers"
            className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors text-[11px] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            The Engineers
          </EVLabLink>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors font-display"
          >
            {PORTFOLIO_CONFIG.fullName}
          </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs sm:text-sm font-medium text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="transition-colors hover:text-white py-1"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Primary Action Button: HIRE ME */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onHireClick}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-950/50 cursor-pointer whitespace-nowrap"
            >
              <span>Hire Me</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#091122]/98 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
          <EVLabLink
            to="/engineers"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1.5 p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to The Engineers
          </EVLabLink>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.href);
                }}
                className="p-2.5 rounded-lg text-slate-200 hover:bg-slate-800"
              >
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onHireClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl cursor-pointer"
            >
              <span>Hire Me</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
