/**
 * Footer principal para paginas de eFlood
*/


import React from 'react';
import { SystemMonitor } from '@/components/ui/SystemMonitor';

const Footer: React.FC = () => (
  <footer className='relative px-2 sm:px-6 py-3 border-t border-white/5 bg-[#131414] mt-auto'>
    <div className='flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-between text-white/50 text-xs gap-2 sm:gap-0'>
      {/* Copyright y Versión - Izquierda */}
      <div className='flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left'>
        <p className='break-all'>
          &copy; 2025{' '}
          <span className='eflow-brand text-white'>eFlood²</span> -
          Herramienta de Análisis Hidráulico.
        </p>
        <span className='hidden sm:inline text-white/30 text-xs'>|</span>
        <span className='text-white/40 text-xs font-mono'>
          v0.1.0-alpha
        </span>
      </div>

      {/* Monitoreo y Redes Sociales - Derecha */}
      <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4'>
        {/* Monitoreo del Sistema */}
        <SystemMonitor />

        <span className='hidden sm:inline text-white/30 text-xs'>|</span>

        {/* Redes Sociales - Iconos como estaban */}
        <div className='flex items-center gap-3'>
          {/* GitHub */}
          <a
            href='https://github.com/cCornejoR/eFlood'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white/50 hover:text-white transition-colors duration-200'
            title='GitHub'
          >
            <svg
              className='w-4 h-4'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href='https://www.linkedin.com/in/crhistian-cornejo/'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white/50 hover:text-white transition-colors duration-200'
            title='LinkedIn'
          >
            <svg
              className='w-4 h-4'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
            </svg>
          </a>

          {/* Email */}
          <a
            href='mailto:crhistian.cornejo03@gmail.com'
            className='text-white/50 hover:text-white transition-colors duration-200'
            title='Contacto'
          >
            <svg
              className='w-4 h-4'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.749L12 10.724l9.615-6.903h.749c.904 0 1.636.732 1.636 1.636z' />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
