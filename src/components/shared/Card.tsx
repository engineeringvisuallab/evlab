import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  variant?: 'default' | 'elevated' | 'outline' | 'roadmap' | 'uele';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      hoverable = false,
      variant = 'default',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles = {
      default:
        'bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)]',
      elevated:
        'bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-md',
      outline:
        'bg-transparent border border-[var(--border-color)] text-[var(--text-primary)]',
      roadmap:
        'bg-[var(--bg-surface)] border border-[var(--accent-purple)]/30 hover:border-[var(--accent-purple)] text-[var(--text-primary)]',
      uele:
        'bg-[var(--bg-surface)] border border-[var(--accent-emerald)]/30 hover:border-[var(--accent-emerald)] text-[var(--text-primary)]',
    };

    const hoverStyle = hoverable
      ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--border-subtle)]'
      : '';

    return (
      <div
        ref={ref}
        className={`rounded-2xl transition-colors duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`text-lg font-bold tracking-tight text-[var(--text-primary)] ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => <div className={`text-sm text-[var(--text-primary)] ${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`flex items-center pt-4 mt-4 border-t border-[var(--border-color)] ${className}`}
    {...props}
  >
    {children}
  </div>
);
