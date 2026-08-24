import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'roadmap' | 'uele' | 'cyan' | 'emerald' | 'amber';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = false,
      children,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl active:scale-[0.98]';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
    };

    const variantStyles = {
      primary:
        'bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white shadow-sm hover:shadow-md border border-transparent',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]',
      outline:
        'bg-transparent text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] hover:bg-[var(--accent-blue-bg)]',
      ghost:
        'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent',
      roadmap:
        'bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-hover)] text-white shadow-sm hover:shadow-[var(--glow-purple)] border border-transparent font-semibold',
      uele:
        'bg-[var(--accent-emerald)] hover:bg-[var(--accent-emerald-hover)] text-white shadow-sm hover:shadow-[var(--glow-emerald)] border border-transparent font-semibold',
      cyan:
        'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-sm border border-transparent',
      emerald:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-sm border border-transparent',
      amber:
        'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-sm border border-transparent',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
