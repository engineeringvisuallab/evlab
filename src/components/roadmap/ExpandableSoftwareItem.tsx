import React, { useState } from 'react';
import { Cpu, ExternalLink, Sparkles, Building, Layers } from 'lucide-react';
import { getSoftwareItem, RegistryItem } from '../../utils/registryLookup';

export interface ExpandableSoftwareItemProps {
  softwareId: string;
  className?: string;
  variant?: 'pill' | 'card';
}

export const ExpandableSoftwareItem: React.FC<ExpandableSoftwareItemProps> = ({
  softwareId,
  className = '',
  variant = 'pill',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const info: RegistryItem | null = getSoftwareItem(softwareId);

  const displayName = info?.name || softwareId.replace(/-/g, ' ').toUpperCase();
  const category = info?.category || 'Engineering Software';
  const vendor = info?.vendor || '';
  const description = info?.description || '';
  const url = info?.url || '';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-block transition-all duration-300 ${className}`}
    >
      {/* Base Compact Pill - Shows ONLY Software Name */}
      <div
        className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
          isHovered
            ? 'bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)] text-[var(--accent-cyan)] shadow-md shadow-cyan-500/10'
            : 'bg-[var(--bg-elevated)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)]/40'
        }`}
      >
        <Cpu className="w-3.5 h-3.5 text-[var(--accent-cyan)] shrink-0" />
        <span className="font-mono font-semibold">{displayName}</span>
        {isHovered && (
          <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] font-mono">
            {category}
          </span>
        )}
      </div>

      {/* Expandable Dropdown / Popout Card on Hover */}
      <div
        className={`absolute left-0 bottom-full mb-2 z-40 w-64 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-cyan)]/60 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none ${
          isHovered
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }`}
      >
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-[var(--border-color)]">
            <div className="flex items-center space-x-1.5 text-[var(--accent-cyan)]">
              <Cpu className="w-4 h-4 shrink-0" />
              <span className="font-bold text-xs text-[var(--text-primary)] truncate">{displayName}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] font-semibold shrink-0">
              {category}
            </span>
          </div>

          {/* Vendor */}
          {vendor && (
            <div className="flex items-center space-x-1 text-[10px] text-[var(--text-muted)] font-mono">
              <Building className="w-3 h-3" />
              <span>Developer: {vendor}</span>
            </div>
          )}

          {/* Description */}
          {description ? (
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
              {description}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--text-muted)] italic">
              Standard engineering computation & simulation software tool.
            </p>
          )}

          {/* Direct Link if available */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-1 flex items-center justify-between text-[10px] font-mono text-[var(--accent-cyan)] hover:underline"
            >
              <span>Official Tool Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
