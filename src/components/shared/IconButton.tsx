import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  'aria-label': string;
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'ghost',
      size = 'md',
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2',
      lg: 'w-12 h-12 p-3',
    };

    const variantClasses = {
      ghost:
        'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-[var(--accent-blue-bg)]',
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        className={`inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
