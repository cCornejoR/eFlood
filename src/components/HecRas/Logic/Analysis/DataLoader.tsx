/**
 * 📁 Data Loader Component
 *
 * Componente especializado para la carga de archivos HDF y terreno.
 * Maneja la selección de archivos, validación y carga inicial de datos.
 *
 * Funcionalidades:
 * - Selección de archivo HDF de resultados HEC-RAS
 * - Selección opcional de archivo de terreno (DEM)
 * - Validación de formatos de archivo
 * - Feedback visual del estado de carga
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Play,
  FileText,
  HardDrive,
  Calendar,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { HecRasState } from '../../index';
import { FileUpload } from '../../UI/FileUpload';
import { Button } from '@/components/ui/Button';

interface DataLoaderProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
  onDataLoaded: () => void;
}

/**
 * 📁 Componente de Carga de Datos
 *
 * Interfaz intuitiva para cargar archivos HDF y terreno
 * con validación y feedback en tiempo real
 */
export const DataLoader: React.FC<DataLoaderProps> = ({
  state,
  updateState,
  onDataLoaded,
}) => {
  const [isLoadingHDF, setIsLoadingHDF] = useState(false);
  const [isLoadingTerrain, setIsLoadingTerrain] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    hdf?: { size: string; modified: string; loadTime: string };
    terrain?: { size: string; modified: string; loadTime: string };
  }>({});

  /**
   * 📊 Obtener información real del archivo
   */
  const getFileInfo = async (filePath: string) => {
    try {
      // Obtener información real del archivo usando Tauri
      const fileStats: { size: number; modified: number } = await invoke(
        'get_file_info',
        { filePath }
      );

      // Convertir bytes a MB
      const sizeInMB = (fileStats.size / (1024 * 1024)).toFixed(2);

      // Formatear fecha de modificación
      const modifiedDate = new Date(fileStats.modified * 1000); // Unix timestamp a Date

      return {
        size: `${sizeInMB} MB`,
        modified: modifiedDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        loadTime: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    } catch (error) {
      console.error('Error obteniendo información del archivo:', error);

      return {
        size: 'No disponible',
        modified: 'No disponible',
        loadTime: new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    }
  };

  /**
   * 📂 Manejar selección de archivo HDF
   */
  const handleHDFFileSelect = async (filePath: string) => {
    try {
      setIsLoadingHDF(true);
      setLoadError(null);

      // Obtener información del archivo
      const info = await getFileInfo(filePath);
      setFileInfo(prev => ({ ...prev, hdf: info }));

      updateState({ selectedHDFFile: filePath });

      // NO leer automáticamente el archivo - solo guardar la ruta
      // La lectura se hará cuando el usuario inicie el análisis
      console.log('Archivo HDF seleccionado (sin leer contenido):', filePath);
    } catch (error) {
      console.error('Error procesando archivo HDF:', error);
      setLoadError('Error al procesar el archivo HDF');
    } finally {
      setIsLoadingHDF(false);
    }
  };

  /**
   * 🗺️ Manejar selección de archivo de terreno
   */
  const handleTerrainFileSelect = async (filePath: string) => {
    try {
      setIsLoadingTerrain(true);
      setLoadError(null);

      // Obtener información del archivo
      const info = await getFileInfo(filePath);
      setFileInfo(prev => ({ ...prev, terrain: info }));

      updateState({ selectedTerrainFile: filePath });
      console.log('Archivo de terreno cargado:', filePath);
    } catch (error) {
      console.error('Error procesando archivo de terreno:', error);
      setLoadError('Error al procesar el archivo de terreno');
    } finally {
      setIsLoadingTerrain(false);
    }
  };

  /**
   * 🗑️ Remover archivo HDF
   */
  const handleRemoveHDFFile = () => {
    updateState({
      selectedHDFFile: null,
      fileMetadata: null,
      hdfData: null,
      hydrographData: null,
      analysisResults: null,
    });
    setFileInfo(prev => ({ ...prev, hdf: undefined }));
    setLoadError(null);
  };

  /**
   * 🗑️ Remover archivo de terreno
   */
  const handleRemoveTerrainFile = () => {
    updateState({ selectedTerrainFile: null });
    setFileInfo(prev => ({ ...prev, terrain: undefined }));
    setLoadError(null);
  };

  /**
   * ✅ Continuar al análisis
   * Valida que los archivos necesarios estén cargados
   */
  const handleContinueToAnalysis = () => {
    if (state.selectedHDFFile) {
      // Mostrar notificación de progreso
      toast.success('¡Datos cargados correctamente!', {
        description: 'Ahora puedes proceder al análisis de los datos',
        duration: 3000,
      });
      onDataLoaded();
    }
  };

  return (
    <div className='space-y-4'>
      {/* 📋 Título y descripción */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>Cargar Datos</h2>
        <p className='text-white/60'>
          Selecciona los archivos necesarios para el análisis HEC-RAS
        </p>
      </div>

      {/* ⚠️ Error message */}
      {loadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3'
        >
          <AlertCircle className='h-5 w-5 text-red-400' />
          <p className='text-red-200'>{loadError}</p>
        </motion.div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* 📊 Archivo HDF de Resultados */}
        <FileUpload
          fileType='hdf'
          selectedFile={state.selectedHDFFile}
          onFileSelect={handleHDFFileSelect}
          onFileRemove={handleRemoveHDFFile}
          isLoading={isLoadingHDF}
          required={true}
          variant='default'
          size='md'
        />

        {/* 🗺️ Archivo de Terreno (Opcional) */}
        <FileUpload
          fileType='terrain'
          selectedFile={state.selectedTerrainFile}
          onFileSelect={handleTerrainFileSelect}
          onFileRemove={handleRemoveTerrainFile}
          isLoading={isLoadingTerrain}
          required={false}
          variant='default'
          size='md'
        />
      </div>

      {/* 📋 Información Detallada de Archivos Cargados */}
      {(state.selectedHDFFile || state.selectedTerrainFile) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10'
        >
          <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <FileText className='h-5 w-5 text-blue-400' />
            Información de Archivos Cargados
          </h3>

          <div className='space-y-4'>
            {/* Información del archivo HDF */}
            {state.selectedHDFFile && (
              <div className='bg-white/5 rounded-lg p-4 border border-green-500/20'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                  <h4 className='font-medium text-green-400'>
                    Archivo HDF de Resultados
                  </h4>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div className='space-y-2'>
                    <div className='flex items-start gap-2'>
                      <FileText className='h-4 w-4 text-white/60 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-white/60'>Ruta del archivo:</p>
                        <p className='text-white font-mono text-xs break-all'>
                          {state.selectedHDFFile}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <HardDrive className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Tamaño:</p>
                        <p className='text-white'>
                          {fileInfo.hdf?.size || 'Calculando...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Fecha de modificación:</p>
                        <p className='text-white'>
                          {fileInfo.hdf?.modified || 'Obteniendo...'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Cargado:</p>
                        <p className='text-white'>
                          {fileInfo.hdf?.loadTime || 'Hace unos momentos'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información del archivo de terreno */}
            {state.selectedTerrainFile && (
              <div className='bg-white/5 rounded-lg p-4 border border-blue-500/20'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-3 h-3 bg-blue-400 rounded-full'></div>
                  <h4 className='font-medium text-blue-400'>
                    Archivo de Terreno (DEM)
                  </h4>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div className='space-y-2'>
                    <div className='flex items-start gap-2'>
                      <FileText className='h-4 w-4 text-white/60 mt-0.5 flex-shrink-0' />
                      <div>
                        <p className='text-white/60'>Ruta del archivo:</p>
                        <p className='text-white font-mono text-xs break-all'>
                          {state.selectedTerrainFile}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <HardDrive className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Tamaño:</p>
                        <p className='text-white'>
                          {fileInfo.terrain?.size || 'Calculando...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Fecha de modificación:</p>
                        <p className='text-white'>
                          {fileInfo.terrain?.modified || 'Obteniendo...'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-white/60' />
                      <div>
                        <p className='text-white/60'>Cargado:</p>
                        <p className='text-white'>
                          {fileInfo.terrain?.loadTime || 'Hace unos momentos'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ▶️ Botón de continuar */}
      {state.selectedHDFFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center'
        >
          <Button
            onClick={handleContinueToAnalysis}
            variant='default'
            size='lg'
            className='font-semibold'
          >
            <Play className='w-4 h-4 mr-2' />
            Continuar al Análisis
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default DataLoader;
