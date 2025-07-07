/**
 * 🌿 Manning Analysis Section - Análisis de Valores de Manning
 *
 * Esta sección maneja el análisis completo de valores de Manning:
 * - Visualización de tablas interactivas
 * - Valores base y de calibración
 * - Análisis de zonas de rugosidad
 * - Comparación de coeficientes
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TreePine,
  Table,
  BarChart3,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AnalyzerPlusState } from '../../index';
import { useTauri } from '@/hooks/useTauri';

interface ManningAnalysisSectionProps {
  state: AnalyzerPlusState;
  updateState: (updates: Partial<AnalyzerPlusState>) => void;
}

interface ManningZone {
  name: string;
  value: number;
  description: string;
  area_coverage?: number;
  calibration_factor?: number;
}

export const ManningAnalysisSection: React.FC<ManningAnalysisSectionProps> = ({
  state,
  updateState,
}) => {
  const { rasCommander } = useTauri();
  const [showDetails, setShowDetails] = useState(true);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  // 🔄 Función para cargar valores de Manning
  const loadManningValues = async () => {
    if (!state.selectedHDFFile) {
      toast.error('Debe cargar un archivo HDF primero');
      return;
    }

    try {
      updateState({ isLoadingManning: true });

      const result = await rasCommander.getManningValues(
        state.selectedHDFFile,
        state.selectedTerrainFile || undefined
      );

      if (result.success) {
        updateState({
          manningValues: result.data,
          analysisResults: {
            projectSummary: state.analysisResults?.projectSummary,
            meshAnalysis: state.analysisResults?.meshAnalysis,
            hydrographAnalysis: state.analysisResults?.hydrographAnalysis,
            manningAnalysis: result.data,
          },
          isLoadingManning: false,
        });
        toast.success('Valores de Manning cargados exitosamente');
      } else {
        throw new Error(result.error || 'Error al cargar valores de Manning');
      }
    } catch (error) {
      console.error('Error loading Manning values:', error);
      toast.error('Error al cargar valores de Manning');
      updateState({ isLoadingManning: false });
    }
  };

  // 🎯 Función para alternar selección de zonas
  const toggleZoneSelection = (zoneName: string) => {
    const newSelection = new Set(selectedZones);
    if (newSelection.has(zoneName)) {
      newSelection.delete(zoneName);
    } else {
      newSelection.add(zoneName);
    }
    setSelectedZones(newSelection);
  };

  // 📊 Datos reales de Manning del estado
  const manningZones = state.manningValues?.zones || [];

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
          <div className='p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-400/30'>
            <TreePine className='h-6 w-6 text-green-400' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-white'>
              Análisis de Manning
            </h2>
            <p className='text-white/70'>Valores de rugosidad y calibración</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2'
          >
            {showDetails ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
          </button>

          <button
            onClick={loadManningValues}
            disabled={state.isLoadingManning}
            className='px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2'
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                state.isLoadingManning && 'animate-spin'
              )}
            />
            Actualizar
          </button>
        </div>
      </motion.div>

      {/* 📊 Tabla principal de valores de Manning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden'
      >
        <div className='p-6 border-b border-white/10'>
          <h3 className='text-lg font-semibold text-white flex items-center gap-2'>
            <Table className='h-5 w-5 text-green-400' />
            Valores de Manning por Zona
          </h3>
        </div>

        {manningZones.length === 0 ? (
          <div className='text-center py-12'>
            <TreePine className='h-12 w-12 text-white/30 mx-auto mb-4' />
            <h4 className='text-lg font-medium text-white/70 mb-2'>
              No hay datos de Manning
            </h4>
            <p className='text-white/50'>
              Cargue un archivo HDF y ejecute el análisis en la sección
              &quot;Proyecto&quot; para ver los valores de Manning.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-white/5'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                    Zona
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                    Valor n
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                    Cobertura (%)
                  </th>
                  {showDetails && (
                    <>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                        Factor Calibración
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                        Descripción
                      </th>
                    </>
                  )}
                  <th className='px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider'>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/10'>
                {manningZones.map((zone: ManningZone, index: number) => (
                  <motion.tr
                    key={zone.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      'hover:bg-white/5 transition-colors',
                      selectedZones.has(zone.name) && 'bg-green-500/10'
                    )}
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={selectedZones.has(zone.name)}
                          onChange={() => toggleZoneSelection(zone.name)}
                          className='rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500'
                        />
                        <div className='text-sm font-medium text-white'>
                          {zone.name}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-white font-mono bg-white/10 px-2 py-1 rounded'>
                        {zone.value.toFixed(3)}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='text-sm text-white'>
                          {zone.area_coverage?.toFixed(1)}%
                        </div>
                        <div className='w-16 bg-white/20 rounded-full h-2'>
                          <div
                            className='bg-green-400 h-2 rounded-full'
                            style={{ width: `${zone.area_coverage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    {showDetails && (
                      <>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div
                            className={cn(
                              'text-sm px-2 py-1 rounded',
                              zone.calibration_factor === 1.0
                                ? 'text-green-400 bg-green-400/20'
                                : zone.calibration_factor! > 1.0
                                  ? 'text-orange-400 bg-orange-400/20'
                                  : 'text-blue-400 bg-blue-400/20'
                            )}
                          >
                            {zone.calibration_factor?.toFixed(2)}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='text-sm text-white/70 max-w-xs truncate'>
                            {zone.description}
                          </div>
                        </td>
                      </>
                    )}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <button className='text-blue-400 hover:text-blue-300 text-sm'>
                        Ver Detalles
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 📈 Resumen estadístico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className='grid grid-cols-1 md:grid-cols-4 gap-4'
      >
        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <BarChart3 className='h-4 w-4 text-blue-400' />
            <span className='text-sm text-white/70'>Valor Promedio</span>
          </div>
          <div className='text-xl font-bold text-white'>
            {manningZones.length > 0
              ? (
                  manningZones.reduce(
                    (sum: number, zone: ManningZone) => sum + zone.value,
                    0
                  ) / manningZones.length
                ).toFixed(3)
              : 'N/A'}
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <TreePine className='h-4 w-4 text-green-400' />
            <span className='text-sm text-white/70'>Zonas Totales</span>
          </div>
          <div className='text-xl font-bold text-white'>
            {manningZones.length}
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Eye className='h-4 w-4 text-purple-400' />
            <span className='text-sm text-white/70'>Seleccionadas</span>
          </div>
          <div className='text-xl font-bold text-white'>
            {selectedZones.size}
          </div>
        </div>

        <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <Download className='h-4 w-4 text-orange-400' />
            <span className='text-sm text-white/70'>Exportar</span>
          </div>
          <button
            className='text-sm text-orange-400 hover:text-orange-300 transition-colors'
            onClick={() => toast.info('Función de exportación en desarrollo')}
          >
            CSV / JSON
          </button>
        </div>
      </motion.div>
    </div>
  );
};
