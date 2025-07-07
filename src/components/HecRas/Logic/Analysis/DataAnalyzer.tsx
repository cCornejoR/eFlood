/**
 * 🔬 Data Analyzer Component
 *
 * Componente especializado para el análisis de datos HDF cargados.
 * Procesa la estructura del archivo, extrae metadatos y prepara
 * los datos para visualización y exportación.
 *
 * Funcionalidades:
 * - Análisis automático de estructura HDF
 * - Extracción de metadatos del modelo
 * - Procesamiento de series temporales
 * - Preparación de datos para hidrogramas
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  AlertCircle,
  Database,
  BarChart3,
  Clock,
  Layers,
  Zap,
  Play,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { HecRasState } from '../../index';
import { Button } from '@/components/ui/Button';
import { DotFlow, DotFlowProps } from '@/components/ui/dot-flow';
import { BoundaryConditionsViewer } from './BoundaryConditionsViewer';
import { SimpleManningTable } from './SimpleManningTable';

interface DataAnalyzerProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

/**
 * 🔬 Componente de Análisis de Datos
 *
 * Procesa los archivos HDF cargados y extrae toda la información
 * necesaria para el análisis hidráulico
 */
export const DataAnalyzer: React.FC<DataAnalyzerProps> = ({
  state,
  updateState,
}) => {
  const [analysisStep, setAnalysisStep] = useState<string>('ready');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStartTime, setAnalysisStartTime] = useState<number>(0);

  // Usar analysisResults del estado global en lugar del estado local
  const analysisResults = state.analysisResults;

  // Navegación manual al hidrograma - removida la navegación automática

  // 🎨 Animaciones predefinidas para el análisis
  const importing = [
    [
      0, 2, 4, 6, 20, 34, 48, 46, 44, 42, 28, 14, 8, 22, 36, 38, 40, 26, 12, 10,
      16, 30, 24, 18, 32,
    ],
    [
      1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39,
      41, 43, 45, 47,
    ],
    [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
    [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
    [16, 30, 24, 18, 32],
    [17, 23, 31, 25],
    [24],
    [17, 23, 31, 25],
    [16, 30, 24, 18, 32],
    [9, 11, 15, 17, 19, 23, 25, 29, 31, 33, 37, 39],
    [8, 22, 36, 38, 40, 26, 12, 10, 16, 30, 24, 18, 32],
    [
      1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39,
      41, 43, 45, 47,
    ],
    [
      0, 2, 4, 6, 20, 34, 48, 46, 44, 42, 28, 14, 8, 22, 36, 38, 40, 26, 12, 10,
      16, 30, 24, 18, 32,
    ],
  ];

  const syncing = [
    [45, 38, 31, 24, 17, 23, 25],
    [38, 31, 24, 17, 10, 16, 18],
    [31, 24, 17, 10, 3, 9, 11],
    [24, 17, 10, 3, 2, 4],
    [17, 10, 3],
    [10, 3],
    [3],
    [],
    [45],
    [45, 38, 44, 46],
    [45, 38, 31, 37, 39],
    [45, 38, 31, 24, 30, 32],
  ];

  const searching = [
    [9, 16, 17, 15, 23],
    [10, 17, 18, 16, 24],
    [11, 18, 19, 17, 25],
    [18, 25, 26, 24, 32],
    [25, 32, 33, 31, 39],
    [32, 39, 40, 38, 46],
    [31, 38, 39, 37, 45],
    [30, 37, 38, 36, 44],
    [23, 30, 31, 29, 37],
    [31, 29, 37, 22, 24, 23, 38, 36],
    [16, 23, 24, 22, 30],
  ];

  // 📊 Calcular duración basada en el tiempo estimado de análisis
  const calculateDuration = (step: string): number => {
    const elapsedTime = Date.now() - analysisStartTime;
    const estimatedTotalTime = 15000; // 15 segundos estimados
    const remainingTime = Math.max(estimatedTotalTime - elapsedTime, 2000);

    // Ajustar duración según el paso actual
    switch (step) {
      case 'Leyendo estructura del archivo...':
        return Math.min(remainingTime / 8, 300);
      case 'Procesando series temporales...':
        return Math.min(remainingTime / 6, 250);
      case 'Extrayendo metadatos...':
        return Math.min(remainingTime / 4, 200);
      default:
        return Math.min(remainingTime / 10, 180);
    }
  };

  // 🎯 Items del DotFlow según el paso de análisis
  const getAnalysisItems = (): DotFlowProps['items'] => {
    const duration = calculateDuration(analysisStep);

    if (analysisStep.includes('estructura')) {
      return [
        {
          title: 'Leyendo estructura HDF...',
          frames: importing,
          duration,
          repeatCount: 1,
        },
        {
          title: 'Analizando datasets...',
          frames: syncing,
          duration: duration * 0.8,
          repeatCount: 1,
        },
      ];
    } else if (analysisStep.includes('temporales')) {
      return [
        {
          title: 'Procesando series temporales...',
          frames: searching,
          duration,
          repeatCount: 2,
        },
        {
          title: 'Extrayendo datos hidráulicos...',
          frames: syncing,
          duration: duration * 0.9,
          repeatCount: 1,
        },
      ];
    } else if (analysisStep.includes('metadatos')) {
      return [
        {
          title: 'Extrayendo metadatos...',
          frames: importing,
          duration,
          repeatCount: 1,
        },
        {
          title: 'Finalizando análisis...',
          frames: searching,
          duration: duration * 0.7,
          repeatCount: 1,
        },
      ];
    } else {
      return [
        {
          title: 'Analizando archivo HDF...',
          frames: importing,
          duration,
          repeatCount: 1,
        },
        {
          title: 'Procesando datos...',
          frames: syncing,
          duration: duration * 0.8,
          repeatCount: 1,
        },
        {
          title: 'Preparando resultados...',
          frames: searching,
          duration: duration * 0.6,
          repeatCount: 1,
        },
      ];
    }
  };

  /**
   * 🚀 Iniciar análisis cuando el componente se monta
   * Solo si hay archivo HDF y no hay datos ya procesados
   */
  useEffect(() => {
    if (
      state.selectedHDFFile &&
      !state.hdfData &&
      !state.isAnalyzing &&
      !analysisResults
    ) {
      handleStartAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar el componente

  /**
   * 🛑 Cancelar análisis en progreso
   */
  const handleCancelAnalysis = () => {
    updateState({ isAnalyzing: false });
    setAnalysisError(null);
    setAnalysisProgress(0);
    setAnalysisStep('Análisis cancelado');
  };

  /**
   * 🔍 Ejecutar análisis completo
   * Procesa el archivo HDF paso a paso
   */
  const handleStartAnalysis = async () => {
    if (!state.selectedHDFFile) return;

    // Timeout de seguridad para evitar bloqueos
    const analysisTimeout = setTimeout(() => {
      updateState({ isAnalyzing: false });
      setAnalysisError(
        'El análisis ha tardado demasiado tiempo. Intente nuevamente.'
      );
    }, 60000); // 60 segundos timeout

    try {
      updateState({ isAnalyzing: true });
      setAnalysisError(null);
      setAnalysisProgress(0);
      setAnalysisStartTime(Date.now());

      // Paso 1: Leer información básica del archivo
      setAnalysisStep('Leyendo información del archivo...');
      setAnalysisProgress(15);

      const fileInfo = await invoke('read_hdf_file_info', {
        filePath: state.selectedHDFFile,
      });

      // Paso 2: Leer estructura del archivo
      setAnalysisStep('Leyendo estructura del archivo...');
      setAnalysisProgress(15);

      const fileStructure = await invoke('read_hdf_file_structure', {
        filePath: state.selectedHDFFile,
      });

      // Paso 2: Obtener metadatos detallados
      setAnalysisStep('Extrayendo metadatos detallados...');
      setAnalysisProgress(30);

      const detailedMetadata = await invoke('get_detailed_hdf_metadata', {
        filePath: state.selectedHDFFile,
      });

      // Paso 3: Procesar datos HEC-RAS con pyHMT2D
      setAnalysisStep('Procesando datos con pyHMT2D...');
      setAnalysisProgress(50);

      await invoke('process_hec_ras_data', {
        hdfFilePath: state.selectedHDFFile,
        terrainFilePath: state.selectedTerrainFile,
      });

      // Paso 4: Extraer datasets hidráulicos
      setAnalysisStep('Extrayendo datasets hidráulicos...');
      setAnalysisProgress(65);

      const hydraulicDatasets = await invoke('find_hydraulic_datasets', {
        filePath: state.selectedHDFFile,
      });

      // Paso 5: Extraer condiciones de contorno reales
      setAnalysisStep('Extrayendo condiciones de contorno...');
      setAnalysisProgress(70);

      const boundaryConditions = await invoke('extract_boundary_conditions', {
        hdfFilePath: state.selectedHDFFile,
      });

      // Paso 6: Extraer valores de Manning calibrados
      setAnalysisStep('Extrayendo valores de Manning calibrados...');
      setAnalysisProgress(80);

      console.log('🌿 Extracting Manning values from:', state.selectedHDFFile);
      const manningValues = await invoke('extract_manning_values', {
        hdfFilePath: state.selectedHDFFile,
        terrainFilePath: state.selectedTerrainFile,
      });
      console.log('🌿 Manning extraction result:', manningValues);

      // Paso 4: Generar hidrograma desde condiciones de contorno
      setAnalysisStep('Generando hidrograma...');
      setAnalysisProgress(90);

      const hydrographData = await invoke('create_hydrograph_py_hmt2_d', {
        hdfFilePath: state.selectedHDFFile,
        cellId: null,
        terrainFilePath: state.selectedTerrainFile,
      });

      // Paso 5: Finalizar análisis
      setAnalysisStep('Finalizando análisis...');
      setAnalysisProgress(100);

      // Actualizar estado con resultados reales
      updateState({
        hdfData: fileStructure,
        hydrographData: hydrographData,
        fileMetadata: fileInfo,
        boundaryConditions: boundaryConditions,
        manningValues: manningValues,
        isAnalyzing: false,
      });

      // Extraer información real de los datos procesados
      const realAnalysisResults = extractAnalysisResults(
        fileStructure,
        hydraulicDatasets,
        boundaryConditions,
        detailedMetadata,
        manningValues
      );

      // Actualizar estado global con los resultados del análisis
      updateState({ analysisResults: realAnalysisResults });

      setAnalysisStep('Análisis completado');

      // Mostrar notificación de éxito
      toast.success('¡Análisis completado exitosamente!', {
        description: 'Ahora puedes visualizar hidrogramas y exportar a VTK',
        duration: 4000,
      });

      // NO auto-avanzar al siguiente tab - mantener en la pestaña actual
      // El usuario puede navegar manualmente al hidrograma cuando lo desee
    } catch (error) {
      console.error('Error durante el análisis:', error);
      setAnalysisError(`Error al analizar el archivo HDF: ${error}`);
      setAnalysisStep('Error en el análisis');

      // Limpiar estado en caso de error
      updateState({
        hdfData: null,
        hydrographData: null,
        analysisResults: null,
      });

      // NO auto-avanzar en caso de error - mantener en la pestaña actual
    } finally {
      // Limpiar timeout y resetear estado
      clearTimeout(analysisTimeout);
      updateState({ isAnalyzing: false });
    }
  };

  /**
   * 📊 Extraer resultados reales del análisis
   */
  const extractAnalysisResults = (
    fileStructure: any,
    _hydraulicDatasets: any,
    boundaryConditions: any,
    detailedMetadata?: any,
    _manningValues?: any
  ) => {
    try {
      // Parsear datos de estructura del archivo
      const structureData =
        fileStructure.success && fileStructure.data
          ? JSON.parse(fileStructure.data)
          : {};

      // Parsear datasets hidráulicos (para uso futuro)
      // const hydraulicData =
      //   hydraulicDatasets.success && hydraulicDatasets.data
      //     ? JSON.parse(hydraulicDatasets.data)
      //     : {};

      // Usar metadatos detallados si están disponibles
      let totalDatasets = Object.keys(structureData).length;
      let timeSteps = 0;
      let cellCount = 0;
      let flowAreas = 0;

      if (
        detailedMetadata &&
        detailedMetadata.success &&
        detailedMetadata.data
      ) {
        try {
          const metadata = JSON.parse(detailedMetadata.data);
          totalDatasets = metadata.total_datasets || totalDatasets;
          timeSteps = metadata.time_steps || 0;
          cellCount = metadata.cell_count || 0;
          flowAreas = metadata.flow_areas || 0;
        } catch (error) {
          console.warn('Error parsing detailed metadata:', error);
        }
      }

      // Fallback: Buscar datasets de profundidad para obtener dimensiones
      if (timeSteps === 0 || cellCount === 0) {
        for (const [path, info] of Object.entries(structureData)) {
          if (typeof info === 'object' && info !== null && 'shape' in info) {
            const shape = (info as any).shape;
            if (
              path.includes('Depth') &&
              Array.isArray(shape) &&
              shape.length >= 2
            ) {
              timeSteps = Math.max(timeSteps, shape[0] || 0);
              cellCount = Math.max(cellCount, shape[1] || 0);
            }
            if (path.includes('2D Flow Areas')) {
              flowAreas++;
            }
          }
        }
      }

      // Contar condiciones de contorno reales
      let boundaryConditionsCount = 0;
      if (
        boundaryConditions &&
        boundaryConditions.success &&
        boundaryConditions.data
      ) {
        try {
          // Limpiar datos antes de parsear JSON
          let cleanData = boundaryConditions.data;
          if (typeof cleanData === 'string') {
            // Reemplazar valores problemáticos
            cleanData = cleanData
              .replace(/\bNaN\b/g, '0')
              .replace(/\bInfinity\b/g, '0')
              .replace(/\b-Infinity\b/g, '0')
              .replace(/\bnull\b/g, '0');
          }

          const bcData = JSON.parse(cleanData);
          boundaryConditionsCount =
            bcData.total_boundaries || bcData.boundary_conditions?.length || 0;
        } catch (error) {
          console.warn('Error parsing boundary conditions:', error);
          // Fallback: buscar en estructura del archivo
          for (const path of Object.keys(structureData)) {
            if (
              path.includes('Boundary Conditions') ||
              path.includes('Event Conditions')
            ) {
              boundaryConditionsCount++;
            }
          }
        }
      }

      return {
        totalDatasets: totalDatasets,
        timeSteps: timeSteps,
        flowAreas: flowAreas,
        boundaryConditions: boundaryConditionsCount,
        cellCount: cellCount,
      };
    } catch (error) {
      console.error(
        'Error extrayendo resultados reales, usando valores por defecto:',
        error
      );
      // Retornar valores nulos en caso de error para indicar falta de datos
      return {
        totalDatasets: 0,
        timeSteps: 0,
        flowAreas: 0,
        boundaryConditions: 0,
        cellCount: 0,
      };
    }
  };

  return (
    <div className='space-y-4'>
      {/* 🔄 Panel de análisis */}
      {state.isAnalyzing ? (
        <div className='fixed inset-0 z-50 flex flex-col items-center justify-center space-y-8 bg-black/50 backdrop-blur-sm'>
          {/* DotFlow centrado con animaciones dinámicas */}
          <DotFlow
            items={getAnalysisItems()}
            backgroundColor='bg-[#131414]/80'
            className='scale-110 shadow-lg'
          />

          {/* Progreso */}
          <div className='text-center space-y-2'>
            <div className='text-white/40 text-sm'>
              {analysisProgress}% completado
            </div>
            <div className='w-64 bg-white/10 rounded-full h-1'>
              <motion.div
                className='bg-gradient-to-r from-blue-500 to-cyan-400 h-1 rounded-full'
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Botón de cancelar */}
          <div className='text-center space-y-2'>
            <Button
              onClick={handleCancelAnalysis}
              variant='ghost'
              size='sm'
              className='bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 hover:text-red-200'
            >
              <X className='w-4 h-4 mr-2' />
              Cancelar Análisis
            </Button>
            <p className='text-white/40 text-xs'>
              El análisis se cancelará automáticamente después de 60 segundos
            </p>
          </div>
        </div>
      ) : analysisError ? (
        <div className='bg-white/5 rounded-2xl px-8 backdrop-blur-sm border border-white/10'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <AlertCircle className='h-12 w-12 text-red-400' />
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                Error en Análisis
              </h3>
              <p className='text-red-200 text-sm'>{analysisError}</p>
            </div>
          </div>
        </div>
      ) : state.hdfData ? (
        <div className='fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm'>
          <CheckCircle className='h-4 w-4 text-green-400' />
          <span className='text-green-400 text-sm font-medium'>Completado</span>
        </div>
      ) : !analysisResults ? (
        <div className='fixed inset-0 z-40 flex items-center justify-center'>
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-3 text-white/70 text-base mb-6'>
              <Play className='h-5 w-5' />
              <span>Cargar Datos para Analizar</span>
            </div>
            <Button
              onClick={handleStartAnalysis}
              variant='default'
              size='default'
              className='font-medium bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 px-6 py-3'
            >
              <Play className='w-4 h-4 mr-2' />
              Comenzar Análisis
            </Button>
          </div>
        </div>
      ) : (
        <div className='fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 backdrop-blur-sm'>
          <CheckCircle className='h-4 w-4 text-green-400' />
          <span className='text-green-400 text-sm font-medium'>Completado</span>
        </div>
      )}

      {/* ⚠️ Error message */}
      {analysisError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3'
        >
          <AlertCircle className='h-5 w-5 text-red-400' />
          <div className='flex-1'>
            <p className='text-red-200 font-medium'>Error de Análisis</p>
            <p className='text-red-300/80 text-sm'>{analysisError}</p>
          </div>
          <button
            onClick={handleStartAnalysis}
            className='bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-lg text-sm transition-colors'
          >
            Reintentar
          </button>
        </motion.div>
      )}

      {/* 📊 Metadatos Completos del Modelo */}
      {analysisResults && state.hdfData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-4'
        >
          {/* Resumen General */}
          <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
            <h3 className='text-xl font-bold text-white mb-4 flex items-center gap-3'>
              <Database className='h-6 w-6 text-blue-400' />
              Resumen del Modelo HEC-RAS
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Database className='h-4 w-4 text-blue-400' />
                  <span className='text-white/80 text-sm font-medium'>
                    Datasets
                  </span>
                </div>
                <p className='text-2xl font-bold text-blue-400'>
                  {analysisResults.totalDatasets}
                </p>
                <p className='text-white/60 text-xs'>Conjuntos de datos</p>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Clock className='h-4 w-4 text-green-400' />
                  <span className='text-white/80 text-sm font-medium'>
                    Tiempo
                  </span>
                </div>
                <p className='text-2xl font-bold text-green-400'>
                  {analysisResults.timeSteps}
                </p>
                <p className='text-white/60 text-xs'>Pasos temporales</p>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <BarChart3 className='h-4 w-4 text-purple-400' />
                  <span className='text-white/80 text-sm font-medium'>
                    Malla
                  </span>
                </div>
                <p className='text-2xl font-bold text-purple-400'>
                  {analysisResults.cellCount.toLocaleString()}
                </p>
                <p className='text-white/60 text-xs'>Celdas computacionales</p>
              </div>

              <div className='bg-white/5 rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Layers className='h-4 w-4 text-yellow-400' />
                  <span className='text-white/80 text-sm font-medium'>
                    Áreas
                  </span>
                </div>
                <p className='text-2xl font-bold text-yellow-400'>
                  {analysisResults.flowAreas}
                </p>
                <p className='text-white/60 text-xs'>Áreas de flujo 2D</p>
              </div>
            </div>
          </div>

          {/* Condiciones de Contorno Reales - Ancho completo */}
          <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
            <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Zap className='h-5 w-5 text-yellow-400' />
              Condiciones de Contorno
            </h4>
            <div>
              {state.boundaryConditions &&
              state.boundaryConditions.success &&
              state.boundaryConditions.data ? (
                (() => {
                  try {
                    // Limpiar datos antes de parsear JSON
                    let cleanData = state.boundaryConditions.data;
                    if (typeof cleanData === 'string') {
                      cleanData = cleanData
                        .replace(/\bNaN\b/g, '0')
                        .replace(/\bInfinity\b/g, '0')
                        .replace(/\b-Infinity\b/g, '0')
                        .replace(/\bnull\b/g, '0');
                    }

                    const bcData = JSON.parse(cleanData);
                    const boundaryConditions = bcData.boundary_conditions || [];

                    if (boundaryConditions.length === 0) {
                      return (
                        <div className='bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20'>
                          <p className='text-yellow-400 text-sm'>
                            No se encontraron condiciones de contorno en el
                            archivo HDF5
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {boundaryConditions.map((bc: any, index: number) => (
                          <div
                            key={index}
                            className='bg-white/5 rounded-lg p-3'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <span className='text-white/80 text-sm font-medium'>
                                {bc.name || 'Condición sin nombre'}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  bc.type === 'Caudal'
                                    ? 'text-blue-400 bg-blue-500/20'
                                    : bc.type === 'Nivel'
                                      ? 'text-green-400 bg-green-500/20'
                                      : bc.type === 'Error'
                                        ? 'text-red-400 bg-red-500/20'
                                        : 'text-gray-400 bg-gray-500/20'
                                }`}
                              >
                                {bc.type || 'Desconocido'}
                              </span>
                            </div>
                            <p className='text-white/60 text-xs'>
                              {bc.description || 'Sin descripción disponible'}
                            </p>
                            {bc.data_available && bc.time_steps > 0 && (
                              <p className='text-white/40 text-xs mt-1'>
                                {bc.time_steps} pasos temporales disponibles
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  } catch (error) {
                    console.error('Error parsing boundary conditions:', error);
                    return (
                      <div className='bg-red-500/10 rounded-lg p-3 border border-red-500/20'>
                        <p className='text-red-400 text-sm'>
                          Error al cargar condiciones de contorno:{' '}
                          {error instanceof Error
                            ? error.message
                            : 'Error desconocido'}
                        </p>
                      </div>
                    );
                  }
                })()
              ) : (
                <div className='bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/20'>
                  <p className='text-yellow-400 text-sm'>
                    No se encontraron condiciones de contorno en el archivo
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variables Disponibles */}
          <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
            <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Layers className='h-5 w-5 text-purple-400' />
              Variables Disponibles para Análisis
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-white/5 rounded-lg p-4 border border-blue-500/20'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                  <span className='text-white font-medium text-sm'>
                    Profundidad
                  </span>
                </div>
                <p className='text-white/60 text-xs mb-2'>
                  Profundidad del agua en cada celda
                </p>
                <div className='text-xs text-blue-400'>
                  Dimensiones: {analysisResults.timeSteps} ×{' '}
                  {analysisResults.cellCount.toLocaleString()}
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-4 border border-green-500/20'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                  <span className='text-white font-medium text-sm'>
                    Velocidad
                  </span>
                </div>
                <p className='text-white/60 text-xs mb-2'>
                  Componentes U y V de velocidad
                </p>
                <div className='text-xs text-green-400'>
                  Dimensiones: {analysisResults.timeSteps} ×{' '}
                  {analysisResults.cellCount.toLocaleString()} × 2
                </div>
              </div>

              <div className='bg-white/5 rounded-lg p-4 border border-purple-500/20'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                  <span className='text-white font-medium text-sm'>WSE</span>
                </div>
                <p className='text-white/60 text-xs mb-2'>
                  Elevación de superficie de agua
                </p>
                <div className='text-xs text-purple-400'>
                  Dimensiones: {analysisResults.timeSteps} ×{' '}
                  {analysisResults.cellCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visualizadores de datos después del análisis */}
      {state.hdfData && !state.isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          {/* Visualizador de Condiciones de Contorno */}
          <div>
            <BoundaryConditionsViewer state={state} />
          </div>

          {/* Tabla Simple de Valores de Manning */}
          <div>
            <SimpleManningTable state={state} />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DataAnalyzer;
