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
import { toast } from 'sonner';
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
   * 🔒 Determinar si una pestaña está habilitada según el progreso
   */
  const isTabEnabled = (tabId: AnalysisSubTab): boolean => {
    switch (tabId) {
      case 'load':
        return true; // Siempre habilitado
      case 'analyze':
        return !!state.selectedHDFFile; // Requiere archivo HDF cargado
      case 'hydrograph':
        return !!state.hdfData; // Requiere análisis completado
      case 'export':
        return !!state.hdfData; // Requiere análisis completado
      default:
        return false;
    }
  };

  /**
   * 🎯 Manejar clic en pestaña con validación de progreso
   */
  const handleTabClick = (tabId: AnalysisSubTab) => {
    if (!isTabEnabled(tabId)) {
      // Mostrar mensaje de qué se necesita para habilitar la pestaña
      const requirements = getTabRequirements(tabId);
      const tabName =
        analysisSubTabs.find(tab => tab.id === tabId)?.label || tabId;

      toast.warning(`${tabName} no disponible`, {
        description: requirements,
        duration: 3000,
      });
      return;
    }
    setActiveSubTab(tabId);
  };

  /**
   * 📋 Obtener requisitos para habilitar una pestaña
   */
  const getTabRequirements = (tabId: AnalysisSubTab): string => {
    switch (tabId) {
      case 'analyze':
        return 'Primero debes cargar un archivo HDF en la pestaña "Cargar Datos"';
      case 'hydrograph':
        return 'Primero debes completar el análisis de datos en la pestaña "Analizar"';
      case 'export':
        return 'Primero debes completar el análisis de datos en la pestaña "Analizar"';
      default:
        return '';
    }
  };

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
            const isEnabled = isTabEnabled(subTab.id);

            return (
              <motion.button
                key={subTab.id}
                onClick={() => handleTabClick(subTab.id)}
                disabled={!isEnabled}
                className={cn(
                  'flex select-none items-center rounded-xl px-3 py-1.5 text-sm font-medium outline-none transition-all duration-200 relative',
                  isEnabled
                    ? isActive
                      ? 'bg-white/15 text-white shadow-sm cursor-default'
                      : 'text-white/60 hover:bg-white/10 hover:text-white cursor-pointer'
                    : 'text-white/30 cursor-not-allowed opacity-50'
                )}
                whileHover={isEnabled ? { scale: 1.02 } : {}}
                whileTap={isEnabled ? { scale: 0.98 } : {}}
                title={
                  isEnabled ? subTab.description : getTabRequirements(subTab.id)
                }
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
                    className={cn(
                      'h-4 w-4',
                      isActive && isEnabled ? subTab.color : '',
                      !isEnabled ? 'opacity-50' : ''
                    )}
                  />
                  <span>{subTab.label}</span>

                  {/* 🎯 Indicadores de estado */}
                  {isEnabled ? (
                    // Indicador de completado (verde)
                    ((subTab.id === 'load' && state.selectedHDFFile) ||
                      (subTab.id === 'analyze' && state.hdfData) ||
                      (subTab.id === 'hydrograph' && state.hydrographData) ||
                      (subTab.id === 'export' &&
                        state.exportedVTKFiles.length > 0)) && (
                      <div className='w-1.5 h-1.5 bg-green-400 rounded-full ml-1' />
                    )
                  ) : (
                    // Indicador de bloqueado (candado)
                    <div className='w-3 h-3 ml-1 opacity-50'>
                      <svg
                        viewBox='0 0 12 12'
                        fill='currentColor'
                        className='w-full h-full'
                      >
                        <path d='M3 5V3.5C3 2.12 4.12 1 5.5 1S8 2.12 8 3.5V5h.5c.28 0 .5.22.5.5v4c0 .28-.22.5-.5.5h-6c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5H3zm1 0h4V3.5C8 2.67 7.33 2 6.5 2S5 2.67 5 3.5V5z' />
                      </svg>
                    </div>
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
