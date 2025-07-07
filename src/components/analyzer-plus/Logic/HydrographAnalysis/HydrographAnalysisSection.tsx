/**
 * 📈 Hydrograph Analysis Section - Análisis de Hidrogramas
 *
 * Esta sección maneja el análisis completo de hidrogramas:
 * - Visualización de series temporales
 * - Gráficos interactivos de flujo
 * - Análisis de picos y tendencias
 * - Comparación de variables hidráulicas
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BarChart3,
  Waves,
  Clock,
  RefreshCw,
  Download,
  Play,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzerPlusState } from '../../index';
import { useTauri } from '@/hooks/useTauri';

interface HydrographAnalysisSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

export const HydrographAnalysisSection: React.FC<
  HydrographAnalysisSectionProps
> = ({ state, updateState }) => {
  const { rasCommander } = useTauri();
  const [selectedVariable, setSelectedVariable] =
    useState<string>('Water Surface');
  const [selectedMesh, setSelectedMesh] = useState<string>('2D Area 1');
  const [isPlaying, setIsPlaying] = useState(false);

  // Variables disponibles para análisis
  const availableVariables = [
    'Water Surface',
    'Velocity',
    'Depth',
    'Flow Rate',
    'Shear Stress',
  ];

  // 🔄 Función para cargar datos de series temporales
  const loadTimeSeriesData = async () => {
    if (!state.selectedHDFFile) {
      toast.error('Debe cargar un archivo HDF primero');
      return;
    }

    try {
      updateState({ isLoadingHydrograph: true });

      const result = await rasCommander.getTimeSeries(
        state.selectedHDFFile,
        selectedMesh,
        selectedVariable,
        state.selectedTerrainFile || undefined
      );

      if (result.success) {
        updateState({
          timeSeriesData: result.data,
          hydrographData: result.data,
          analysisResults: {
            projectSummary: state.analysisResults?.projectSummary,
            manningAnalysis: state.analysisResults?.manningAnalysis,
            meshAnalysis: state.analysisResults?.meshAnalysis,
            hydrographAnalysis: result.data,
          },
          isLoadingHydrograph: false,
        });
        toast.success('Datos de hidrograma cargados exitosamente');
      } else {
        throw new Error(result.error || 'Error al cargar datos de hidrograma');
      }
    } catch (error) {
      console.error('Error loading time series data:', error);
      toast.error('Error al cargar datos de hidrograma');
      updateState({ isLoadingHydrograph: false });
    }
  };

  // 📊 Datos reales de hidrograma
  const hydrographData = state.hydrographData;

  return (
    <div className='flex-1 overflow-auto p-6 pb-24 space-y-6'>
      {/* 📋 Header de la sección */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='flex items-center justify-between mb-6'
      >
        <div className='flex items-center gap-3'>
          <div className='p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-400/30'>
            <TrendingUp className='h-6 w-6 text-orange-400' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Análisis de Hidrogramas
            </h2>
            <p className='text-white/70'>
              Series temporales y análisis de flujo
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className='px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2'
          >
            {isPlaying ? (
              <Pause className='h-4 w-4' />
            ) : (
              <Play className='h-4 w-4' />
            )}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>

          <button
            onClick={loadTimeSeriesData}
            disabled={state.isLoadingHydrograph}
            className='px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2'
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                state.isLoadingHydrograph && 'animate-spin'
              )}
            />
            Actualizar
          </button>
        </div>
      </motion.div>

      {/* 🎛️ Controles de configuración */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
      >
        <h3 className='text-lg font-semibold text-white mb-4'>
          Configuración del Análisis
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm text-white/70 mb-2'>
              Área de Malla
            </label>
            <select
              value={selectedMesh}
              onChange={e => setSelectedMesh(e.target.value)}
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              <option value='2D Area 1'>2D Area 1</option>
              <option value='2D Area 2'>2D Area 2</option>
              <option value='2D Area 3'>2D Area 3</option>
            </select>
          </div>

          <div>
            <label className='block text-sm text-white/70 mb-2'>Variable</label>
            <select
              value={selectedVariable}
              onChange={e => setSelectedVariable(e.target.value)}
              className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500'
            >
              {availableVariables.map(variable => (
                <option key={variable} value={variable}>
                  {variable}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {!hydrographData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='text-center py-12'
        >
          <TrendingUp className='h-12 w-12 text-white/30 mx-auto mb-4' />
          <h4 className='text-lg font-medium text-white/70 mb-2'>
            No hay datos de hidrograma
          </h4>
          <p className='text-white/50'>
            Cargue un archivo HDF y ejecute el análisis en la sección
            &quot;Proyecto&quot; para ver los hidrogramas.
          </p>
        </motion.div>
      ) : (
        <>
          {/* 📊 Estadísticas del hidrograma */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
          >
            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <TrendingUp className='h-4 w-4 text-red-400' />
                <span className='text-sm text-white/70'>Pico Máximo</span>
              </div>
              <div className='text-2xl font-bold text-white'>
                {hydrographData.peak_value?.toFixed(1) || 'N/A'}
              </div>
              <div className='text-xs text-white/50'>
                {hydrographData.peak_time || 'N/A'}
              </div>
            </div>

            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Waves className='h-4 w-4 text-blue-400' />
                <span className='text-sm text-white/70'>Flujo Base</span>
              </div>
              <div className='text-2xl font-bold text-white'>
                {hydrographData.base_flow?.toFixed(1) || 'N/A'}
              </div>
            </div>

            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock className='h-4 w-4 text-green-400' />
                <span className='text-sm text-white/70'>Duración</span>
              </div>
              <div className='text-2xl font-bold text-white'>
                {hydrographData.duration_hours || 'N/A'} h
              </div>
            </div>

            <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <BarChart3 className='h-4 w-4 text-purple-400' />
                <span className='text-sm text-white/70'>Volumen Total</span>
              </div>
              <div className='text-2xl font-bold text-white'>
                {hydrographData.total_volume?.toFixed(1) || 'N/A'}
              </div>
            </div>
          </motion.div>

          {/* 📈 Área del gráfico (placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-white'>
                Gráfico del Hidrograma
              </h3>
              <button
                className='px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2'
                onClick={() =>
                  toast.info('Exportación de gráfico en desarrollo')
                }
              >
                <Download className='h-4 w-4' />
                Exportar
              </button>
            </div>

            {/* Placeholder para el gráfico */}
            <div className='h-64 bg-white/5 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center'>
              <div className='text-center'>
                <TrendingUp className='h-12 w-12 text-white/30 mx-auto mb-2' />
                <div className='text-white/50'>Gráfico del hidrograma</div>
                <div className='text-sm text-white/30'>
                  Variable: {selectedVariable}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 📊 Estadísticas detalladas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'
          >
            <h3 className='text-lg font-semibold text-white mb-4'>
              Estadísticas Detalladas
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
              {hydrographData.statistics &&
                Object.entries(hydrographData.statistics).map(
                  ([key, value]) => (
                    <div key={key} className='bg-white/5 rounded-lg p-3'>
                      <div className='text-xs text-white/70 mb-1 capitalize'>
                        {key.replace('_', ' ')}
                      </div>
                      <div className='text-lg font-bold text-white'>
                        {typeof value === 'number'
                          ? value.toFixed(2)
                          : String(value)}
                      </div>
                    </div>
                  )
                )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};
