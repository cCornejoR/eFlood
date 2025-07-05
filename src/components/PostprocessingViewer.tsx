import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Download, 
  Play, 
  BarChart3, 
  Map, 
  FileText, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  FolderOpen,
  Zap,
  Activity,
  TrendingUp,
  Layers
} from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from './ui/toast';

interface PostprocessingViewerProps {}

interface ProcessingState {
  hdfFile: string | null;
  terrainFile: string | null;
  isProcessing: boolean;
  isDataLoaded: boolean;
  results: any | null;
  plotImages: { [key: string]: string };
}

const PostprocessingViewer: React.FC<PostprocessingViewerProps> = () => {
  const { showToast, ToastContainer } = useToast();
  
  const [state, setState] = useState<ProcessingState>({
    hdfFile: null,
    terrainFile: null,
    isProcessing: false,
    isDataLoaded: false,
    results: null,
    plotImages: {}
  });

  const [activeTab, setActiveTab] = useState<'load' | 'analyze' | 'plot' | 'export'>('load');

  // Función para cargar archivo HDF
  const handleLoadHDF = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'HEC-RAS Result Files',
            extensions: ['hdf', 'h5', 'hdf5']
          }
        ],
        title: 'Seleccionar archivo de resultados HEC-RAS (p##.hdf)'
      });

      if (selected && typeof selected === 'string') {
        setState(prev => ({ ...prev, hdfFile: selected }));
        showToast(`Archivo HDF cargado: ${selected.split('/').pop()}`, 'success');
      }
    } catch (error) {
      console.error('Error loading HDF file:', error);
      showToast('Error al cargar archivo HDF', 'error');
    }
  };

  // Función para cargar archivo de terreno
  const handleLoadTerrain = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Terrain Files',
            extensions: ['tif', 'tiff', 'asc', 'xyz']
          }
        ],
        title: 'Seleccionar archivo de terreno (DEM)'
      });

      if (selected && typeof selected === 'string') {
        setState(prev => ({ ...prev, terrainFile: selected }));
        showToast(`Archivo de terreno cargado: ${selected.split('/').pop()}`, 'success');
      }
    } catch (error) {
      console.error('Error loading terrain file:', error);
      showToast('Error al cargar archivo de terreno', 'error');
    }
  };

  // Función para procesar datos con pyHMT2D
  const handleProcessData = async () => {
    if (!state.hdfFile) {
      showToast('Primero debes cargar un archivo HDF', 'error');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const result = await invoke('process_hec_ras_data', {
        hdfFilePath: state.hdfFile,
        terrainFilePath: state.terrainFile
      });

      if ((result as any).success) {
        const processedData = JSON.parse((result as any).data);
        setState(prev => ({ 
          ...prev, 
          isDataLoaded: true, 
          results: processedData,
          isProcessing: false 
        }));
        showToast('Datos procesados exitosamente', 'success');
        setActiveTab('analyze');
      } else {
        throw new Error((result as any).error || 'Error en el procesamiento');
      }
    } catch (error) {
      console.error('Error processing data:', error);
      showToast('Error al procesar los datos', 'error');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Función para crear hidrograma
  const handleCreateHydrograph = async (cellId?: number) => {
    if (!state.isDataLoaded) {
      showToast('Primero debes procesar los datos', 'error');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const result = await invoke('create_hydrograph_pyHMT2D', {
        hdfFilePath: state.hdfFile,
        cellId: cellId || 0,
        terrainFilePath: state.terrainFile
      });

      if ((result as any).success) {
        const plotData = JSON.parse((result as any).data);
        setState(prev => ({ 
          ...prev, 
          plotImages: { ...prev.plotImages, hydrograph: plotData.image },
          isProcessing: false 
        }));
        showToast('Hidrograma generado exitosamente', 'success');
        setActiveTab('plot');
      } else {
        throw new Error((result as any).error || 'Error generando hidrograma');
      }
    } catch (error) {
      console.error('Error creating hydrograph:', error);
      showToast('Error al generar hidrograma', 'error');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Función para crear mapa de profundidades
  const handleCreateDepthMap = async () => {
    if (!state.isDataLoaded) {
      showToast('Primero debes procesar los datos', 'error');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const result = await invoke('create_depth_map_pyHMT2D', {
        hdfFilePath: state.hdfFile,
        terrainFilePath: state.terrainFile
      });

      if ((result as any).success) {
        const plotData = JSON.parse((result as any).data);
        setState(prev => ({ 
          ...prev, 
          plotImages: { ...prev.plotImages, depthMap: plotData.image },
          isProcessing: false 
        }));
        showToast('Mapa de profundidades generado exitosamente', 'success');
        setActiveTab('plot');
      } else {
        throw new Error((result as any).error || 'Error generando mapa');
      }
    } catch (error) {
      console.error('Error creating depth map:', error);
      showToast('Error al generar mapa de profundidades', 'error');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Función para crear perfil longitudinal
  const handleCreateProfile = async () => {
    if (!state.isDataLoaded) {
      showToast('Primero debes procesar los datos', 'error');
      return;
    }

    try {
      setState(prev => ({ ...prev, isProcessing: true }));

      const result = await invoke('create_profile_pyHMT2D', {
        hdfFilePath: state.hdfFile,
        terrainFilePath: state.terrainFile
      });

      if ((result as any).success) {
        const plotData = JSON.parse((result as any).data);
        setState(prev => ({ 
          ...prev, 
          plotImages: { ...prev.plotImages, profile: plotData.image },
          isProcessing: false 
        }));
        showToast('Perfil longitudinal generado exitosamente', 'success');
        setActiveTab('plot');
      } else {
        throw new Error((result as any).error || 'Error generando perfil');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      showToast('Error al generar perfil longitudinal', 'error');
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Función para exportar a VTK
  const handleExportVTK = async () => {
    if (!state.isDataLoaded) {
      showToast('Primero debes procesar los datos', 'error');
      return;
    }

    try {
      const result = await invoke('export_to_vtk_pyHMT2D', {
        hdfFilePath: state.hdfFile,
        terrainFilePath: state.terrainFile
      });

      if ((result as any).success) {
        const exportData = JSON.parse((result as any).data);
        showToast(`Archivos VTK exportados a: ${exportData.output_directory}`, 'success');
      } else if ((result as any).error === "Exportación cancelada por el usuario") {
        showToast('Exportación cancelada', 'info');
      } else {
        throw new Error((result as any).error || 'Error en exportación');
      }
    } catch (error) {
      console.error('Error exporting VTK:', error);
      showToast('Error al exportar archivos VTK', 'error');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="w-full min-h-[calc(100vh-120px)] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-white mb-4">
              <span className="eflow-brand">eFlow</span> - Postprocesamiento Avanzado
            </h1>
            <p className="text-gray-400 text-lg">
              Análisis y visualización de datos HEC-RAS 2D con pyHMT2D
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-600/50 mb-6">
            {[
              { key: 'load', label: 'Cargar Datos', icon: Upload },
              { key: 'analyze', label: 'Analizar', icon: Activity },
              { key: 'plot', label: 'Visualizar', icon: BarChart3 },
              { key: 'export', label: 'Exportar', icon: Download }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === key
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Load Data Tab */}
              {activeTab === 'load' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* HDF File Loader */}
                    <motion.div
                      className="p-6 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-400/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Upload className="h-6 w-6 text-blue-400" />
                        <h3 className="text-xl font-semibold text-white">Archivo HDF de Resultados</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Carga el archivo de resultados de HEC-RAS (formato p##.hdf)
                      </p>
                      {state.hdfFile ? (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm">{state.hdfFile.split('/').pop()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            <span className="text-yellow-300 text-sm">Archivo requerido</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleLoadHDF}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200"
                      >
                        <Upload className="h-4 w-4 inline mr-2" />
                        Cargar Archivo HDF
                      </button>
                    </motion.div>

                    {/* Terrain File Loader */}
                    <motion.div
                      className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-400/20 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Map className="h-6 w-6 text-green-400" />
                        <h3 className="text-xl font-semibold text-white">Archivo de Terreno</h3>
                      </div>
                      <p className="text-gray-400 mb-4">
                        Carga el DEM/terreno (formato .tif, .asc, opcional)
                      </p>
                      {state.terrainFile ? (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm">{state.terrainFile.split('/').pop()}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-gray-500/20 border border-gray-400/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300 text-sm">Opcional</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleLoadTerrain}
                        className="w-full px-4 py-2 bg-gradient-to-r from-green-500/30 to-emerald-400/30 border border-green-400/20 text-white rounded-lg hover:from-green-500/40 hover:to-emerald-400/40 transition-all duration-200"
                      >
                        <Map className="h-4 w-4 inline mr-2" />
                        Cargar Terreno
                      </button>
                    </motion.div>
                  </div>

                  {/* Process Button */}
                  {state.hdfFile && (
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      <button
                        onClick={handleProcessData}
                        disabled={state.isProcessing}
                        className="px-8 py-3 bg-gradient-to-r from-purple-500/30 to-pink-400/30 border border-purple-400/20 text-white rounded-lg hover:from-purple-500/40 hover:to-pink-400/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {state.isProcessing ? (
                          <>
                            <Loader2 className="h-5 w-5 inline mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 inline mr-2" />
                            Procesar Datos
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Analyze Tab */}
              {activeTab === 'analyze' && (
                <div className="space-y-6">
                  {state.isDataLoaded ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Data Summary */}
                      <motion.div
                        className="p-6 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-xl border border-gray-400/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-400" />
                          Información del Modelo
                        </h3>
                        {state.results && (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Celdas:</span>
                              <span className="text-white text-sm">{state.results.num_cells || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Pasos tiempo:</span>
                              <span className="text-white text-sm">{state.results.num_time_steps || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm">Áreas 2D:</span>
                              <span className="text-white text-sm">{state.results.area_names?.length || 'N/A'}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>

                      {/* Quick Actions */}
                      <motion.div
                        className="p-6 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-400/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-400" />
                          Acciones Rápidas
                        </h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => handleCreateHydrograph()}
                            disabled={state.isProcessing}
                            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-green-500/20 to-emerald-400/20 border border-green-400/20 text-white rounded hover:from-green-500/30 hover:to-emerald-400/30 transition-all duration-200 disabled:opacity-50"
                          >
                            <TrendingUp className="h-4 w-4 inline mr-2" />
                            Hidrograma
                          </button>
                          <button
                            onClick={handleCreateDepthMap}
                            disabled={state.isProcessing}
                            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border border-blue-400/20 text-white rounded hover:from-blue-500/30 hover:to-cyan-400/30 transition-all duration-200 disabled:opacity-50"
                          >
                            <Layers className="h-4 w-4 inline mr-2" />
                            Mapa Profundidad
                          </button>
                          <button
                            onClick={handleCreateProfile}
                            disabled={state.isProcessing}
                            className="w-full px-3 py-2 text-sm bg-gradient-to-r from-purple-500/20 to-pink-400/20 border border-purple-400/20 text-white rounded hover:from-purple-500/30 hover:to-pink-400/30 transition-all duration-200 disabled:opacity-50"
                          >
                            <BarChart3 className="h-4 w-4 inline mr-2" />
                            Perfil Longitudinal
                          </button>
                        </div>
                      </motion.div>

                      {/* Status */}
                      <motion.div
                        className="p-6 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-400/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Settings className="h-5 w-5 text-green-400" />
                          Estado del Procesamiento
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm">Datos cargados</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm">pyHMT2D inicializado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-300 text-sm">Listo para análisis</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">Sin Datos Procesados</h3>
                      <p className="text-gray-400 mb-6">
                        Primero debes cargar y procesar un archivo HDF
                      </p>
                      <button
                        onClick={() => setActiveTab('load')}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200"
                      >
                        Ir a Cargar Datos
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Plot Tab */}
              {activeTab === 'plot' && (
                <div className="space-y-6">
                  {Object.keys(state.plotImages).length > 0 ? (
                    <div className="grid gap-6">
                      {Object.entries(state.plotImages).map(([plotType, imageData]) => (
                        <motion.div
                          key={plotType}
                          className="p-6 bg-gradient-to-r from-gray-600/10 to-gray-700/10 rounded-xl border border-gray-400/20 backdrop-blur-sm"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                            {plotType === 'hydrograph' ? 'Hidrograma' : 
                             plotType === 'depthMap' ? 'Mapa de Profundidades' :
                             plotType === 'profile' ? 'Perfil Longitudinal' : plotType}
                          </h3>
                          <div className="bg-white rounded-lg p-4">
                            <img
                              src={`data:image/png;base64,${imageData}`}
                              alt={plotType}
                              className="w-full h-auto rounded"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">Sin Visualizaciones</h3>
                      <p className="text-gray-400 mb-6">
                        Genera gráficos desde la pestaña de análisis
                      </p>
                      <button
                        onClick={() => setActiveTab('analyze')}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200"
                      >
                        Ir a Analizar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Export Tab */}
              {activeTab === 'export' && (
                <div className="space-y-6">
                  {state.isDataLoaded ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div
                        className="p-6 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl border border-purple-400/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Download className="h-6 w-6 text-purple-400" />
                          <h3 className="text-xl font-semibold text-white">Exportar a VTK</h3>
                        </div>
                        <p className="text-gray-400 mb-6">
                          Exporta los resultados a formato VTK para visualización en ParaView
                        </p>
                        <button
                          onClick={handleExportVTK}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500/30 to-pink-400/30 border border-purple-400/20 text-white rounded-lg hover:from-purple-500/40 hover:to-pink-400/40 transition-all duration-200"
                        >
                          <FolderOpen className="h-5 w-5 inline mr-2" />
                          Seleccionar Carpeta y Exportar
                        </button>
                      </motion.div>

                      <motion.div
                        className="p-6 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-xl border border-blue-400/20 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Info className="h-6 w-6 text-blue-400" />
                          <h3 className="text-xl font-semibold text-white">Información VTK</h3>
                        </div>
                        <div className="space-y-3 text-sm text-gray-300">
                          <p>• Los archivos VTK contienen la malla 2D completa</p>
                          <p>• Variables incluidas: profundidad, velocidad, WSE</p>
                          <p>• Compatible con ParaView y VisIt</p>
                          <p>• Un archivo por paso de tiempo</p>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-white mb-2">Sin Datos para Exportar</h3>
                      <p className="text-gray-400 mb-6">
                        Primero debes cargar y procesar un archivo HDF
                      </p>
                      <button
                        onClick={() => setActiveTab('load')}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200"
                      >
                        Ir a Cargar Datos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default PostprocessingViewer;