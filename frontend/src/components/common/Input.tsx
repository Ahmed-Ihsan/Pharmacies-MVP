import { cn } from '../../utils/cn';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[hsl(var(--text-secondary))]">
            {icon && <span className="text-[hsl(var(--primary))]">{icon}</span>}
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={cn(
              'w-full h-12 px-4 rounded-xl bg-[hsl(var(--bg-elevated))] border-2 border-[hsl(var(--border))] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-secondary))]/40',
              'focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-4 focus:ring-[hsl(var(--primary)/0.1)]',
              'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] text-sm font-medium',
              'group-hover:border-[hsl(var(--border-glow))] group-hover:shadow-lg',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--muted))]',
              error && 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive)/0.1)]',
              icon && 'pr-12',
              className
            )}
            {...props}
          />
          {icon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--primary))]">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[hsl(var(--destructive))] flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
