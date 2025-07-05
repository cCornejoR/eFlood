import { cn } from '../../utils/cn';
import { ElementType, ComponentPropsWithoutRef } from 'react';

interface StarBorderProps<T extends ElementType> {
  as?: T;
  color?: string;
  speed?: string;
  className?: string;
  children: React.ReactNode;
}

export function StarBorder<T extends ElementType = 'button'>({
  as,
  className,
  color,
  speed = '6s',
  children,
  ...props
}: StarBorderProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || 'button';
  const defaultColor = color || 'rgba(59, 130, 246, 0.8)';

  return (
    <Component
      className={cn(
        'relative inline-block py-[1px] overflow-hidden rounded-[20px]',
        className
      )}
      {...props}
    >
      <div
        className='absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0'
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
          opacity: 0.8,
        }}
      />
      <div
        className='absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0'
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
          opacity: 0.8,
        }}
      />
      <div
        className={cn(
          'relative z-10 border text-white text-center text-base py-4 px-6 rounded-[20px]',
          'border-white/20',
          'hover:transition-all duration-300'
        )}
        style={{
          backgroundColor: 'rgba(19, 20, 20, 0.7)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(25, 26, 26, 0.8)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(19, 20, 20, 0.7)';
        }}
      >
        {children}
      </div>
    </Component>
  );
}
