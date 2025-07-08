/**
 * 🎛️ Analyzer+ Menu Component
 *
 * Menu principal de navegación con diseño minimalista
 * Adaptado específicamente para la suite Analyzer+ con cinco secciones principales:
 * - Proyecto: Análisis completo del proyecto y metadata
 * - Manning: Tablas interactivas de valores de rugosidad
 * - Malla: Datos de geometría y coordenadas
 * - Hidrogramas: Visualización avanzada de series temporales
 * - Exportar: Gestión flexible de exportaciones
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TreePine,
  Grid3X3,
  TrendingUp,
  Download,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalyzerPlusSection } from '../index';

// 🎨 Definición de items del menu principal
interface MenuItem {
  id: AnalyzerPlusSection;
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  gradient: string;
  iconColor: string;
}

// 🎯 Configuración de secciones principales
const menuItems: MenuItem[] = [
  {
    id: 'project',
    icon: FileText,
    label: 'Proyecto',
    description: 'Metadata y resumen ejecutivo del análisis',
    gradient:
      'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)',
    iconColor: 'text-blue-500',
  },
  {
    id: 'manning',
    icon: TreePine,
    label: 'Manning',
    description: 'Valores de rugosidad y calibración',
    gradient:
      'radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)',
    iconColor: 'text-green-500',
  },
  {
    id: 'mesh',
    icon: Grid3X3,
    label: 'Malla',
    description: 'Geometría, coordenadas y datos de celdas',
    gradient:
      'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)',
    iconColor: 'text-purple-500',
  },
  {
    id: 'hydrograph',
    icon: TrendingUp,
    label: 'Hidrogramas',
    description: 'Series temporales y análisis de flujo',
    gradient:
      'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)',
    iconColor: 'text-orange-500',
  },
  {
    id: 'export',
    icon: Download,
    label: 'Exportar',
    description: 'Gestión de exportaciones y formatos',
    gradient:
      'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(219,39,119,0.06) 50%, rgba(190,24,93,0) 100%)',
    iconColor: 'text-pink-500',
  },
];

// 🎨 Variantes de animación para el brillo del nav
const navGlowVariants = {
  initial: { opacity: 0 },
  hover: { opacity: 1 },
};

// 🎨 Variantes de animación para efectos 3D
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

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// 🎯 Props del componente
interface AnalyzerPlusMenuProps {
  activeSection: AnalyzerPlusSection;
  onSectionChange: (section: AnalyzerPlusSection) => void;
  visibleSections: Set<AnalyzerPlusSection>;
  onNavigateHome: () => void;
}

/**
 * 🎛️ Menu Principal Analyzer+
 *
 * Componente de navegación principal con gradientes radiales y animaciones
 * inspirado en el diseño original del GlowMenu
 */
export const AnalyzerPlusMenu: React.FC<AnalyzerPlusMenuProps> = ({
  activeSection,
  onSectionChange,
  visibleSections,
  onNavigateHome,
}) => {
  return (
    <div className='sticky top-0 z-50 flex justify-center w-full px-4 py-2 bg-[#131414]/95 backdrop-blur-sm border-b border-white/5'>
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
          {/* Botón Home */}
          <button
            onClick={onNavigateHome}
            className='flex items-center justify-center w-10 h-10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200'
            title='Volver al Inicio'
          >
            <Home className='h-4 w-4' />
          </button>

          {/* Separador */}
          <div className='w-px h-6 bg-white/20 mx-1'></div>

          {/* Menu principal */}
          <ul className='flex items-center gap-0.5 sm:gap-1'>
            {menuItems
              .filter(item => visibleSections.has(item.id))
              .map(item => {
                const Icon = item.icon;
                const isActive = item.id === activeSection;

                return (
                  <motion.li key={item.id} className='relative'>
                    <button
                      onClick={() => onSectionChange(item.id)}
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
                          <span className='hidden sm:inline text-sm sm:text-base font-medium'>
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
                          <span className='hidden sm:inline text-sm sm:text-base font-medium'>
                            {item.label}
                          </span>
                        </motion.div>
                      </motion.div>
                    </button>
                  </motion.li>
                );
              })}
          </ul>
        </div>
      </motion.nav>
    </div>
  );
};
