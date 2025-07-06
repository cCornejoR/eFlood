/**
 * 📦 VTK Exporter Component
 *
 * Componente especializado para la exportación de datos HEC-RAS
 * a formato VTK para visualización 3D.
 *
 * Funcionalidades:
 * - Configuración de parámetros de exportación
 * - Selección de variables a exportar
 * - Progreso de exportación en tiempo real
 * - Gestión de archivos VTK generados
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
  FileText,
  Layers,
  Zap,
} from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '@/lib/utils';
import { HecRasState } from '@/components/HecRas/index';

interface VTKExporterProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

// 🎯 Opciones de exportación VTK
interface ExportOptions {
  outputDirectory: string;
  exportDepth: boolean;
  exportVelocity: boolean;
  exportWSE: boolean;
  exportMaxValues: boolean;
  timeStepInterval: number;
}

/**
 * 📦 Componente Exportador VTK
 *
 * Interfaz completa para configurar y ejecutar la exportación
 * de datos HEC-RAS a formato VTK
 */
export const VTKExporter: React.FC<VTKExporterProps> = ({
  state,
  updateState,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    outputDirectory: '',
    exportDepth: true,
    exportVelocity: true,
    exportWSE: true,
    exportMaxValues: false,
    timeStepInterval: 1,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResults, setExportResults] = useState<any>(null);

  /**
   * 📁 Seleccionar directorio de salida
   */
  const handleSelectOutputDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        title: 'Seleccionar directorio para archivos VTK',
      });

      if (selected && typeof selected === 'string') {
        setExportOptions(prev => ({ ...prev, outputDirectory: selected }));
      }
    } catch (error) {
      console.error('Error seleccionando directorio:', error);
    }
  };

  /**
   * 🚀 Iniciar exportación VTK
   */
  const handleStartExport = async () => {
    if (!state.selectedHDFFile || !exportOptions.outputDirectory) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(0);

      // Paso 1: Preparar exportación
      setExportStep('Preparando exportación...');
      setExportProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Paso 2: Procesar geometría
      setExportStep('Procesando geometría...');
      setExportProgress(25);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Paso 3: Exportar datos temporales
      setExportStep('Exportando series temporales...');
      setExportProgress(50);

      // Exportar usando pyHMT2D real

      try {
        // Exportación real usando pyHMT2D
        const result = await invoke('export_to_vtk_py_hmt2_d', {
          hdfFilePath: state.selectedHDFFile,
          outputDirectory: exportOptions.outputDirectory,
          terrainFilePath: state.selectedTerrainFile,
        });

        if ((result as any).success) {
          const resultData = JSON.parse((result as any).output);
          setExportResults(resultData);

          // Actualizar estado con archivos reales exportados
          if (
            resultData.files_created &&
            Array.isArray(resultData.files_created)
          ) {
            updateState({
              exportedVTKFiles: [
                ...state.exportedVTKFiles,
                ...resultData.files_created.map(
                  (fileName: string) =>
                    `${exportOptions.outputDirectory}/${fileName}`
                ),
              ],
            });
          }
        } else {
          throw new Error(
            (result as any).error || 'Error en la exportación VTK'
          );
        }
      } catch (error) {
        console.error('Error en exportación VTK:', error);
        setExportError(
          `Error al exportar archivos VTK: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
        return;
      }

      setExportStep('Exportación completada');
      setExportProgress(100);
    } catch (error) {
      console.error('Error durante exportación:', error);
      setExportError('Error al exportar archivos VTK');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 🔧 Actualizar opción de exportación
   */
  const updateExportOption = <K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const canExport =
    state.selectedHDFFile &&
    exportOptions.outputDirectory &&
    (exportOptions.exportDepth ||
      exportOptions.exportVelocity ||
      exportOptions.exportWSE);

  return (
    <div className='space-y-4'>
      {/* 📋 Título y descripción */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>Exportación VTK</h2>
        <p className='text-white/60'>
          Configura y exporta los datos HEC-RAS a formato VTK para visualización
          3D
        </p>
      </div>

      {/* ⚙️ Configuración de exportación */}
      <div className='bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10'>
        <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
          <Settings className='h-5 w-5' />
          Configuración de Exportación
        </h3>

        <div className='space-y-4'>
          {/* Directorio de salida - Compacto */}
          <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
            <label className='block text-white/80 text-sm font-medium mb-3'>
              Directorio de Salida
            </label>
            <div className='flex gap-2'>
              <div className='flex-1 bg-white/10 rounded-md p-2 border border-white/20 min-h-[2.5rem] flex items-center'>
                <p className='text-white/80 text-sm truncate'>
                  {exportOptions.outputDirectory || 'No seleccionado'}
                </p>
              </div>
              <button
                onClick={handleSelectOutputDirectory}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 px-3 py-2 rounded-md transition-colors flex items-center gap-1.5 flex-shrink-0'
              >
                <FolderOpen className='h-4 w-4' />
                <span className='hidden sm:inline text-sm'>Seleccionar</span>
              </button>
            </div>
          </div>

          {/* Variables a exportar - Layout compacto */}
          <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
            <label className='block text-white/80 text-sm font-medium mb-4'>
              Variables a Exportar
            </label>

            {/* Grid compacto 2x2 */}
            <div className='grid grid-cols-2 gap-3'>
              {[
                {
                  key: 'exportDepth',
                  label: 'Profundidad',
                  icon: Layers,
                  color: 'blue',
                },
                {
                  key: 'exportVelocity',
                  label: 'Velocidad',
                  icon: Zap,
                  color: 'green',
                },
                {
                  key: 'exportWSE',
                  label: 'WSE',
                  icon: FileText,
                  color: 'purple',
                },
                {
                  key: 'exportMaxValues',
                  label: 'Solo Máximos',
                  icon: CheckCircle,
                  color: 'yellow',
                },
              ].map(({ key, label, icon: Icon, color }) => (
                <label
                  key={key}
                  className='flex items-center gap-2 p-2 bg-white/5 rounded-md border border-white/10 cursor-pointer hover:bg-white/10 transition-colors'
                >
                  <input
                    type='checkbox'
                    checked={
                      exportOptions[key as keyof ExportOptions] as boolean
                    }
                    onChange={e =>
                      updateExportOption(
                        key as keyof ExportOptions,
                        e.target.checked
                      )
                    }
                    className='sr-only'
                  />
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                      exportOptions[key as keyof ExportOptions]
                        ? `bg-${color}-500 border-${color}-500`
                        : 'border-white/30'
                    )}
                  >
                    {exportOptions[key as keyof ExportOptions] && (
                      <CheckCircle className='h-2.5 w-2.5 text-white' />
                    )}
                  </div>
                  <Icon
                    className={cn(
                      'h-3.5 w-3.5 flex-shrink-0',
                      `text-${color}-400`
                    )}
                  />
                  <span className='text-white/80 text-xs font-medium truncate'>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Intervalo de pasos temporales - Slider compacto */}
          <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
            <div className='flex items-center justify-between mb-3'>
              <label className='text-white/80 text-sm font-medium'>
                Intervalo de Pasos Temporales
              </label>
              <span className='text-blue-400 font-mono text-sm bg-blue-500/20 px-2 py-1 rounded'>
                {exportOptions.timeStepInterval}
              </span>
            </div>

            {/* Slider personalizado */}
            <div className='relative'>
              <input
                type='range'
                min='1'
                max='10'
                value={exportOptions.timeStepInterval}
                onChange={e =>
                  updateExportOption(
                    'timeStepInterval',
                    parseInt(e.target.value) || 1
                  )
                }
                className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider'
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((exportOptions.timeStepInterval - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((exportOptions.timeStepInterval - 1) / 9) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />

              {/* Marcadores de valores */}
              <div className='flex justify-between text-xs text-white/40 mt-2'>
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <p className='text-white/50 text-xs mt-2'>
              {exportOptions.timeStepInterval === 1
                ? 'Exportar todos los pasos de tiempo'
                : `Exportar cada ${exportOptions.timeStepInterval} pasos`}
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 Panel de exportación */}
      <div className='bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10'>
        {!isExporting && !exportResults ? (
          <div className='text-center'>
            <button
              onClick={handleStartExport}
              disabled={!canExport}
              className={cn(
                'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto',
                !canExport && 'opacity-50 cursor-not-allowed hover:scale-100'
              )}
            >
              <Download className='h-5 w-5' />
              Exportar a VTK
            </button>
            {!canExport && (
              <p className='text-white/60 text-sm mt-2'>
                Selecciona directorio y al menos una variable para exportar
              </p>
            )}
          </div>
        ) : isExporting ? (
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <Loader2 className='h-6 w-6 text-blue-400 animate-spin' />
              <div className='flex-1'>
                <h4 className='text-lg font-semibold text-white'>
                  Exportando...
                </h4>
                <p className='text-white/60 text-sm'>{exportStep}</p>
              </div>
            </div>
            <div className='w-full bg-white/10 rounded-full h-2'>
              <motion.div
                className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${exportProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className='text-right text-white/60 text-sm'>
              {exportProgress}% completado
            </div>
          </div>
        ) : (
          exportResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-4'
            >
              <div className='flex items-center gap-3 text-green-400'>
                <CheckCircle className='h-6 w-6' />
                <h4 className='text-lg font-semibold'>
                  Exportación Completada
                </h4>
              </div>
              <div className='bg-white/10 rounded-lg p-4'>
                <p className='text-white/80 text-sm mb-2'>
                  <strong>Archivos creados:</strong> {exportResults.total_files}
                </p>
                <p className='text-white/80 text-sm mb-3'>
                  <strong>Ubicación:</strong> {exportResults.output_directory}
                </p>
                <div className='max-h-32 overflow-y-auto'>
                  {exportResults.files_created?.map(
                    (file: string, index: number) => (
                      <div key={index} className='text-white/60 text-xs py-1'>
                        • {file}
                      </div>
                    )
                  )}
                </div>
              </div>
              <button
                onClick={() => setExportResults(null)}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 px-4 py-2 rounded-lg transition-colors'
              >
                Nueva Exportación
              </button>
            </motion.div>
          )
        )}
      </div>

      {/* ⚠️ Error message */}
      {exportError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3'
        >
          <AlertCircle className='h-5 w-5 text-red-400' />
          <div className='flex-1'>
            <p className='text-red-200 font-medium'>Error de Exportación</p>
            <p className='text-red-300/80 text-sm'>{exportError}</p>
          </div>
          <button
            onClick={() => setExportError(null)}
            className='text-red-300 hover:text-red-200 text-sm'
          >
            Cerrar
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default VTKExporter;
