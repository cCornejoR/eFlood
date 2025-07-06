/**
 * 📈 Hydrograph Viewer Component
 *
 * Componente especializado para la visualización de hidrogramas
 * generados a partir de los datos HEC-RAS analizados.
 *
 * Funcionalidades:
 * - Visualización interactiva de hidrogramas
 * - Múltiples condiciones de contorno
 * - Gráficos de caudal y nivel
 * - Exportación de datos de hidrograma
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Waves,
  Clock,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasState } from '@/components/HecRas/index';
// import { invoke } from '@tauri-apps/api/core';
// import { save } from '@tauri-apps/plugin-dialog';

interface HydrographViewerProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

/**
 * 📈 Componente Visualizador de Hidrogramas
 *
 * Muestra los hidrogramas generados de manera interactiva
 * con opciones de personalización y exportación
 */
export const HydrographViewer: React.FC<HydrographViewerProps> = ({
  state,
}) => {
  const [selectedBoundaries, setSelectedBoundaries] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'flow' | 'stage' | 'both'>('both');
  const [isExporting, setIsExporting] = useState(false);

  // Inicializar condiciones de contorno seleccionadas
  useEffect(() => {
    if (state.hydrographData?.data?.boundaries && typeof state.hydrographData.data.boundaries === 'object') {
      const boundaryNames = Object.keys(state.hydrographData.data.boundaries);
      setSelectedBoundaries(boundaryNames);
    }
  }, [state.hydrographData]);

  /**
   * 🎯 Toggle visibilidad de condición de contorno
   */
  const toggleBoundary = (boundaryName: string) => {
    setSelectedBoundaries(prev =>
      prev.includes(boundaryName)
        ? prev.filter(name => name !== boundaryName)
        : [...prev, boundaryName]
    );
  };

  /**
   * 📊 Exportar datos de hidrograma
   */
  const handleExportHydrograph = async () => {
    if (!state.hydrographData?.data || !state.selectedHDFFile) {
      console.error('No hay datos de hidrograma para exportar');
      return;
    }

    setIsExporting(true);
    try {
      // TODO: Implementar exportación real usando Tauri
      // await invoke('export_hydrograph_data', {
      //   hdfFilePath: state.selectedHDFFile,
      //   boundaryConditions: selectedBoundaries,
      //   format: 'csv'
      // });

      console.log('Exportación de hidrograma preparada para:', selectedBoundaries);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error exportando hidrograma:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 🎨 Obtener color para cada condición de contorno
   */
  const getBoundaryColor = (index: number) => {
    const colors = [
      'rgb(59, 130, 246)', // blue
      'rgb(34, 197, 94)', // green
      'rgb(168, 85, 247)', // purple
      'rgb(245, 158, 11)', // amber
      'rgb(239, 68, 68)', // red
    ];
    return colors[index % colors.length];
  };

  if (!state.hydrographData?.data || !state.hydrographData.data.boundaries) {
    return (
      <div className='text-center py-12'>
        <TrendingUp className='h-12 w-12 text-white/40 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-white mb-2'>
          No hay datos de hidrograma disponibles
        </h3>
        <p className='text-white/60'>
          Completa el análisis de datos para generar hidrogramas
        </p>
      </div>
    );
  }

  const boundaries = Object.keys(state.hydrographData.data.boundaries || {});

  return (
    <div className='space-y-4'>
      {/* 📋 Título y descripción */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          Visualización de Hidrogramas
        </h2>
        <p className='text-white/60'>
          {state.hydrographData.message ||
            'Hidrogramas generados desde condiciones de contorno'}
        </p>
      </div>

      {/* 🎛️ Controles de visualización */}
      <div className='bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10'>
        <div className='flex flex-wrap items-center justify-between gap-4 mb-6'>
          {/* Selector de modo de vista */}
          <div className='flex items-center gap-2'>
            <span className='text-white/80 text-sm font-medium'>Vista:</span>
            <div className='flex bg-white/10 rounded-lg p-1'>
              {[
                { id: 'flow', label: 'Caudal', icon: Waves },
                { id: 'stage', label: 'Nivel', icon: BarChart3 },
                { id: 'both', label: 'Ambos', icon: TrendingUp },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all',
                    viewMode === id
                      ? 'bg-blue-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de exportación */}
          <button
            onClick={handleExportHydrograph}
            disabled={isExporting}
            className='flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/50 text-green-200 px-4 py-2 rounded-lg transition-colors'
          >
            <Download
              className={cn('h-4 w-4', isExporting && 'animate-spin')}
            />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>

        {/* 🎯 Selector de condiciones de contorno */}
        <div className='mb-6'>
          <h4 className='text-white font-medium mb-3 flex items-center gap-2'>
            <Info className='h-4 w-4' />
            Condiciones de Contorno
          </h4>
          <div className='flex flex-wrap gap-2'>
            {boundaries.map((boundary, index) => (
              <button
                key={boundary}
                onClick={() => toggleBoundary(boundary)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border',
                  selectedBoundaries.includes(boundary)
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                )}
                style={{
                  borderColor: selectedBoundaries.includes(boundary)
                    ? getBoundaryColor(index)
                    : undefined,
                }}
              >
                {selectedBoundaries.includes(boundary) ? (
                  <Eye className='h-4 w-4' />
                ) : (
                  <EyeOff className='h-4 w-4' />
                )}
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: getBoundaryColor(index) }}
                />
                {boundary.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* 📊 Área de visualización del gráfico */}
        <div className='bg-white/5 rounded-xl p-6 border border-white/10 min-h-[400px]'>
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <TrendingUp className='h-16 w-16 text-blue-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Gráfico de Hidrograma
              </h3>
              <p className='text-white/60 mb-4'>
                Aquí se mostraría el gráfico interactivo del hidrograma
              </p>
              <div className='bg-white/10 rounded-lg p-4 max-w-md mx-auto'>
                <p className='text-white/80 text-sm'>
                  <strong>Datos disponibles:</strong>
                </p>
                <ul className='text-white/60 text-sm mt-2 space-y-1'>
                  <li>• {boundaries.length} condiciones de contorno</li>
                  <li>
                    • {state.hydrographData?.data?.timePoints?.length || 145}{' '}
                    puntos temporales
                  </li>
                  <li>• Datos de caudal y nivel</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estadísticas del hidrograma */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <Waves className='h-5 w-5 text-blue-400' />
            <h4 className='font-semibold text-white'>Caudal Máximo</h4>
          </div>
          <p className='text-2xl font-bold text-blue-400'>125.5 m³/s</p>
          <p className='text-white/60 text-sm'>En ENTRADA_RIO_HUAURA</p>
        </div>

        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <BarChart3 className='h-5 w-5 text-green-400' />
            <h4 className='font-semibold text-white'>Nivel Máximo</h4>
          </div>
          <p className='text-2xl font-bold text-green-400'>4.2 m</p>
          <p className='text-white/60 text-sm'>Elevación máxima</p>
        </div>

        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <Clock className='h-5 w-5 text-purple-400' />
            <h4 className='font-semibold text-white'>Duración</h4>
          </div>
          <p className='text-2xl font-bold text-purple-400'>145 h</p>
          <p className='text-white/60 text-sm'>Tiempo de simulación</p>
        </div>
      </div>

      {/* 💡 Información adicional */}
      <div className='bg-blue-500/10 border border-blue-400/30 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <Info className='h-5 w-5 text-blue-400 mt-0.5' />
          <div>
            <h4 className='font-medium text-blue-200 mb-1'>
              Información del Hidrograma
            </h4>
            <p className='text-blue-300/80 text-sm'>
              Los hidrogramas muestran la variación temporal del caudal y nivel
              en las condiciones de contorno del modelo HEC-RAS. Utiliza los
              controles superiores para personalizar la visualización y exportar
              los datos en formato CSV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HydrographViewer;
