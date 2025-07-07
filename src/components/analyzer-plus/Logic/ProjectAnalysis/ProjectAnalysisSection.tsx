/**
 * 📊 Project Analysis Section - Análisis Completo del Proyecto
 *
 * Esta sección maneja el análisis completo del proyecto HEC-RAS:
 * - Carga de archivos HDF y terreno
 * - Extracción de metadata del proyecto
 * - Resumen ejecutivo del análisis
 * - Información general del modelo
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Play,
  CheckCircle,
  Info,
  Calendar,
  Layers,
  Database,
  TreePine,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzerPlusState } from '../../index';
import { useTauri } from '@/hooks/useTauri';
import { FileUpload } from '@/components/HecRas/UI/FileUpload';
import { DotFlow } from '@/components/ui/dot-flow';

interface ProjectAnalysisSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

export const ProjectAnalysisSection: React.FC<ProjectAnalysisSectionProps> = ({
  state,
  updateState,
}) => {
  const { rasCommander } = useTauri();
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // 🎯 Configuración para la animación de análisis
  const analysisSteps = [
    {
      title: 'Leyendo archivo HDF...',
      frames: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      duration: 200,
      repeatCount: 2,
    },
    {
      title: 'Extrayendo metadatos...',
      frames: [
        [10, 11, 12],
        [13, 14, 15],
        [16, 17, 18],
      ],
      duration: 180,
      repeatCount: 2,
    },
    {
      title: 'Procesando datos con pyHMT2D...',
      frames: [
        [20, 21, 22],
        [23, 24, 25],
        [26, 27, 28],
      ],
      duration: 150,
      repeatCount: 3,
    },
    {
      title: 'Extrayendo valores de Manning...',
      frames: [
        [30, 31, 32],
        [33, 34, 35],
        [36, 37, 38],
      ],
      duration: 170,
      repeatCount: 2,
    },
    {
      title: 'Generando hidrogramas...',
      frames: [
        [40, 41, 42],
        [43, 44, 45],
        [46, 47, 48],
      ],
      duration: 160,
      repeatCount: 2,
    },
    {
      title: 'Finalizando análisis...',
      frames: [
        [0, 7, 14, 21, 28, 35, 42],
        [1, 8, 15, 22, 29, 36, 43],
        [2, 9, 16, 23, 30, 37, 44],
      ],
      duration: 120,
      repeatCount: 1,
    },
  ];

  // 🔄 Funciones para manejar archivos
  const handleHDFFileSelect = (filePath: string) => {
    updateState({ selectedHDFFile: filePath });
    toast.success('Archivo HDF cargado correctamente');
  };

  const handleTerrainFileSelect = (filePath: string) => {
    updateState({ selectedTerrainFile: filePath });
    toast.success('Archivo de terreno cargado correctamente');
  };

  const handleHDFFileRemove = () => {
    updateState({ selectedHDFFile: null });
  };

  const handleTerrainFileRemove = () => {
    updateState({ selectedTerrainFile: null });
  };

  // 🔬 Función para ejecutar análisis completo del proyecto
  const executeProjectAnalysis = async () => {
    if (!state.selectedHDFFile) {
      toast.error('Debe seleccionar un archivo HDF primero');
      return;
    }

    try {
      updateState({ isLoadingProject: true });
      setAnalysisProgress(10);

      // Paso 1: Obtener información completa de la malla
      setAnalysisProgress(30);

      const meshInfo = await rasCommander.getMeshInfo(
        state.selectedHDFFile,
        state.selectedTerrainFile || undefined
      );

      // Paso 2: Obtener valores de Manning
      setAnalysisProgress(50);

      const manningValues = await rasCommander.getManningValues(
        state.selectedHDFFile,
        state.selectedTerrainFile || undefined
      );

      // Paso 3: Obtener series temporales
      setAnalysisProgress(70);

      // Obtener primera malla disponible para análisis temporal
      const meshNames =
        meshInfo.success && meshInfo.data?.mesh_names
          ? meshInfo.data.mesh_names
          : ['2D Area 1'];

      const timeSeriesData = await rasCommander.getTimeSeries(
        state.selectedHDFFile,
        meshNames[0],
        'Water Surface',
        state.selectedTerrainFile || undefined
      );

      // Paso 4: Compilar resumen del proyecto
      setAnalysisProgress(90);

      const projectSummary = {
        file_info: {
          hdf_file: state.selectedHDFFile,
          terrain_file: state.selectedTerrainFile,
          analysis_date: new Date().toISOString(),
        },
        mesh_summary: meshInfo.success ? meshInfo.data : null,
        manning_summary: manningValues.success ? manningValues.data : null,
        temporal_summary: timeSeriesData.success ? timeSeriesData.data : null,
      };

      // Actualizar estado con resultados
      updateState({
        projectMetadata: projectSummary,
        meshInfo: meshInfo.success ? meshInfo.data : null,
        manningValues: manningValues.success ? manningValues.data : null,
        timeSeriesData: timeSeriesData.success ? timeSeriesData.data : null,
        analysisResults: {
          manningAnalysis: state.analysisResults?.manningAnalysis,
          meshAnalysis: state.analysisResults?.meshAnalysis,
          hydrographAnalysis: state.analysisResults?.hydrographAnalysis,
          projectSummary,
        },
        isLoadingProject: false,
      });

      setAnalysisProgress(100);

      toast.success('Análisis del proyecto completado exitosamente');
    } catch (error) {
      console.error('Error in project analysis:', error);
      toast.error('Error durante el análisis del proyecto');
      updateState({ isLoadingProject: false });
    }
  };

  return (
    <div className='flex-1 overflow-auto p-4 sm:p-6 pb-24'>
      <div className='w-full max-w-7xl mx-auto space-y-4 sm:space-y-6'>
        {/* 📋 Header de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6'
        >
          <div className='p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/30'>
            <FileText className='h-6 w-6 text-blue-400' />
          </div>
          <div className='text-center sm:text-left'>
            <h2 className='text-xl sm:text-2xl font-bold text-white'>
              Análisis del Proyecto
            </h2>
            <p className='text-white/70 text-sm sm:text-base'>
              Metadata completa y resumen ejecutivo
            </p>
          </div>
        </motion.div>

        {/* 📁 Sección de carga de archivos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6'
        >
          <h3 className='text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2'>
            <FileText className='h-5 w-5 text-blue-400' />
            Archivos del Proyecto
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
            {/* 📊 Archivo HDF de Resultados */}
            <FileUpload
              fileType='hdf'
              selectedFile={state.selectedHDFFile}
              onFileSelect={handleHDFFileSelect}
              onFileRemove={handleHDFFileRemove}
              isLoading={false}
              required={true}
              variant='default'
              size='md'
            />

            {/* 🗺️ Archivo de Terreno (Opcional) */}
            <FileUpload
              fileType='terrain'
              selectedFile={state.selectedTerrainFile}
              onFileSelect={handleTerrainFileSelect}
              onFileRemove={handleTerrainFileRemove}
              isLoading={false}
              required={false}
              variant='default'
              size='md'
            />
          </div>
        </motion.div>

        {/* 🔬 Sección de análisis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6'
        >
          <h3 className='text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <Play className='h-5 w-5 text-green-400' />
            Ejecutar Análisis
          </h3>

          {state.isLoadingProject ? (
            <div className='space-y-6'>
              <DotFlow
                items={analysisSteps}
                className='mx-auto'
                backgroundColor='bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
              />
              <div className='w-full bg-white/10 rounded-full h-2'>
                <div
                  className='bg-blue-400 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={executeProjectAnalysis}
              disabled={!state.selectedHDFFile}
              className={cn(
                'px-6 py-3 rounded-lg transition-colors flex items-center gap-2',
                state.selectedHDFFile
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className='h-4 w-4' />
              Iniciar Análisis Completo
            </button>
          )}
        </motion.div>

        {/* 📊 Resultados del análisis */}
        {state.projectMetadata && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6'
          >
            <h3 className='text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <CheckCircle className='h-5 w-5 text-green-400' />
              Resumen del Proyecto
            </h3>

            {/* Información General del Proyecto */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Calendar className='h-4 w-4 text-blue-400' />
                  <span className='text-sm text-white/70'>
                    Fecha de Análisis
                  </span>
                </div>
                <div className='text-white font-medium'>
                  {new Date(
                    state.projectMetadata.file_info?.analysis_date
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Database className='h-4 w-4 text-green-400' />
                  <span className='text-sm text-white/70'>Archivo HDF</span>
                </div>
                <div className='text-white font-medium text-xs'>
                  {state.projectMetadata.file_info?.hdf_file
                    ?.split('\\')
                    .pop() || 'N/A'}
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Layers className='h-4 w-4 text-purple-400' />
                  <span className='text-sm text-white/70'>Áreas de Malla</span>
                </div>
                <div className='text-white font-medium'>
                  {state.meshInfo?.mesh_count || 'N/A'}
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Info className='h-4 w-4 text-orange-400' />
                  <span className='text-sm text-white/70'>Estado</span>
                </div>
                <div className='text-green-400 font-medium'>
                  Análisis Completo
                </div>
              </div>
            </div>

            {/* Información Detallada de la Malla */}
            {state.meshInfo && (
              <div className='bg-white/5 rounded-lg p-4 mb-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <Layers className='h-5 w-5 text-purple-400' />
                  Información de la Malla
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>
                      Número de Celdas
                    </span>
                    <div className='text-white font-medium'>
                      {state.meshInfo.cell_count?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>
                      Número de Nodos
                    </span>
                    <div className='text-white font-medium'>
                      {state.meshInfo.node_count?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>Área Total</span>
                    <div className='text-white font-medium'>
                      {state.meshInfo.total_area
                        ? `${state.meshInfo.total_area.toFixed(2)} m²`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información de Manning */}
            {state.manningValues && (
              <div className='bg-white/5 rounded-lg p-4 mb-6'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <TreePine className='h-5 w-5 text-green-400' />
                  Valores de Manning
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>
                      Zonas de Rugosidad
                    </span>
                    <div className='text-white font-medium'>
                      {state.manningValues.zones?.length || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>Valor Mínimo</span>
                    <div className='text-white font-medium'>
                      {state.manningValues.min_value || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>Valor Máximo</span>
                    <div className='text-white font-medium'>
                      {state.manningValues.max_value || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Información Temporal */}
            {state.timeSeriesData && (
              <div className='bg-white/5 rounded-lg p-4'>
                <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <Clock className='h-5 w-5 text-blue-400' />
                  Información Temporal
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>
                      Pasos de Tiempo
                    </span>
                    <div className='text-white font-medium'>
                      {state.timeSeriesData.time_steps?.length || 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>
                      Duración Total
                    </span>
                    <div className='text-white font-medium'>
                      {state.timeSeriesData.duration
                        ? `${state.timeSeriesData.duration} horas`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <span className='text-sm text-white/70'>Intervalo</span>
                    <div className='text-white font-medium'>
                      {state.timeSeriesData.interval
                        ? `${state.timeSeriesData.interval} min`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
