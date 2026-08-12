import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'blue'
  | 'purple'
  | 'emerald'
  | 'cyan'
  | 'amber'
  | 'outline'
  | 'muted';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-mono uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles = {
    default:
      'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)]',
    blue:
      'bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] border border-[var(--accent-blue)]/20',
    purple:
      'bg-[var(--accent-purple-bg)] text-[var(--accent-purple)] border border-[var(--accent-purple)]/20',
    emerald:
      'bg-[var(--accent-emerald-bg)] text-[var(--accent-emerald)] border border-[var(--accent-emerald)]/20',
    cyan:
      'bg-[var(--accent-cyan-bg)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20',
    amber:
      'bg-[var(--accent-warning-bg)] text-[var(--accent-warning)] border border-[var(--accent-warning)]/20',
    outline:
      'bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)]',
    muted:
      'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-transparent',
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="inline-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
