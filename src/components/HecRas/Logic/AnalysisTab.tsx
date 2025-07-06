/**
 * 📊 Analysis Tab - Componente Principal de Análisis HEC-RAS
 *
 * Este componente maneja todo el flujo de análisis de datos HEC-RAS:
 * - Carga de archivos HDF y terreno
 * - Análisis automático de datos
 * - Visualización de hidrogramas
 * - Exportación a formato VTK
 *
 * Incluye sub-navegación con tabs específicos para cada función
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, TrendingUp, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasState } from '../index';
import { DataLoader } from './Analysis/DataLoader';
import { DataAnalyzer } from './Analysis/DataAnalyzer';
import { HydrographViewer } from './Analysis/HydrographViewer';
import { VTKExporter } from './Analysis/VTKExporter';

// 🎯 Sub-tabs del módulo de análisis
type AnalysisSubTab = 'load' | 'analyze' | 'hydrograph' | 'export';

// 🎨 Configuración de sub-tabs
interface AnalysisSubTabItem {
  id: AnalysisSubTab;
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  color: string;
}

const analysisSubTabs: AnalysisSubTabItem[] = [
  {
    id: 'load',
    icon: Upload,
    label: 'Cargar Datos',
    description: 'Carga archivos HDF y terreno',
    color: 'text-blue-400',
  },
  {
    id: 'analyze',
    icon: Play,
    label: 'Analizar',
    description: 'Procesa y analiza los datos cargados',
    color: 'text-green-400',
  },
  {
    id: 'hydrograph',
    icon: TrendingUp,
    label: 'Hidrograma',
    description: 'Visualiza hidrogramas generados',
    color: 'text-yellow-400',
  },
  {
    id: 'export',
    icon: Download,
    label: 'Exportar VTK',
    description: 'Exporta resultados a formato VTK',
    color: 'text-purple-400',
  },
];

interface AnalysisTabProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

/**
 * 📊 Tab de Análisis Principal
 *
 * Coordina todos los sub-componentes de análisis y maneja
 * la navegación entre las diferentes etapas del proceso
 */
export const AnalysisTab: React.FC<AnalysisTabProps> = ({
  state,
  updateState,
}) => {
  // 🎯 Usar el estado del sub-tab desde el componente padre
  const activeSubTab = state.analysisSubTab;
  const setActiveSubTab = (subTab: AnalysisSubTab) => {
    updateState({ analysisSubTab: subTab });
  };

  // 🔄 Mantener el sub-tab correcto basado en los datos disponibles
  useEffect(() => {
    // NO auto-navegar automáticamente - dejar que el usuario controle la navegación
    // El análisis se iniciará solo cuando el usuario haga clic en "Continuar al Análisis"
  }, [state.selectedHDFFile, state.hdfData, activeSubTab]);

  /**
   * 🎯 Renderizar contenido del sub-tab activo
   */
  const renderActiveSubTab = () => {
    switch (activeSubTab) {
      case 'load':
        return (
          <DataLoader
            state={state}
            updateState={updateState}
            onDataLoaded={() => setActiveSubTab('analyze')}
          />
        );
      case 'analyze':
        return <DataAnalyzer state={state} updateState={updateState} />;
      case 'hydrograph':
        return <HydrographViewer state={state} updateState={updateState} />;
      case 'export':
        return <VTKExporter state={state} updateState={updateState} />;
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      {/* 🎛️ Sub-navegación de análisis - centrado y elevado */}
      <div className='w-full flex justify-center -mt-2'>
        <nav className='flex h-10 items-center space-x-1 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-1 w-fit'>
          {analysisSubTabs.map(subTab => {
            const Icon = subTab.icon;
            const isActive = subTab.id === activeSubTab;

            return (
              <motion.button
                key={subTab.id}
                onClick={() => setActiveSubTab(subTab.id)}
                className={cn(
                  'flex cursor-default select-none items-center rounded-xl px-3 py-1.5 text-sm font-medium outline-none transition-all duration-200 relative',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title={subTab.description}
              >
                {/* Indicador activo con layoutId para transición suave */}
                {isActive && (
                  <motion.div
                    className='absolute inset-0 bg-white/15 rounded-xl border border-white/30'
                    layoutId='activeSubTab'
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Contenido del botón */}
                <div className='relative z-10 flex items-center gap-2'>
                  <Icon
                    className={cn('h-4 w-4', isActive ? subTab.color : '')}
                  />
                  <span>{subTab.label}</span>

                  {/* 🎯 Indicador de estado completado */}
                  {((subTab.id === 'load' && state.selectedHDFFile) ||
                    (subTab.id === 'analyze' && state.hdfData) ||
                    (subTab.id === 'hydrograph' && state.hydrographData) ||
                    (subTab.id === 'export' &&
                      state.exportedVTKFiles.length > 0)) && (
                    <div className='w-1.5 h-1.5 bg-green-400 rounded-full ml-1' />
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* 📱 Contenido del sub-tab activo */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className='min-h-[400px]'
        >
          {renderActiveSubTab()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnalysisTab;
