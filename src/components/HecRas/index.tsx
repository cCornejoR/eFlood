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
import { HecRasHeader } from './UI/HecRasHeader';
import { HecRasMenu } from './UI/HecRasMenu';
import { AnalysisTab } from './Logic/AnalysisTab';
import { VTKViewerTab } from './Logic/VTKViewerTab';
import { HydraulicCalculationsTab } from './Logic/HydraulicCalculationsTab';
import { SafeAreaLayout } from '../ui/SafeArea';

// 🎯 Tipos de datos para el estado global
export interface HecRasState {
  selectedHDFFile: string | null;
  selectedTerrainFile: string | null;
  hdfData: any;
  fileMetadata: any;
  isAnalyzing: boolean;
  exportedVTKFiles: string[];
  hydrographData: any;
}

// 🎨 Tipos de tabs disponibles
export type HecRasTab = 'analysis' | 'vtk-viewer' | 'hydraulic-calculations';

interface HecRasProps {
  onNavigateHome: () => void;
}

/**
 * 🚀 Componente Principal HEC-RAS
 *
 * Maneja el estado global de la aplicación HEC-RAS y coordina
 * la comunicación entre todos los sub-componentes.
 */
export const HecRas: React.FC<HecRasProps> = ({
  onNavigateHome,
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

  return (
    <div className='w-full h-full relative bg-[#131414]'>
      {/* CAPA DE FONDO - Sin márgenes para líneas decorativas futuras */}
      <div className='background-layer bg-[#131414]'>
        {/* Aquí se pueden agregar elementos de fondo decorativos */}
      </div>

      {/* CAPA DE CONTENIDO - Con márgenes apropiados */}
      <div className='content-layer h-full'>
        <SafeAreaLayout
          fixedHeader={
            <div className='space-y-0 w-full'>
              {/* 🎨 Header con navegación */}
              <div>
                <HecRasHeader
                  onNavigateHome={onNavigateHome}
                />
              </div>

              {/* 🎛️ Menu de navegación principal - FIJO */}
              <div className='py-3 sm:py-4 border-b border-white/10 bg-[#131414]/98 backdrop-blur-md'>
                <HecRasMenu activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            </div>
          }
          headerHeight={140} // Altura ajustada para header + menu responsive
          className='bg-transparent' // Transparente para mostrar el fondo
        >
      {/* 📱 Contenido principal con animaciones - Sin padding horizontal (SafeArea lo maneja) */}
      <main className='py-4 sm:py-6 md:py-8'>
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
            className='w-full'
          >
            {renderActiveTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 🦶 Footer fijo al fondo */}
      <footer className='px-6 py-3 border-t border-white/5 bg-[#131414]/80 backdrop-blur-sm'>
        <div className='text-center text-white/50 text-xs'>
          <p>
            &copy; 2025 <span className='eflow-brand text-white'>eFlood²</span>{' '}
            - Herramienta de Análisis Hidráulico.
          </p>
        </div>
      </footer>
    </SafeAreaLayout>
      </div>
    </div>
  );
};

export default HecRas;
