import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  FileText,
  Folder,
  AlertCircle,
  CheckCircle,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface VTKExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  hdfFilePath: string;
  terrainFilePath?: string;
}

interface ExportInfo {
  success: boolean;
  metadata?: {
    file_version: string;
    units: string;
    flow_areas: string[];
    cell_counts: number[];
    solution_times: number;
    total_timesteps: number;
  };
  error?: string;
}

interface ExportResult {
  success: boolean;
  output_directory?: string;
  files_created?: string[];
  num_files?: number;
  export_type?: string;
  error?: string;
}

export const VTKExportModal: React.FC<VTKExportModalProps> = ({
  isOpen,
  onClose,
  hdfFilePath,
  terrainFilePath,
}) => {
  const [exportInfo, setExportInfo] = useState<ExportInfo | null>(null);
  const [exportType, setExportType] = useState<'all_timesteps' | 'max_values'>(
    'all_timesteps'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Fetch export information when modal opens
  useEffect(() => {
    if (isOpen && hdfFilePath) {
      fetchExportInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hdfFilePath]);

  const fetchExportInfo = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<ExportInfo>('get_vtk_export_info', {
        hdfFilePath,
        terrainFilePath: terrainFilePath || null,
      });
      setExportInfo(result);
    } catch (error) {
      console.error('Error fetching export info:', error);
      setExportInfo({
        success: false,
        error: 'Error al obtener información del archivo HDF',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress('Iniciando exportación...');
    setExportResult(null);

    try {
      const result = await invoke<ExportResult>('export_to_vtk_py_hmt2_d', {
        hdfFilePath,
        terrainFilePath: terrainFilePath || null,
        exportType,
      });

      setExportResult(result);

      if (result.success) {
        setProgress(
          `Exportación completada: ${result.num_files} archivos creados en ${result.output_directory}`
        );

        // Mostrar información adicional sobre la exportación
        console.log('Exportación VTK exitosa:', {
          archivos: result.num_files,
          directorio: result.output_directory,
          archivos_creados: result.files_created,
        });
      } else {
        setProgress(`Error en la exportación: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during export:', error);
      setExportResult({
        success: false,
        error: 'Error durante la exportación VTK',
      });
      setProgress('Error durante la exportación');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedFileCount = () => {
    if (!exportInfo?.metadata) return 0;
    return exportType === 'all_timesteps'
      ? exportInfo.metadata.solution_times
      : 1;
  };

  const getExportDescription = () => {
    const fileCount = getEstimatedFileCount();
    if (exportType === 'all_timesteps') {
      return `Se crearán ${fileCount} archivos VTK (uno por cada paso de tiempo). Los archivos se organizarán en una carpeta específica.`;
    } else {
      return `Se creará 1 archivo VTK con los valores máximos de profundidad, elevación de superficie de agua y velocidad.`;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className='bg-[#131414] border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between p-6 border-b border-gray-700'>
            <div className='flex items-center gap-3'>
              <Download className='w-6 h-6 text-blue-400' />
              <h2 className='text-xl font-semibold text-white'>
                Exportar a VTK
              </h2>
            </div>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-700 rounded-lg transition-colors'
            >
              <X className='w-5 h-5 text-gray-400' />
            </button>
          </div>

          {/* Content */}
          <div className='p-6 space-y-6'>
            {/* Loading State */}
            {isLoading && (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-400' />
                <span className='ml-3 text-gray-300'>
                  Analizando archivo HDF...
                </span>
              </div>
            )}

            {/* Export Info */}
            {exportInfo && !isLoading && (
              <>
                {exportInfo.success ? (
                  <div className='bg-gray-800 rounded-lg p-4 space-y-3'>
                    <h3 className='text-lg font-medium text-white flex items-center gap-2'>
                      <FileText className='w-5 h-5 text-green-400' />
                      Información del Archivo
                    </h3>
                    <div className='grid grid-cols-2 gap-4 text-sm'>
                      <div>
                        <span className='text-gray-400'>Versión HEC-RAS:</span>
                        <span className='ml-2 text-white'>
                          {exportInfo.metadata?.file_version}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-400'>Unidades:</span>
                        <span className='ml-2 text-white'>
                          {exportInfo.metadata?.units}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-400'>Áreas de flujo:</span>
                        <span className='ml-2 text-white'>
                          {exportInfo.metadata?.flow_areas?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className='text-gray-400'>Pasos de tiempo:</span>
                        <span className='ml-2 text-white'>
                          {exportInfo.metadata?.solution_times || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='bg-red-900/20 border border-red-700 rounded-lg p-4'>
                    <div className='flex items-center gap-2 text-red-400'>
                      <AlertCircle className='w-5 h-5' />
                      <span className='font-medium'>
                        Error al analizar el archivo
                      </span>
                    </div>
                    <p className='text-red-300 mt-2'>{exportInfo.error}</p>
                  </div>
                )}

                {/* Export Options */}
                {exportInfo.success && (
                  <div className='space-y-4'>
                    <h3 className='text-lg font-medium text-white'>
                      Opciones de Exportación
                    </h3>

                    <div className='space-y-3'>
                      <label className='flex items-start gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors'>
                        <input
                          type='radio'
                          name='exportType'
                          value='all_timesteps'
                          checked={exportType === 'all_timesteps'}
                          onChange={e =>
                            setExportType(e.target.value as 'all_timesteps')
                          }
                          className='mt-1'
                        />
                        <div>
                          <div className='text-white font-medium'>
                            Exportar todos los pasos de tiempo
                          </div>
                          <div className='text-gray-400 text-sm mt-1'>
                            Crea {exportInfo.metadata?.solution_times || 0}{' '}
                            archivos VTK individuales para análisis temporal
                            completo
                          </div>
                        </div>
                      </label>

                      <label className='flex items-start gap-3 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors'>
                        <input
                          type='radio'
                          name='exportType'
                          value='max_values'
                          checked={exportType === 'max_values'}
                          onChange={e =>
                            setExportType(e.target.value as 'max_values')
                          }
                          className='mt-1'
                        />
                        <div>
                          <div className='text-white font-medium'>
                            Exportar solo valores máximos
                          </div>
                          <div className='text-gray-400 text-sm mt-1'>
                            Crea 1 archivo VTK con los valores máximos de
                            profundidad, WSE y velocidad
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Export Description */}
                    <div className='bg-blue-900/20 border border-blue-700 rounded-lg p-4'>
                      <div className='flex items-center gap-2 text-blue-400 mb-2'>
                        <Folder className='w-5 h-5' />
                        <span className='font-medium'>
                          Información de Exportación
                        </span>
                      </div>
                      <p className='text-blue-300 text-sm'>
                        {getExportDescription()}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Export Progress */}
            {isExporting && (
              <div className='bg-gray-800 rounded-lg p-4'>
                <div className='flex items-center gap-3'>
                  <Loader2 className='w-5 h-5 animate-spin text-blue-400' />
                  <span className='text-white'>{progress}</span>
                </div>
              </div>
            )}

            {/* Export Result */}
            {exportResult && !isExporting && (
              <div
                className={`rounded-lg p-4 ${
                  exportResult.success
                    ? 'bg-green-900/20 border border-green-700'
                    : 'bg-red-900/20 border border-red-700'
                }`}
              >
                <div
                  className={`flex items-center gap-2 ${
                    exportResult.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {exportResult.success ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <AlertCircle className='w-5 h-5' />
                  )}
                  <span className='font-medium'>
                    {exportResult.success
                      ? 'Exportación Completada'
                      : 'Error en la Exportación'}
                  </span>
                </div>

                {exportResult.success ? (
                  <div className='mt-2 space-y-3'>
                    <p
                      className={`text-sm ${exportResult.success ? 'text-green-300' : 'text-red-300'}`}
                    >
                      Se crearon {exportResult.num_files} archivos VTK
                      exitosamente
                    </p>
                    <div className='flex items-center justify-between bg-gray-800/50 rounded-lg p-3'>
                      <div>
                        <p className='text-xs text-gray-400'>Ubicación:</p>
                        <p className='text-xs text-white font-mono truncate max-w-[300px]'>
                          {exportResult.output_directory}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Abrir directorio en el explorador
                          invoke('open_directory', {
                            path: exportResult.output_directory,
                          }).catch(err =>
                            console.error('Error abriendo directorio:', err)
                          );
                        }}
                        className='flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors'
                      >
                        <FolderOpen className='w-3 h-3' />
                        Abrir
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className='text-red-300 text-sm mt-2'>
                    {exportResult.error}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-700'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={!exportInfo?.success || isExporting || isLoading}
              className='px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2'
            >
              {isExporting ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className='w-4 h-4' />
                  Exportar VTK
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
