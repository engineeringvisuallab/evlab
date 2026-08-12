import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  accent?: 'blue' | 'purple' | 'emerald' | 'cyan' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  description,
  icon,
  accent = 'blue',
  className = '',
}) => {
  const accentColors = {
    blue: 'text-[var(--accent-blue)] bg-[var(--accent-blue-bg)] border-[var(--accent-blue)]/20',
    purple: 'text-[var(--accent-purple)] bg-[var(--accent-purple-bg)] border-[var(--accent-purple)]/20',
    emerald: 'text-[var(--accent-emerald)] bg-[var(--accent-emerald-bg)] border-[var(--accent-emerald)]/20',
    cyan: 'text-[var(--accent-cyan)] bg-[var(--accent-cyan-bg)] border-[var(--accent-cyan)]/20',
    amber: 'text-[var(--accent-warning)] bg-[var(--accent-warning-bg)] border-[var(--accent-warning)]/20',
  };

  return (
    <Card padding="md" hoverable className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between space-x-3">
        <div className="space-y-1">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text-primary)] tracking-tight">
            {value}
          </div>
          {description && (
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`p-2.5 rounded-xl border shrink-0 ${accentColors[accent]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
