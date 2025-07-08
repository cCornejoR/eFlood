/**
 * 🔷 Mesh Analysis Section - Análisis de Malla y Geometría
 *
 * Esta sección maneja el análisis completo de la malla:
 * - Información de geometría y coordenadas
 * - Datos de celdas y elementos
 * - Estadísticas de la malla
 * - Visualización de propiedades geométricas
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Grid3X3,
  MapPin,
  Layers,
  BarChart3,
  RefreshCw,
  Download,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzerPlusState } from '../../index';
import { useTauri } from '@/hooks/useTauri';

interface MeshAnalysisSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

export const MeshAnalysisSection: React.FC<MeshAnalysisSectionProps> = ({
  state,
  updateState,
}) => {
  const { rasCommander } = useTauri();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'cells' | 'coordinates'
  >('overview');

  // 🔄 Función para cargar información de la malla
  const loadMeshInfo = async () => {
    if (!state.selectedHDFFile) {
      toast.error('Debe cargar un archivo HDF primero');
      return;
    }

    try {
      updateState({ isLoadingMesh: true });

      const result = await rasCommander.getMeshInfo(
        state.selectedHDFFile,
        state.selectedTerrainFile || undefined
      );

      if (result.success) {
        updateState({
          meshInfo: result.data,
          analysisResults: {
            projectSummary: state.analysisResults?.projectSummary,
            manningAnalysis: state.analysisResults?.manningAnalysis,
            hydrographAnalysis: state.analysisResults?.hydrographAnalysis,
            meshAnalysis: result.data,
          },
          isLoadingMesh: false,
        });
        toast.success('Información de malla cargada exitosamente');
      } else {
        throw new Error(result.error || 'Error al cargar información de malla');
      }
    } catch (error) {
      console.error('Error loading mesh info:', error);
      toast.error('Error al cargar información de malla');
      updateState({ isLoadingMesh: false });
    }
  };

  // 📊 Datos reales de la malla
  const meshStats = state.meshInfo;

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
          <div className='p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-400/30'>
            <Grid3X3 className='h-6 w-6 text-purple-400' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>Análisis de Malla</h2>
            <p className='text-white/70'>
              Geometría, coordenadas y datos de celdas
            </p>
          </div>
        </div>

        <button
          onClick={loadMeshInfo}
          disabled={state.isLoadingMesh}
          className='px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2'
        >
          <RefreshCw
            className={cn('h-4 w-4', state.isLoadingMesh && 'animate-spin')}
          />
          Actualizar
        </button>
      </motion.div>

      {/* 🎛️ Navegación por tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='flex gap-1 bg-white/5 p-1 rounded-lg'
      >
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'cells', label: 'Celdas', icon: Grid3X3 },
          { id: 'coordinates', label: 'Coordenadas', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className='h-4 w-4' />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* 📊 Contenido según tab activo */}
      {!meshStats ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center py-12'
        >
          <Grid3X3 className='h-12 w-12 text-white/30 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-white/70 mb-2'>
            No hay datos de malla
          </h4>
          <p className='text-white/50'>
            Cargue un archivo HDF y ejecute el análisis en la sección
            &quot;Proyecto&quot; para ver la información de la malla.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className='space-y-6'
        >
          {activeTab === 'overview' && (
            <>
              {/* Estadísticas generales */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Grid3X3 className='h-4 w-4 text-purple-400' />
                    <span className='text-sm text-white/70'>Total Celdas</span>
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {meshStats.total_cells?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MapPin className='h-4 w-4 text-blue-400' />
                    <span className='text-sm text-white/70'>Total Nodos</span>
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {meshStats.total_nodes?.toLocaleString() || 'N/A'}
                  </div>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Layers className='h-4 w-4 text-green-400' />
                    <span className='text-sm text-white/70'>
                      Áreas de Malla
                    </span>
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {meshStats.mesh_areas || 'N/A'}
                  </div>
                </div>

                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <BarChart3 className='h-4 w-4 text-orange-400' />
                    <span className='text-sm text-white/70'>
                      Tamaño Promedio
                    </span>
                  </div>
                  <div className='text-2xl font-bold text-white'>
                    {meshStats.cell_size_avg?.toFixed(1) || 'N/A'} m
                  </div>
                </div>
              </div>

              {/* Información del sistema de coordenadas */}
              <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <Info className='h-5 w-5 text-blue-400' />
                  Sistema de Coordenadas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <div className='text-sm text-white/70 mb-1'>Sistema</div>
                    <div className='text-white font-medium'>
                      {meshStats.coordinate_system || 'No especificado'}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-white/70 mb-1'>Límites</div>
                    <div className='text-white font-mono text-sm'>
                      X: {meshStats.bounds?.min_x?.toFixed(2)} -{' '}
                      {meshStats.bounds?.max_x?.toFixed(2)}
                      <br />
                      Y: {meshStats.bounds?.min_y?.toFixed(2)} -{' '}
                      {meshStats.bounds?.max_y?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'cells' && (
            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Información de Celdas
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='text-sm text-white/70 mb-1'>
                    Tamaño Mínimo
                  </div>
                  <div className='text-xl font-bold text-green-400'>
                    {meshStats.cell_size_min?.toFixed(1) || 'N/A'} m
                  </div>
                </div>
                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='text-sm text-white/70 mb-1'>
                    Tamaño Promedio
                  </div>
                  <div className='text-xl font-bold text-blue-400'>
                    {meshStats.cell_size_avg?.toFixed(1) || 'N/A'} m
                  </div>
                </div>
                <div className='bg-white/5 rounded-lg p-4'>
                  <div className='text-sm text-white/70 mb-1'>
                    Tamaño Máximo
                  </div>
                  <div className='text-xl font-bold text-orange-400'>
                    {meshStats.cell_size_max?.toFixed(1) || 'N/A'} m
                  </div>
                </div>
              </div>
              <div className='mt-4 text-center'>
                <button
                  className='px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto'
                  onClick={() =>
                    toast.info('Tabla detallada de celdas en desarrollo')
                  }
                >
                  <Download className='h-4 w-4' />
                  Ver Tabla Completa
                </button>
              </div>
            </div>
          )}

          {activeTab === 'coordinates' && (
            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
              <h3 className='text-lg font-semibold text-white mb-4'>
                Coordenadas y Límites
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-white/5 rounded-lg p-4'>
                    <div className='text-sm text-white/70 mb-2'>
                      Coordenadas X
                    </div>
                    <div className='space-y-1'>
                      <div className='text-white'>
                        Min: {meshStats.bounds?.min_x?.toFixed(2)}
                      </div>
                      <div className='text-white'>
                        Max: {meshStats.bounds?.max_x?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className='bg-white/5 rounded-lg p-4'>
                    <div className='text-sm text-white/70 mb-2'>
                      Coordenadas Y
                    </div>
                    <div className='space-y-1'>
                      <div className='text-white'>
                        Min: {meshStats.bounds?.min_y?.toFixed(2)}
                      </div>
                      <div className='text-white'>
                        Max: {meshStats.bounds?.max_y?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='text-center'>
                  <button
                    className='px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto'
                    onClick={() =>
                      toast.info('Exportación de coordenadas en desarrollo')
                    }
                  >
                    <Download className='h-4 w-4' />
                    Exportar Coordenadas
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
