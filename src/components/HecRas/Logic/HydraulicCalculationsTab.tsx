/**
 * 🚧 Hydraulic Calculations Tab - Work In Progress
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Clock, Wrench } from 'lucide-react';
import { HecRasState } from '@/components/HecRas/index';

interface HydraulicCalculationsTabProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

/**
 * 🚧 Work In Progress Component
 */
export const HydraulicCalculationsTab: React.FC<
  HydraulicCalculationsTabProps
> = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] space-y-8'>
      {/* Construction Icon Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative'
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Construction className='h-24 w-24 text-yellow-400/80' />
        </motion.div>

        {/* Rotating gear */}
        <motion.div
          className='absolute -top-2 -right-2'
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Wrench className='h-8 w-8 text-blue-400/60' />
        </motion.div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='text-center space-y-4'
      >
        <h2 className='text-3xl font-bold text-white'>Cálculos Hidráulicos</h2>

        <div className='flex items-center justify-center gap-2 text-yellow-400'>
          <Clock className='h-5 w-5' />
          <span className='text-lg font-medium'>Work In Progress</span>
        </div>

        <p className='text-white/60 text-lg max-w-md mx-auto leading-relaxed'>
          Esta funcionalidad está siendo desarrollada y estará disponible en
          futuras actualizaciones.
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className='flex items-center gap-2'
      >
        <div className='flex gap-1'>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className='w-2 h-2 bg-blue-400/40 rounded-full'
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        <span className='text-white/40 text-sm ml-2'>En desarrollo...</span>
      </motion.div>

      {/* Roadmap reference */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className='bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 max-w-md'
      >
        <p className='text-blue-300/80 text-sm text-center'>
          Consulta el{' '}
          <span className='font-semibold text-blue-300'>roadmap</span> del
          proyecto para más información sobre el desarrollo de esta
          funcionalidad.
        </p>
      </motion.div>
    </div>
  );
};

export default HydraulicCalculationsTab;
