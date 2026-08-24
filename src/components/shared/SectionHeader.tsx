import React from 'react';
import { Badge } from './Badge';

export interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'blue' | 'purple' | 'emerald' | 'cyan' | 'amber' | 'default';
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = 'blue',
  title,
  description,
  action,
  align = 'left',
  className = '',
}) => {
  const alignClasses = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}>
      <div className={`flex flex-col space-y-2 ${alignClasses}`}>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
