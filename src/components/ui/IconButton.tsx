import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const iconButtonVariants = cva(
  'relative group inline-flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 hover:from-blue-500/40 hover:to-cyan-400/40 border border-blue-400/20 hover:border-blue-400/40 text-white',
        ghost:
          'border border-transparent bg-transparent hover:border-white/20 hover:bg-white/5 text-white/80 hover:text-white',
        minimal:
          'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white',
      },
      size: {
        sm: 'w-8 h-8 rounded-lg',
        default: 'w-10 h-10 rounded-xl',
        lg: 'w-12 h-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
  animate?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      tooltip,
      animate = true,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonContent = (
      <>
        {/* Efecto de hover con bordes redondeados */}
        <div className='absolute inset-0 rounded-[inherit] bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Contenido del icono */}
        <div className='relative z-10 flex items-center justify-center'>
          {icon}
        </div>
      </>
    );

    if (animate) {
      return (
        <motion.button
          className={cn(iconButtonVariants({ variant, size }), className)}
          ref={ref}
          title={tooltip}
          onClick={onClick}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {buttonContent}
        </motion.button>
      );
    }

    return (
      <button
        className={cn(iconButtonVariants({ variant, size }), className)}
        ref={ref}
        title={tooltip}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
