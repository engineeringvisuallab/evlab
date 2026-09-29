import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  onNavigate?: (href?: string) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  onNavigate,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent, href?: string) => {
    if (href) {
      e.preventDefault();
      if (onNavigate) {
        onNavigate(href);
      }
    }
  };

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1.5 text-xs text-[var(--text-muted)] font-mono ${className}`}>
      {showHome && (
        <>
          <button
            type="button"
            onClick={(e) => handleClick(e, '/')}
            className="flex items-center hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg-elevated)] cursor-pointer"
            aria-label="EVLab Home"
          >
            <Home className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--border-subtle)] shrink-0" />
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.active;

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => handleClick(e, item.href)}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px] sm:max-w-xs hover:underline underline-offset-4 cursor-pointer"
              >
                {item.label}
              </button>
            )}

            {!isLast && (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--border-subtle)] shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
