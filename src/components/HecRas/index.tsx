/**
 * 🏗️ HEC-RAS Analysis Suite - Componente Principal
 *
 * Este es el componente principal que maneja toda la suite de análisis HEC-RAS.
 * Incluye navegación por tabs, gestión de estado y coordinación entre componentes.
 *
 * Estructura:
 * - Análisis: Carga, análisis, hidrograma y exportación VTK
 * - VTK Viewer: Visualización de archivos VTK exportados
 * - Cálculos Hidráulicos: Herramientas de cálculo adicionales
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { HecRasHeader } from './UI/HecRasHeader';
import { HecRasMenu } from './UI/HecRasMenu';
import { AnalysisTab } from './Logic/AnalysisTab';
import { VTKViewerTab } from './Logic/VTKViewerTab';
import { HydraulicCalculationsTab } from './Logic/HydraulicCalculationsTab';
import { SystemMonitor } from '@/components/ui/SystemMonitor';
import { SimpleAnalysisStatus } from '@/components/ui/SimpleAnalysisStatus';
// Removido SafeAreaLayout - usando layout simple

// 🎯 Tipos de datos para el estado global
export interface HecRasState {
  selectedHDFFile: string | null;
  selectedTerrainFile: string | null;
  hdfData: any;
  fileMetadata: any;
  isAnalyzing: boolean;
  exportedVTKFiles: string[];
  hydrographData: any;
  boundaryConditions: any; // Agregar condiciones de contorno reales
  manningValues: any; // Agregar valores de Manning calibrados
  meshInfo: any; // Agregar información de malla
  analysisSubTab: 'load' | 'analyze' | 'hydrograph' | 'export'; // Agregar estado del sub-tab
  analysisResults: {
    totalDatasets: number;
    timeSteps: number;
    flowAreas: number;
    boundaryConditions: number;
    cellCount: number;
    manningZones: number;
  } | null; // Agregar resultados del análisis al estado global
}

// 🎨 Tipos de tabs disponibles
export type HecRasTab = 'analysis' | 'vtk-viewer' | 'hydraulic-calculations';

interface HecRasProps {
  onNavigateHome: () => void;
  isLicensePanelCollapsed?: boolean;
}

/**
 * 🚀 Componente Principal HEC-RAS
 *
 * Maneja el estado global de la aplicación HEC-RAS y coordina
 * la comunicación entre todos los sub-componentes.
 */
export const HecRas: React.FC<HecRasProps> = ({
  onNavigateHome,
  isLicensePanelCollapsed = false,
}) => {
  // 📊 Estado global de la aplicación HEC-RAS
  const [activeTab, setActiveTab] = useState<HecRasTab>('analysis');
  const [hecRasState, setHecRasState] = useState<HecRasState>({
    selectedHDFFile: null,
    selectedTerrainFile: null,
    hdfData: null,
    fileMetadata: null,
    isAnalyzing: false,
    exportedVTKFiles: [],
    hydrographData: null,
    boundaryConditions: null, // Inicializar condiciones de contorno
    manningValues: null, // Inicializar valores de Manning
    meshInfo: null, // Inicializar información de malla
    analysisSubTab: 'load', // Inicializar el sub-tab
    analysisResults: null, // Inicializar resultados del análisis
  });

  /**
   * 🔄 Actualizar estado de HEC-RAS
   * Función helper para actualizar el estado de manera controlada
   */
  const updateHecRasState = (updates: Partial<HecRasState>) => {
    setHecRasState(prev => ({ ...prev, ...updates }));
  };

  /**
   * 🎯 Renderizar contenido del tab activo
   * Maneja la lógica de renderizado condicional para cada tab
   */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'analysis':
        return (
          <AnalysisTab state={hecRasState} updateState={updateHecRasState} />
        );
      case 'vtk-viewer':
        return (
          <VTKViewerTab state={hecRasState} updateState={updateHecRasState} />
        );
      case 'hydraulic-calculations':
        return (
          <HydraulicCalculationsTab
            state={hecRasState}
            updateState={updateHecRasState}
          />
        );
      default:
        return null;
    }
  };

  // Calcular posiciones basadas en el estado del panel de licencias
  // titlebar: 48px, license panel expandido: ~160px, menu: ~80px, status: ~60px, footer: 60px
  const menuTopPosition = isLicensePanelCollapsed ? '48px' : '208px';
  const contentPaddingTop = isLicensePanelCollapsed ? '120px' : '270px';
  const contentPaddingBottom = '120px'; // Espacio para status + footer

  return (
    <div className='w-full h-full relative bg-[#131414] flex flex-col'>
      {/* Menu fijo - posicionado dinámicamente */}
      <div
        className='fixed left-0 right-0 z-30 bg-[#131414]/98 backdrop-blur-md border-b border-white/10 transition-all duration-300 ease-in-out'
        style={{ top: menuTopPosition }}
      >
        <div className='py-3 sm:py-4'>
          <HecRasMenu
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onNavigateHome={onNavigateHome}
          />
        </div>
      </div>

      {/* Contenido principal - espacio ajustado dinámicamente */}
      <div
        className='w-full flex-1 overflow-y-auto overflow-x-hidden scrollbar-custom transition-all duration-300 ease-in-out'
        style={{
          paddingTop: contentPaddingTop,
          paddingBottom: contentPaddingBottom, // Espacio para status + footer
        }}
      >
        <main className='pt-1 pb-4 px-4 sm:px-6 md:px-8 min-h-full'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className='w-full h-full'
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Estado del Análisis - Integrado encima del footer */}
      <div className='fixed bottom-12 left-0 right-0 px-6 z-20'>
        <div className='flex justify-center'>
          <SimpleAnalysisStatus
            state={{
              selectedHDFFile: hecRasState.selectedHDFFile,
              selectedTerrainFile: hecRasState.selectedTerrainFile,
              hdfData: hecRasState.hdfData,
              isAnalyzing: hecRasState.isAnalyzing,
              exportedVTKFiles: hecRasState.exportedVTKFiles,
            }}
          />
        </div>
      </div>

      {/* Footer - Siempre al final de la página */}
      <footer className='fixed bottom-0 left-0 right-0 px-6 py-2 border-t border-white/5 bg-[#131414]/95 backdrop-blur-sm z-20'>
        <div className='flex items-center justify-between text-white/50 text-xs'>
          {/* Copyright y Versión - Izquierda */}
          <div className='flex items-center gap-3'>
            <p>
              &copy; 2025{' '}
              <span className='eflow-brand text-white'>eFlood²</span> -
              Herramienta de Análisis Hidráulico.
            </p>
            <span className='text-white/30 text-xs'>|</span>
            <span className='text-white/40 text-xs font-mono'>
              v0.1.0-alpha
            </span>
          </div>

          {/* Monitoreo y Redes Sociales - Derecha */}
          <div className='flex items-center gap-4'>
            {/* Monitoreo del Sistema */}
            <SystemMonitor />

            <span className='text-white/30 text-xs'>|</span>

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
    </div>
  );
};

export default HecRas;
