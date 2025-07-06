/**
 * 🎨 HEC-RAS Header Component
 *
 * Header reutilizable para la suite HEC-RAS que incluye:
 * - Logo y branding de eFlood²
 * - Botón de navegación al inicio
 * - Información contextual del módulo activo
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { HighlightMultiline } from '@/components/ui/highlight-multiline';
import { IconButton } from '@/components/ui/IconButton';
import logoImage from '@/assets/logo.svg';

interface HecRasHeaderProps {
  onNavigateHome: () => void;
}

/**
 * 🏠 Header Component para HEC-RAS
 *
 * Proporciona navegación consistente y branding para toda la suite HEC-RAS
 */
export const HecRasHeader: React.FC<HecRasHeaderProps> = ({
  onNavigateHome,
}) => {
  return (
    <header className='bg-[#131414] text-white border-b border-white/10 backdrop-blur-xl'>
      <div className='flex items-center justify-between px-6 py-4'>
        {/* 🎯 Logo y título */}
        <motion.div
          className='flex flex-col items-start'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='flex items-center gap-3'>
            <img
              src={logoImage}
              alt='eFlood² Logo'
              className='h-8 w-8 object-contain'
            />
            <h1 className='text-2xl font-bold text-white'>
              <span className='eflow-brand'>eFlood²</span>{' '}
              <HighlightMultiline
                text='Analyzer'
                words={['Analyzer']}
                inView={true}
                className='inline-block'
              />
            </h1>
          </div>
          <p className='text-gray-400 text-xs font-medium tracking-wide ml-0 pl-0'>
            Análisis Completo de Modelos Hidráulicos 2D
          </p>
        </motion.div>

        {/* 🏠 Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='flex items-center gap-2'
        >
          {/* Botón de inicio */}
          <IconButton
            onClick={onNavigateHome}
            variant='ghost'
            size='default'
            icon={<Home className='h-5 w-5' />}
            tooltip='Volver al Inicio'
            animate={false}
          />
        </motion.div>
      </div>
    </header>
  );
};

export default HecRasHeader;
