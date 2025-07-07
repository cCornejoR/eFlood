import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark overflow-hidden backdrop-blur-sm';

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-3',
    lg: 'px-8 py-4 text-lg gap-4',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-600/80 to-blue-700/80 text-white border border-blue-400/30 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-400 shadow-lg shadow-blue-500/25',
    secondary:
      'bg-gradient-to-r from-gray-600/80 to-gray-700/80 text-white border border-gray-400/30 hover:from-gray-600 hover:to-gray-700 focus:ring-gray-400 shadow-lg shadow-gray-500/25',
    success:
      'bg-gradient-to-r from-green-600/80 to-green-700/80 text-white border border-green-400/30 hover:from-green-600 hover:to-green-700 focus:ring-green-400 shadow-lg shadow-green-500/25',
    gradient:
      'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 text-white border border-blue-400/20 hover:from-blue-500/40 hover:to-cyan-400/40 focus:ring-blue-400 shadow-lg shadow-blue-500/25',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        (disabled || loading) && disabledClasses,
        'group hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Efecto de brillo animado */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000' />

      {/* Contenido del botón */}
      <div className='relative z-10 flex items-center justify-center gap-inherit'>
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className='w-5 h-5' />
          </motion.div>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {icon}
              </motion.div>
            )}

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              {children}
            </motion.span>

            {icon && iconPosition === 'right' && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {icon}
              </motion.div>
            )}
          </>
        )}
      </div>
    </button>
  );
};

export default ModernButton;
