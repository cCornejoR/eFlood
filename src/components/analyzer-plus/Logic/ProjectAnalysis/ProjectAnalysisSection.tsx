/**
 * 📊 Project Analysis Section - Análisis Completo del Proyecto
 *
 * Esta sección maneja el análisis completo del proyecto HEC-RAS:
 * - Carga de archivos HDF y terreno
 * - Extracción de metadata del proyecto
 * - Resumen ejecutivo del análisis
 * - Información general del modelo
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Play,
  CheckCircle,
  Info,
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
import { invoke } from '@tauri-apps/api/core';

interface ProjectAnalysisSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

export const ProjectAnalysisSection: React.FC<ProjectAnalysisSectionProps> = ({
  state,
  updateState,
}) => {
  const { system } = useTauri();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{
    hdf?: { size: string; modified: string; loadTime: string };
    terrain?: { size: string; modified: string; loadTime: string };
  }>({});

  // 🎯 Configuración para la animación de análisis con progreso realista
  const analysisSteps = [
    {
      title: 'Inicializando análisis...',
      frames: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      duration: 400,
      repeatCount: 1,
    },
    {
      title: 'Leyendo archivo HDF...',
      frames: [
        [10, 11, 12],
        [13, 14, 15],
        [16, 17, 18],
      ],
      duration: 350,
      repeatCount: 1,
    },
    {
      title: 'Extrayendo información de malla...',
      frames: [
        [20, 21, 22],
        [23, 24, 25],
        [26, 27, 28],
      ],
      duration: 300,
      repeatCount: 1,
    },
    {
      title: 'Procesando valores de Manning...',
      frames: [
        [30, 31, 32],
        [33, 34, 35],
        [36, 37, 38],
      ],
      duration: 320,
      repeatCount: 1,
    },
    {
      title: 'Generando series temporales...',
      frames: [
        [40, 41, 42],
        [43, 44, 45],
        [46, 47, 48],
      ],
      duration: 280,
      repeatCount: 1,
    },
    {
      title: 'Finalizando análisis...',
      frames: [
        [0, 7, 14, 21, 28, 35, 42],
        [1, 8, 15, 22, 29, 36, 43],
        [2, 9, 16, 23, 30, 37, 44],
      ],
      duration: 250,
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

  // � Función para obtener información real del archivo
  const getFileInfo = async (filePath: string) => {
    try {
      const fileStats = await system.getFileInfo(filePath);

      // Convertir bytes a MB
      const sizeInMB = (fileStats.size / (1024 * 1024)).toFixed(2);

      // Formatear fecha de modificación
      const modifiedDate = new Date(fileStats.modified * 1000); // Unix timestamp a Date

      return {
        size: `${sizeInMB} MB`,
        modified: modifiedDate.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
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
        size: 'Error',
        modified: 'Error',
        loadTime: new Date().toLocaleTimeString('es-ES'),
      };
    }
  };

  // 🔄 Efecto para cargar información de archivos cuando cambian
  useEffect(() => {
    const loadFileInfo = async () => {
      const newFileInfo: typeof fileInfo = {};

      if (state.selectedHDFFile) {
        newFileInfo.hdf = await getFileInfo(state.selectedHDFFile);
      }

      if (state.selectedTerrainFile) {
        newFileInfo.terrain = await getFileInfo(state.selectedTerrainFile);
      }

      setFileInfo(newFileInfo);
    };

    loadFileInfo();
  }, [state.selectedHDFFile, state.selectedTerrainFile]);

  // �🔬 Función para ejecutar análisis completo del proyecto
  const executeProjectAnalysis = async () => {
    if (!state.selectedHDFFile) {
      toast.error('Debe seleccionar un archivo HDF primero');
      return;
    }

    try {
      updateState({ isLoadingProject: true });
      setAnalysisProgress(10);

      // Paso 1: Obtener información completa de la malla usando RAS Commander
      setAnalysisProgress(30);

      console.log('🔷 Obteniendo información de malla con RAS Commander...');
      const meshInfo = await invoke('get_comprehensive_mesh_info', {
        hdfFilePath: state.selectedHDFFile,
        terrainFilePath: state.selectedTerrainFile || null,
      }) as any;
      console.log('🔷 Resultado de información de malla:', meshInfo);

      // Paso 2: Obtener valores de Manning usando RAS Commander
      setAnalysisProgress(50);

      console.log('🌿 Obteniendo valores de Manning con RAS Commander...');
      const manningValues = await invoke('get_manning_values_enhanced', {
        hdfFilePath: state.selectedHDFFile,
        terrainFilePath: state.selectedTerrainFile || null,
      }) as any;
      console.log('🌿 Resultado de valores de Manning:', manningValues);

      // Paso 3: Obtener series temporales usando RAS Commander
      setAnalysisProgress(70);

      // Obtener primera malla disponible para análisis temporal
      const meshNames =
        meshInfo.success && meshInfo.data?.mesh_areas
          ? meshInfo.data.mesh_areas
          : ['2D Area 1'];

      console.log('📈 Obteniendo series temporales con RAS Commander...');
      const timeSeriesData = await invoke('get_time_series_data', {
        hdfFilePath: state.selectedHDFFile,
        meshName: meshNames[0] || '2D Area 1',
        variable: 'Water Surface',
        terrainFilePath: state.selectedTerrainFile || null,
      }) as any;
      console.log('📈 Resultado de series temporales:', timeSeriesData);

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
          projectSummary,
          manningAnalysis: manningValues.success ? manningValues.data : null,
          meshAnalysis: meshInfo.success ? meshInfo.data : null,
          hydrographAnalysis: timeSeriesData.success ? timeSeriesData.data : null,
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
    <div className='h-full p-4 sm:p-6 pb-8 pt-6'>
      <div className='w-full max-w-7xl mx-auto space-y-4 sm:space-y-6'>
        {/* 📋 Header de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 sm:mb-6'
        >
        </motion.div>

        {/* 📁 Sección de carga de archivos - Solo mostrar si no hay análisis completo */}
        {!state.analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6'
          >
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
        )}

        {/* 📋 Información de Archivos Cargados - Solo mostrar si no hay análisis completo */}
        {(state.selectedHDFFile || state.selectedTerrainFile) && !state.isLoadingProject && !state.analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 sm:p-6'
          >
            <h3 className='text-base sm:text-lg font-semibold text-white mb-4 flex items-center gap-2'>
              <Info className='h-5 w-5 text-blue-400' />
              Información de Archivos Cargados
            </h3>

            {state.selectedHDFFile && (
              <div className='bg-white/5 rounded-lg p-4 mb-4 border border-green-400/30'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                  <span className='text-green-400 font-medium'>Archivo HDF de Resultados</span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-white/70'>Ruta del archivo:</span>
                    <div className='text-white font-mono text-xs mt-1 break-all'>
                      {state.selectedHDFFile}
                    </div>
                  </div>
                  <div>
                    <span className='text-white/70'>Fecha de modificación:</span>
                    <div className='text-white mt-1'>
                      {fileInfo.hdf?.modified || 'Obteniendo...'}
                    </div>
                  </div>
                  <div>
                    <span className='text-white/70'>Tamaño:</span>
                    <div className='text-white mt-1'>
                      {fileInfo.hdf?.size || 'Obteniendo...'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {state.selectedTerrainFile && (
              <div className='bg-white/5 rounded-lg p-4 border border-purple-400/30'>
                <div className='flex items-center gap-2 mb-3'>
                  <div className='w-2 h-2 bg-purple-400 rounded-full'></div>
                  <span className='text-purple-400 font-medium'>Archivo de Terreno (Opcional)</span>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm'>
                  <div>
                    <span className='text-white/70'>Ruta del archivo:</span>
                    <div className='text-white font-mono text-xs mt-1 break-all'>
                      {state.selectedTerrainFile}
                    </div>
                  </div>
                  <div>
                    <span className='text-white/70'>Fecha de modificación:</span>
                    <div className='text-white mt-1'>
                      {fileInfo.terrain?.modified || 'Obteniendo...'}
                    </div>
                  </div>
                  <div>
                    <span className='text-white/70'>Tamaño:</span>
                    <div className='text-white mt-1'>
                      {fileInfo.terrain?.size || 'Obteniendo...'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 🔬 Sección de análisis - Solo mostrar si no hay análisis completo */}
        {!state.analysisResults && (state.isLoadingProject ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col items-center justify-center py-16 space-y-8'
          >
            <DotFlow
              items={analysisSteps}
              className='mx-auto'
              backgroundColor='bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
            />
            <div className='w-64 bg-white/10 rounded-full h-2'>
              <div
                className='bg-blue-400 h-2 rounded-full transition-all duration-300'
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='flex justify-center'
          >
            <button
              onClick={executeProjectAnalysis}
              disabled={!state.selectedHDFFile}
              className={cn(
                'px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 text-lg font-medium',
                state.selectedHDFFile
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              )}
            >
              <Play className='h-5 w-5' />
              Continuar al Análisis
            </button>
          </motion.div>
        ))}

        {/* 📊 Resultados del análisis - Vista completamente nueva */}
        {state.analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='space-y-6'
          >
            {/* Header de éxito */}
            <div className='text-center py-8'>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4'
              >
                <CheckCircle className='h-8 w-8 text-green-400' />
              </motion.div>
              <h2 className='text-2xl font-bold text-white mb-2'>
                ¡Análisis Completado Exitosamente!
              </h2>
              <p className='text-white/70'>
                Todos los datos han sido procesados y están listos para visualizar
              </p>
            </div>

            {/* Información del Proyecto - Detallada */}
            <div className='bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/30 p-6'>
              <h3 className='text-xl font-semibold text-white mb-6 flex items-center gap-3'>
                <Database className='h-6 w-6 text-blue-400' />
                Resumen Ejecutivo del Análisis
              </h3>

              {/* Estadísticas principales */}
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                <div className='bg-white/5 rounded-xl p-4 text-center'>
                  <div className='text-2xl font-bold text-blue-400'>
                    {state.analysisResults?.cellCount?.toLocaleString() ||
                     state.meshInfo?.data?.total_areas ||
                     state.meshInfo?.areas_found ||
                     state.meshInfo?.cell_count?.toLocaleString() || '0'}
                  </div>
                  <div className='text-xs text-white/70'>Celdas de Malla</div>
                </div>

                <div className='bg-white/5 rounded-xl p-4 text-center'>
                  <div className='text-2xl font-bold text-green-400'>
                    {state.analysisResults?.manningZones ||
                     state.manningValues?.zones_found ||
                     state.manningValues?.data?.total_manning_zones ||
                     state.manningValues?.existing_method?.manning_data?.total_zones || '0'}
                  </div>
                  <div className='text-xs text-white/70'>Zonas Manning</div>
                </div>

                <div className='bg-white/5 rounded-xl p-4 text-center'>
                  <div className='text-2xl font-bold text-purple-400'>
                    {state.analysisResults?.flowAreas ||
                     state.meshInfo?.data?.mesh_areas?.length ||
                     state.meshInfo?.mesh_names?.length || '0'}
                  </div>
                  <div className='text-xs text-white/70'>Áreas 2D</div>
                </div>

                <div className='bg-white/5 rounded-xl p-4 text-center'>
                  <div className='text-2xl font-bold text-orange-400'>
                    {state.analysisResults?.timeSteps ||
                     state.manningValues?.calibration_zones ||
                     state.manningValues?.data?.total_calibration_zones ||
                     state.timeSeriesData?.time_steps?.length || '0'}
                  </div>
                  <div className='text-xs text-white/70'>Pasos Temporales</div>
                </div>
              </div>

              {/* Información detallada */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <h4 className='text-lg font-medium text-white flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-blue-400' />
                    Información del Archivo
                  </h4>

                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-white/70'>Archivo:</span>
                      <span className='text-white font-medium'>
                        {state.projectMetadata.file_info?.hdf_file?.split('\\').pop() || 'N/A'}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Tamaño:</span>
                      <span className='text-white font-medium'>
                        {fileInfo.hdf?.size || 'Calculando...'}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Modificado:</span>
                      <span className='text-white font-medium'>
                        {fileInfo.hdf?.modified || 'Obteniendo...'}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Análisis:</span>
                      <span className='text-green-400 font-medium flex items-center gap-1'>
                        <div className='w-2 h-2 bg-green-400 rounded-full'></div>
                        Completo
                      </span>
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h4 className='text-lg font-medium text-white flex items-center gap-2'>
                    <Layers className='h-5 w-5 text-purple-400' />
                    Datos Extraídos
                  </h4>

                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-white/70'>Geometría:</span>
                      <span className='text-white font-medium'>
                        {state.meshInfo?.node_count?.toLocaleString() || '0'} nodos
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Área Total:</span>
                      <span className='text-white font-medium'>
                        {state.meshInfo?.total_area ? `${(state.meshInfo.total_area / 1000000).toFixed(2)} km²` : 'N/A'}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Condiciones de Contorno:</span>
                      <span className='text-white font-medium'>
                        {state.timeSeriesData?.boundary_conditions?.length || '0'} encontradas
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-white/70'>Duración Simulación:</span>
                      <span className='text-white font-medium'>
                        {state.timeSeriesData?.simulation_duration || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>







            {/* Navegación a otras secciones - Compacta */}
            <div className='bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-600/30 p-4'>
              <h3 className='text-lg font-semibold text-white mb-3 text-center'>
                ¡Datos listos para visualizar!
              </h3>
              <p className='text-white/70 text-center text-sm mb-4'>
                Navega a las siguientes secciones para explorar los resultados en detalle
              </p>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div className='bg-green-500/10 border border-green-400/30 rounded-lg p-3 text-center hover:bg-green-500/20 transition-colors'>
                  <TreePine className='h-6 w-6 text-green-400 mx-auto mb-1' />
                  <h4 className='text-white font-medium text-sm mb-1'>Manning</h4>
                  <p className='text-white/60 text-xs'>Tabla completa de valores de rugosidad</p>
                </div>

                <div className='bg-purple-500/10 border border-purple-400/30 rounded-lg p-3 text-center hover:bg-purple-500/20 transition-colors'>
                  <Layers className='h-6 w-6 text-purple-400 mx-auto mb-1' />
                  <h4 className='text-white font-medium text-sm mb-1'>Malla</h4>
                  <p className='text-white/60 text-xs'>Geometría y datos de celdas</p>
                </div>

                <div className='bg-orange-500/10 border border-orange-400/30 rounded-lg p-3 text-center hover:bg-orange-500/20 transition-colors'>
                  <Clock className='h-6 w-6 text-orange-400 mx-auto mb-1' />
                  <h4 className='text-white font-medium text-sm mb-1'>Hidrogramas</h4>
                  <p className='text-white/60 text-xs'>Series temporales y análisis de flujo</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
