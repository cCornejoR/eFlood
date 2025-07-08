/**
 * 🔬 Analyzer+ Suite - Componente Principal
 *
 * Este es el componente principal que maneja toda la suite de análisis avanzado.
 * Incluye navegación por secciones, gestión de estado y coordinación entre componentes.
 *
 * Estructura:
 * - Análisis del Proyecto: Metadata y resumen ejecutivo
 * - Análisis de Manning: Tablas interactivas de valores de rugosidad
 * - Análisis de Malla: Datos de geometría y coordenadas
 * - Análisis de Hidrogramas: Visualización avanzada de series temporales
 * - Gestor de Exportación: Exportación flexible de resultados
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyzerPlusMenu } from './UI/AnalyzerPlusMenu';
import { ProjectAnalysisSection } from './Logic/ProjectAnalysis/ProjectAnalysisSection';
import { ManningAnalysisSection } from './Logic/ManningAnalysis/ManningAnalysisSection';
import { MeshAnalysisSection } from './Logic/MeshAnalysis/MeshAnalysisSection';
import { HydrographAnalysisSection } from './Logic/HydrographAnalysis/HydrographAnalysisSection';
import { ExportManagerSection } from './Logic/ExportManager/ExportManagerSection';
import Footer from '@/components/ui/Footer';
// import { SimpleAnalysisStatus } from '@/components/ui/SimpleAnalysisStatus'; // Temporalmente deshabilitado

// 🎯 Tipos de secciones disponibles en Analyzer+
export type AnalyzerPlusSection =
  | 'project'
  | 'manning'
  | 'mesh'
  | 'hydrograph'
  | 'export';

// 🎯 Tipos de datos para el estado global de Analyzer+
export interface AnalyzerPlusState {
  selectedHDFFile: string | null;
  selectedTerrainFile: string | null;

  // Datos del análisis completo
  projectMetadata: any;
  meshInfo: any;
  manningValues: any;
  hydrographData: any;
  timeSeriesData: any;

  // Estados de carga
  isLoadingProject: boolean;
  isLoadingManning: boolean;
  isLoadingMesh: boolean;
  isLoadingHydrograph: boolean;

  // Configuración de interfaz
  visibleSections: Set<AnalyzerPlusSection>;
  activeSection: AnalyzerPlusSection;

  // Resultados de análisis
  analysisResults: {
    projectSummary?: any;
    manningAnalysis?: any;
    meshAnalysis?: any;
    hydrographAnalysis?: any;
    // Datos específicos del análisis
    totalDatasets?: number;
    timeSteps?: number;
    flowAreas?: number;
    boundaryConditions?: number;
    cellCount?: number;
    manningZones?: number;
  } | null;

  // Estado de exportación
  exportConfig: {
    selectedSections: AnalyzerPlusSection[];
    format: 'csv' | 'json' | 'excel';
    includeMetadata: boolean;
  };
}

// 🎯 Props del componente principal
interface AnalyzerPlusProps {
  onNavigateHome: () => void;
  isLicensePanelCollapsed?: boolean;
}

/**
 * 🔬 Componente Principal Analyzer+
 *
 * Maneja el estado global de la aplicación Analyzer+ y coordina
 * la comunicación entre todos los sub-componentes especializados.
 */
export const AnalyzerPlus: React.FC<AnalyzerPlusProps> = ({
  onNavigateHome,
  isLicensePanelCollapsed = false,
}) => {
  // 📊 Estado global de la aplicación Analyzer+
  const [activeSection, setActiveSection] =
    useState<AnalyzerPlusSection>('project');
  const [analyzerState, setAnalyzerState] = useState<AnalyzerPlusState>({
    selectedHDFFile: null,
    selectedTerrainFile: null,

    // Datos del análisis
    projectMetadata: null,
    meshInfo: null,
    manningValues: null,
    hydrographData: null,
    timeSeriesData: null,

    // Estados de carga
    isLoadingProject: false,
    isLoadingManning: false,
    isLoadingMesh: false,
    isLoadingHydrograph: false,

    // Configuración de interfaz
    visibleSections: new Set([
      'project',
      'manning',
      'mesh',
      'hydrograph',
      'export',
    ]),
    activeSection: 'project',

    // Resultados
    analysisResults: null,

    // Configuración de exportación
    exportConfig: {
      selectedSections: ['project'],
      format: 'json',
      includeMetadata: true,
    },
  });

  // 🔄 Función para actualizar el estado global
  const updateAnalyzerState = (updates: Partial<AnalyzerPlusState>) => {
    setAnalyzerState(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // 🎯 Función para cambiar de sección
  const handleSectionChange = (section: AnalyzerPlusSection) => {
    setActiveSection(section);
    updateAnalyzerState({ activeSection: section });
  };

  // 🎨 Renderizar la sección activa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'project':
        return (
          <ProjectAnalysisSection
            state={analyzerState}
            updateState={updateAnalyzerState}
          />
        );
      case 'manning':
        return (
          <ManningAnalysisSection
            state={analyzerState}
            updateState={updateAnalyzerState}
          />
        );
      case 'mesh':
        return (
          <MeshAnalysisSection
            state={analyzerState}
            updateState={updateAnalyzerState}
          />
        );
      case 'hydrograph':
        return (
          <HydrographAnalysisSection
            state={analyzerState}
            updateState={updateAnalyzerState}
          />
        );
      case 'export':
        return (
          <ExportManagerSection
            state={analyzerState}
            updateState={updateAnalyzerState}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col min-h-screen bg-[#131414] text-white'>
      {/* 🎛️ Menu de Navegación */}
      <AnalyzerPlusMenu
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        visibleSections={analyzerState.visibleSections}
        onNavigateHome={onNavigateHome}
      />

      {/* 📊 Contenido Principal */}
      <div className='flex-1 flex min-h-0 overflow-hidden'>
        {/* 📈 Área de Contenido Principal */}
        <div className='flex-1 flex flex-col min-h-0 overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='flex-1 overflow-y-auto overflow-x-hidden'
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 📊 Panel Lateral de Información */}
        {!isLicensePanelCollapsed && (
          <div className='w-80 border-l border-white/10 bg-black/20 backdrop-blur-sm'>
            <div className='p-4 space-y-4'>
              <div className='text-center text-white/70 text-sm'>
                <p>Panel de información adicional</p>
                <p className='text-xs text-white/50 mt-2'>
                  Aquí se mostrará información contextual según la sección
                  activa
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Siempre al final de la página */}
      <Footer />
    </div>
  );
};

export default AnalyzerPlus;
