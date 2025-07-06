import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  TrendingUp,
  BarChart3,
  Download,
  Eye,
  Info,
  Activity,
} from 'lucide-react';
import { HecRasState } from '../../index';
import { HydrographChart } from './HydrographChart';

interface BoundaryConditionsViewerProps {
  state: HecRasState;
}

interface BoundaryCondition {
  name: string;
  type: string;
  description: string;
  data_available: boolean;
  time_steps: number;
  path: string;
}

export const BoundaryConditionsViewer: React.FC<BoundaryConditionsViewerProps> = ({
  state,
}) => {
  const [boundaryConditions, setBoundaryConditions] = useState<BoundaryCondition[]>([]);
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<any>({});

  useEffect(() => {
    if (state.boundaryConditions && state.boundaryConditions.success) {
      try {
        const bcData = JSON.parse(state.boundaryConditions.data);
        setBoundaryConditions(bcData.boundary_conditions || []);
        setTimeSeriesData(bcData.time_series || {});
      } catch (error) {
        console.error('Error parsing boundary conditions:', error);
        setBoundaryConditions([]);
        setTimeSeriesData({});
      }
    }
  }, [state.boundaryConditions]);

  const getBoundaryTypeColor = (type: string) => {
    switch (type) {
      case 'Caudal':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'Nivel':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getBoundaryIcon = (type: string) => {
    switch (type) {
      case 'Caudal':
        return <Waves className='h-4 w-4' />;
      case 'Nivel':
        return <TrendingUp className='h-4 w-4' />;
      default:
        return <Activity className='h-4 w-4' />;
    }
  };

  if (!state.boundaryConditions || !state.boundaryConditions.success) {
    return (
      <div className='bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/20'>
        <div className='flex items-center gap-3 mb-3'>
          <Info className='h-5 w-5 text-yellow-400' />
          <h3 className='text-yellow-400 font-medium'>
            Condiciones de Contorno No Disponibles
          </h3>
        </div>
        <p className='text-yellow-300 text-sm'>
          No se pudieron extraer las condiciones de contorno del archivo HDF5.
          Asegúrate de que el archivo contenga datos de condiciones de contorno válidos.
        </p>
      </div>
    );
  }

  if (boundaryConditions.length === 0) {
    return (
      <div className='bg-gray-500/10 rounded-lg p-6 border border-gray-500/20'>
        <div className='flex items-center gap-3 mb-3'>
          <Info className='h-5 w-5 text-gray-400' />
          <h3 className='text-gray-400 font-medium'>
            Sin Condiciones de Contorno
          </h3>
        </div>
        <p className='text-gray-300 text-sm'>
          No se encontraron condiciones de contorno en este archivo HDF5.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-bold text-white flex items-center gap-3'>
            <Waves className='h-6 w-6 text-blue-400' />
            Condiciones de Contorno
          </h3>
          <p className='text-white/60 text-sm mt-1'>
            {boundaryConditions.length} condiciones encontradas en el modelo
          </p>
        </div>
      </div>

      {/* Boundary Conditions Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {boundaryConditions.map((bc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer ${
              selectedBoundary === bc.name ? 'ring-2 ring-blue-400/50' : ''
            }`}
            onClick={() => setSelectedBoundary(bc.name)}
          >
            {/* Header */}
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-2'>
                {getBoundaryIcon(bc.type)}
                <h4 className='text-white font-medium text-sm truncate'>
                  {bc.name}
                </h4>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded border ${getBoundaryTypeColor(bc.type)}`}
              >
                {bc.type}
              </span>
            </div>

            {/* Description */}
            <p className='text-white/60 text-xs mb-3 line-clamp-2'>
              {bc.description}
            </p>

            {/* Stats */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-white/50'>Datos disponibles:</span>
                <span className={bc.data_available ? 'text-green-400' : 'text-red-400'}>
                  {bc.data_available ? 'Sí' : 'No'}
                </span>
              </div>
              {bc.data_available && (
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-white/50'>Pasos temporales:</span>
                  <span className='text-blue-400'>{bc.time_steps}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='flex items-center gap-2 mt-3 pt-3 border-t border-white/10'>
              <button
                className='flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded transition-colors'
                disabled={!bc.data_available}
              >
                <Eye className='h-3 w-3' />
                Ver
              </button>
              <button
                className='flex items-center gap-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs rounded transition-colors'
                disabled={!bc.data_available}
              >
                <Download className='h-3 w-3' />
                Exportar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Boundary Details */}
      {selectedBoundary && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='bg-white/5 rounded-xl p-6 border border-white/10'
        >
          <h4 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-blue-400' />
            Detalles: {selectedBoundary}
          </h4>
          
          <div className='bg-white/5 rounded-lg p-4'>
            <p className='text-white/60 text-sm mb-4'>
              Aquí se mostraría el hidrograma y datos detallados de la condición de contorno seleccionada.
            </p>
            
            {/* Hydrograph Chart */}
            <HydrographChart
              boundaryConditions={boundaryConditions}
              timeSeriesData={timeSeriesData}
              selectedBoundary={selectedBoundary}
            />
          </div>
        </motion.div>
      )}

      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <Waves className='h-5 w-5 text-blue-400' />
            <h4 className='font-semibold text-white'>Total Condiciones</h4>
          </div>
          <p className='text-2xl font-bold text-blue-400'>{boundaryConditions.length}</p>
        </div>

        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <Activity className='h-5 w-5 text-green-400' />
            <h4 className='font-semibold text-white'>Con Datos</h4>
          </div>
          <p className='text-2xl font-bold text-green-400'>
            {boundaryConditions.filter(bc => bc.data_available).length}
          </p>
        </div>

        <div className='bg-white/5 rounded-lg p-4 border border-white/10'>
          <div className='flex items-center gap-3 mb-2'>
            <TrendingUp className='h-5 w-5 text-purple-400' />
            <h4 className='font-semibold text-white'>Máx. Pasos</h4>
          </div>
          <p className='text-2xl font-bold text-purple-400'>
            {Math.max(...boundaryConditions.map(bc => bc.time_steps), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};
