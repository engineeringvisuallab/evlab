import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'sm',
}) => {
  const variantStyles = {
    primary: 'bg-blue-900/50 text-blue-300 border-blue-700/50',
    success: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
    warning: 'bg-amber-900/50 text-amber-300 border-amber-700/50',
    danger: 'bg-rose-900/50 text-rose-300 border-rose-700/50',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    info: 'bg-cyan-900/50 text-cyan-300 border-cyan-700/50',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border tracking-wide uppercase font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
