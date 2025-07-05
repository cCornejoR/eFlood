import * as React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  icon: LucideIcon | React.FC;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: MenuItem[];
  activeItem?: string;
  onItemClick?: (label: string) => void;
}

export const MenuBar = React.forwardRef<HTMLDivElement, MenuBarProps>(
  ({ className, items, activeItem, onItemClick, ...props }, ref) => {
    const { theme } = useTheme();
    const isDarkTheme = theme === 'dark';

    return (
      <nav
        ref={ref}
        className={cn(
          'p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden',
          className
        )}
        {...props}
      >
        <motion.div
          className={`absolute -inset-2 bg-gradient-radial from-transparent ${
            isDarkTheme
              ? 'via-blue-400/30 via-30% via-purple-400/30 via-60% via-red-400/30 via-90%'
              : 'via-blue-400/20 via-30% via-purple-400/20 via-60% via-red-400/20 via-90%'
          } to-transparent rounded-3xl z-0 pointer-events-none`}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
        <ul className='flex items-center gap-2 relative z-10'>
          {items.map(item => {
            const Icon = item.icon;
            const isActive = item.label === activeItem;

            return (
              <motion.li key={item.label} className='relative'>
                <button
                  onClick={() => onItemClick?.(item.label)}
                  className='block w-full'
                >
                  <motion.div
                    className='block rounded-xl overflow-visible group relative'
                    style={{ perspective: '600px' }}
                    whileHover='hover'
                    initial='initial'
                  >
                    <motion.div
                      className='absolute inset-0 z-0 pointer-events-none'
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isActive
                          ? { opacity: 1, scale: 2 }
                          : { opacity: 0, scale: 0.8 }
                      }
                      style={{
                        background: item.gradient,
                        borderRadius: '16px',
                      }}
                    />
                    <motion.div
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent transition-colors rounded-xl',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      initial={{ rotateX: 0, opacity: 1 }}
                      whileHover={{ rotateX: -90, opacity: 0 }}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center bottom',
                      }}
                    >
                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isActive ? item.iconColor : 'text-foreground',
                          `group-hover:${item.iconColor}`
                        )}
                      >
                        <Icon className='h-5 w-5' />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                    <motion.div
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent transition-colors rounded-xl',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      initial={{ rotateX: 90, opacity: 0 }}
                      whileHover={{ rotateX: 0, opacity: 1 }}
                      style={{
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'center top',
                        rotateX: 90,
                      }}
                    >
                      <span
                        className={cn(
                          'transition-colors duration-300',
                          isActive ? item.iconColor : 'text-foreground',
                          `group-hover:${item.iconColor}`
                        )}
                      >
                        <Icon className='h-5 w-5' />
                      </span>
                      <span>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    );
  }
);

MenuBar.displayName = 'MenuBar';
