import React from 'react';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
  label,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px h-full bg-[var(--border-color)] self-stretch mx-2 ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center w-full my-6 ${className}`} role="separator">
        <div className="flex-grow h-px bg-[var(--border-color)]" />
        <span className="px-3 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow h-px bg-[var(--border-color)]" />
      </div>
    );
  }

  return (
    <hr
      className={`w-full border-t border-[var(--border-color)] my-6 ${className}`}
      role="separator"
    />
  );
};
