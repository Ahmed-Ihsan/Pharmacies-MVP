import { cn } from '../../utils/cn';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'btn-luxury-primary',
      secondary: 'btn-luxury-secondary',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg rounded-full transition-all duration-300 hover:shadow-xl',
      outline: 'glass-panel border border-[hsl(var(--border-lux))] bg-transparent text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-glow))] hover:bg-[hsl(var(--accent))] rounded-full transition-all duration-300',
      ghost: 'bg-transparent text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] rounded-full transition-all duration-300',
    };

    const sizes = {
      sm: 'h-9 px-4 text-xs',
      md: 'h-11 px-5 text-sm',
      lg: 'h-13 px-7 text-sm',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]/30 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
