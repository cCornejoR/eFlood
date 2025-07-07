import React from 'react';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'relative group border text-foreground text-center rounded-full transition-all duration-200 inline-flex items-center justify-center gap-2 font-medium',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 hover:from-blue-500/40 hover:to-cyan-400/40 border-blue-400/20 hover:border-blue-400/40 text-white',
        ghost:
          'border-transparent bg-transparent hover:border-white/20 hover:bg-white/5 text-white/80 hover:text-white',
      },
      size: {
        default: 'px-6 py-2 text-sm',
        sm: 'px-4 py-1.5 text-xs',
        lg: 'px-8 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  neon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, neon = true, size, variant, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {/* Efecto neon superior */}
        <span
          className={cn(
            'absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-blue-400 to-transparent hidden',
            neon && 'block'
          )}
        />

        {children}

        {/* Efecto neon inferior */}
        <span
          className={cn(
            'absolute group-hover:opacity-30 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-blue-400 to-transparent hidden',
            neon && 'block'
          )}
        />
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
