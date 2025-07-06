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
import { AlertCircle, Play } from 'lucide-react';
// import { invoke } from '@tauri-apps/api/core';
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

  /**
   * 📂 Manejar selección de archivo HDF
   */
  const handleHDFFileSelect = async (filePath: string) => {
    try {
      setIsLoadingHDF(true);
      setLoadError(null);

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
    setLoadError(null);
  };

  /**
   * 🗑️ Remover archivo de terreno
   */
  const handleRemoveTerrainFile = () => {
    updateState({ selectedTerrainFile: null });
    setLoadError(null);
  };

  /**
   * ✅ Continuar al análisis
   * Valida que los archivos necesarios estén cargados
   */
  const handleContinueToAnalysis = () => {
    if (state.selectedHDFFile) {
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
