import { cn } from '../../utils/cn';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]',
            'px-3.5 py-2 text-sm text-[hsl(var(--foreground))]',
            'placeholder:text-[hsl(var(--muted-foreground))]',
            'focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)]',
            'transition-[border-color,box-shadow] duration-150',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[hsl(var(--muted))]',
            error && 'border-[hsl(var(--destructive))] focus:shadow-[0_0_0_3px_hsl(var(--destructive)/0.1)]',
            className
          )}
          {...props}
        />
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
