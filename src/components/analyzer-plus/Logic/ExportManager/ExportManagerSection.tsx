/**
 * 📤 Export Manager Section - Gestión de Exportaciones
 *
 * Esta sección maneja la exportación flexible de resultados:
 * - Selección de secciones a exportar
 * - Múltiples formatos de exportación
 * - Configuración de metadatos
 * - Gestión de archivos de salida
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  FileText,
  Database,
  Table,
  CheckCircle,
  Settings,
  FolderOpen,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzerPlusState, AnalyzerPlusSection } from '../../index';

interface ExportManagerSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

export const ExportManagerSection: React.FC<ExportManagerSectionProps> = ({
  state,
  updateState,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // 📋 Configuración de secciones exportables
  const exportableSections = [
    {
      id: 'project' as AnalyzerPlusSection,
      name: 'Análisis del Proyecto',
      description: 'Metadata y resumen ejecutivo',
      icon: FileText,
      available: !!state.projectMetadata,
      size: '~2.5 MB',
    },
    {
      id: 'manning' as AnalyzerPlusSection,
      name: 'Valores de Manning',
      description: 'Tablas de rugosidad y calibración',
      icon: Database,
      available: !!state.manningValues,
      size: '~1.2 MB',
    },
    {
      id: 'mesh' as AnalyzerPlusSection,
      name: 'Datos de Malla',
      description: 'Geometría y coordenadas',
      icon: Table,
      available: !!state.meshInfo,
      size: '~8.7 MB',
    },
    {
      id: 'hydrograph' as AnalyzerPlusSection,
      name: 'Hidrogramas',
      description: 'Series temporales y análisis',
      icon: Package,
      available: !!state.hydrographData,
      size: '~4.1 MB',
    },
  ];

  // 🎯 Función para alternar selección de sección
  const toggleSectionSelection = (sectionId: AnalyzerPlusSection) => {
    const currentSelection = new Set(state.exportConfig.selectedSections);
    if (currentSelection.has(sectionId)) {
      currentSelection.delete(sectionId);
    } else {
      currentSelection.add(sectionId);
    }

    updateState({
      exportConfig: {
        ...state.exportConfig,
        selectedSections: Array.from(currentSelection),
      },
    });
  };

  // 📤 Función para ejecutar exportación
  const executeExport = async () => {
    if (state.exportConfig.selectedSections.length === 0) {
      toast.error('Debe seleccionar al menos una sección para exportar');
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(0);

      // Simular proceso de exportación
      const steps = state.exportConfig.selectedSections.length;
      for (let i = 0; i < steps; i++) {
        setExportProgress(((i + 1) / steps) * 100);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`Exportación completada: ${steps} secciones exportadas`);
      setIsExporting(false);
      setExportProgress(0);
    } catch (error) {
      console.error('Error during export:', error);
      toast.error('Error durante la exportación');
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className='h-full p-6 pb-8 pt-6 space-y-6'>
      {/* 📋 Header de la sección */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex items-center justify-between mb-6'
      >
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-400/30'>
            <Download className='h-6 w-6 text-pink-400' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Gestor de Exportaciones
            </h2>
            <p className='text-white/70'>Exportación flexible de resultados</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-white/70'>
            {state.exportConfig.selectedSections.length} secciones seleccionadas
          </span>
        </div>
      </motion.div>

      {/* ⚙️ Configuración de exportación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
      >
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <Settings className='h-5 w-5 text-blue-400' />
          Configuración de Exportación
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm text-white/70 mb-2'>Formato</label>
            <select
              value={state.exportConfig.format}
              onChange={e =>
                updateState({
                  exportConfig: {
                    ...state.exportConfig,
                    format: e.target.value as 'csv' | 'json' | 'excel',
                  },
                })
              }
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500'
            >
              <option value='json'>JSON</option>
              <option value='csv'>CSV</option>
              <option value='excel'>Excel</option>
            </select>
          </div>

          <div>
            <label className='block text-sm text-white/70 mb-2'>
              Carpeta de Destino
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                placeholder='/ruta/de/exportacion'
                className='flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500'
              />
              <button className='px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors'>
                <FolderOpen className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='flex items-center gap-2 pt-6'>
            <input
              type='checkbox'
              id='includeMetadata'
              checked={state.exportConfig.includeMetadata}
              onChange={e =>
                updateState({
                  exportConfig: {
                    ...state.exportConfig,
                    includeMetadata: e.target.checked,
                  },
                })
              }
              className='rounded border-white/20 bg-white/10 text-pink-500 focus:ring-pink-500'
            />
            <label htmlFor='includeMetadata' className='text-sm text-white/90'>
              Incluir Metadatos
            </label>
          </div>
        </div>
      </motion.div>

      {/* 📋 Selección de secciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
      >
        <h3 className='text-lg font-semibold text-white mb-4'>
          Seleccionar Secciones
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {exportableSections.map(section => {
            const Icon = section.icon;
            const isSelected = state.exportConfig.selectedSections.includes(
              section.id
            );

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all cursor-pointer',
                  isSelected
                    ? 'border-pink-400/50 bg-pink-400/10'
                    : section.available
                      ? 'border-white/20 bg-white/5 hover:border-white/40'
                      : 'border-gray-600/50 bg-gray-600/10 cursor-not-allowed opacity-50'
                )}
                onClick={() =>
                  section.available && toggleSectionSelection(section.id)
                }
              >
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0'>
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isSelected ? 'text-pink-400' : 'text-white/70'
                      )}
                    />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h4 className='text-white font-medium'>{section.name}</h4>
                      {isSelected && (
                        <CheckCircle className='h-4 w-4 text-pink-400' />
                      )}
                      {!section.available && (
                        <span className='text-xs text-gray-400 bg-gray-600/20 px-2 py-1 rounded'>
                          No disponible
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-white/70 mb-2'>
                      {section.description}
                    </p>
                    <div className='text-xs text-white/50'>
                      Tamaño estimado: {section.size}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 📤 Botón de exportación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-white mb-1'>
              Ejecutar Exportación
            </h3>
            <p className='text-sm text-white/70'>
              {state.exportConfig.selectedSections.length} secciones • Formato:{' '}
              {state.exportConfig.format.toUpperCase()}
            </p>
          </div>

          <button
            onClick={executeExport}
            disabled={
              isExporting || state.exportConfig.selectedSections.length === 0
            }
            className={cn(
              'px-6 py-3 rounded-lg transition-colors flex items-center gap-2',
              isExporting || state.exportConfig.selectedSections.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 text-white'
            )}
          >
            <Download className='h-4 w-4' />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
        </div>

        {isExporting && (
          <div className='mt-4'>
            <div className='flex items-center gap-3 mb-2'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400'></div>
              <span className='text-sm text-white/90'>Exportando datos...</span>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <div
                className='bg-pink-400 h-2 rounded-full transition-all duration-300'
                style={{ width: `${exportProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
