/**
 * 🎛️ HEC-RAS Menu Component
 *
 * Menu principal de navegación con diseño minimalista
 * Adaptado específicamente para la suite HEC-RAS con tres tabs principales:
 * - Análisis: Procesamiento completo de datos HEC-RAS
 * - VTK Viewer: Visualización de archivos VTK exportados
 * - Cálculos Hidráulicos: Herramientas de cálculo adicionales
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, Calculator, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasTab } from '@/components/HecRas/index';
import { IconButton } from '@/components/ui/IconButton';

// 🎨 Definición de items del menu principal
interface MenuItem {
  id: HecRasTab;
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  gradient: string;
  iconColor: string;
}

// 🎯 Configuración de tabs principales
const menuItems: MenuItem[] = [
  {
    id: 'analysis',
    icon: BarChart3,
    label: 'Análisis',
    description: 'Carga, análisis y exportación de datos HEC-RAS',
    gradient:
      'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
  },
  {
    id: 'vtk-viewer',
    icon: Eye,
    label: 'VTK Viewer',
    description: 'Visualización 3D de archivos VTK exportados',
    gradient:
      'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
    iconColor: 'text-green-500',
  },
  {
    id: 'hydraulic-calculations',
    icon: Calculator,
    label: 'Cálculos Hidráulicos',
    description: 'Herramientas de cálculo y análisis hidráulico',
    gradient:
      'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
  },
];

interface HecRasMenuProps {
  activeTab: HecRasTab;
  onTabChange: (tab: HecRasTab) => void;
  onNavigateHome: () => void;
}

// 🎨 Variantes de animación del código original
const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
  },
};

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
};

/**
 * 🎛️ Menu Principal HEC-RAS
 *
 * Componente de navegación principal con gradientes radiales y animaciones
 * inspirado en el diseño original del GlowMenu
 */
export const HecRasMenu: React.FC<HecRasMenuProps> = ({
  activeTab,
  onTabChange,
  onNavigateHome,
}) => {
  return (
    <div className='flex justify-center w-full px-4'>
      <motion.nav
        className='p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-[#3a3a3c] shadow-lg relative overflow-hidden inline-flex'
        initial='initial'
        whileHover='hover'
      >
        <motion.div
          className='absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/20 via-30% via-cyan-400/20 via-60% via-blue-500/20 via-90% to-transparent rounded-3xl z-0 pointer-events-none'
          variants={navGlowVariants}
        />
        <div className='flex items-center gap-1 sm:gap-2 relative z-10 w-fit mx-auto'>
          {/* Botón de navegación al inicio */}
          <IconButton
            onClick={onNavigateHome}
            variant='ghost'
            size='default'
            icon={<Home className='h-4 w-4' />}
            tooltip='Volver al Inicio'
            animate={false}
          />

          {/* Separador visual */}
          <div className='w-px h-6 bg-white/20'></div>

          {/* Menu principal */}
          <ul className='flex items-center gap-0.5 sm:gap-1'>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;

            return (
              <motion.li key={item.id} className='relative'>
                <button
                  onClick={() => onTabChange(item.id)}
                  className='block w-full'
                  title={item.description}
                >
                  <motion.div
                    className='block rounded-xl overflow-visible group relative'
                    style={{ perspective: '600px' }}
                    whileHover='hover'
                    initial='initial'
                  >
                    <motion.div
                      className='absolute inset-0 z-0 pointer-events-none'
                      variants={glowVariants}
                      animate={isActive ? 'hover' : 'initial'}
                      style={{
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                        borderRadius: '16px',
                      }}
                    />
                    <motion.div
                      className={cn(
                        'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 relative z-10 bg-transparent transition-colors rounded-xl',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
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
                        <Icon className='h-4 w-4 sm:h-5 sm:w-5' />
                      </span>
                      <span className='text-sm sm:text-base font-medium'>
                        {item.label}
                      </span>
                    </motion.div>
                    <motion.div
                      className={cn(
                        'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 absolute inset-0 z-0 bg-transparent transition-colors rounded-xl pointer-events-none',
                        isActive
                          ? 'text-foreground'
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                      variants={backVariants}
                      transition={sharedTransition}
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
                        <Icon className='h-4 w-4 sm:h-5 sm:w-5' />
                      </span>
                      <span className='text-sm sm:text-base font-medium'>{item.label}</span>
                    </motion.div>
                  </motion.div>
                </button>
              </motion.li>
            );
          })}
          </ul>

          {/* Espacio para balance visual - reducido */}
          <div className='w-6'></div>
        </div>
      </motion.nav>
    </div>
  );
};

export default HecRasMenu;
