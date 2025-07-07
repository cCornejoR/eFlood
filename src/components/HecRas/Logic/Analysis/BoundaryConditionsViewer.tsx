import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Waves, TrendingUp, BarChart3, Info, Activity } from 'lucide-react';
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

export const BoundaryConditionsViewer: React.FC<
  BoundaryConditionsViewerProps
> = ({ state }) => {
  const [boundaryConditions, setBoundaryConditions] = useState<
    BoundaryCondition[]
  >([]);
  const [selectedBoundary, setSelectedBoundary] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<any>({});

  useEffect(() => {
    if (state.boundaryConditions && state.boundaryConditions.success) {
      try {
        // Parse boundary conditions data directly (no need for JSON parsing if it's already an object)
        let bcData;
        if (typeof state.boundaryConditions.data === 'string') {
          // Clean data before parsing JSON
          let cleanData = state.boundaryConditions.data;
          cleanData = cleanData
            .replace(/\bNaN\b/g, '0')
            .replace(/\bInfinity\b/g, '0')
            .replace(/\b-Infinity\b/g, '0')
            .replace(/\bnull\b/g, '0');
          bcData = JSON.parse(cleanData);
        } else {
          // Data is already an object
          bcData = state.boundaryConditions.data;
        }

        // Get all boundary conditions and remove duplicates
        const allBCs = bcData.boundary_conditions || [];

        // Remove duplicates based on name and type
        const uniqueBCs = allBCs.filter(
          (
            bc: BoundaryCondition,
            index: number,
            array: BoundaryCondition[]
          ) => {
            return (
              array.findIndex(
                item => item.name === bc.name && item.type === bc.type
              ) === index
            );
          }
        );

        // Filter to keep only meaningful boundary conditions (not generic groups)
        const specificBCs = uniqueBCs.filter((bc: BoundaryCondition) => {
          const name = bc.name.toLowerCase();

          // Exclude generic group names
          if (
            name.includes('boundary conditions') ||
            name.includes('flow hydrographs') ||
            name.includes('stage hydrographs')
          ) {
            return false;
          }

          // Keep specific boundary condition names
          return (
            name.includes('entrada') ||
            name.includes('salida') ||
            name.includes('rio') ||
            name.includes('bcline') ||
            name.includes('inlet') ||
            name.includes('outlet') ||
            name.includes('inflow') ||
            name.includes('outflow') ||
            bc.type === 'Caudal de Entrada' ||
            bc.type === 'Nivel de Salida' ||
            bc.type === 'Hidrograma de Caudal' ||
            bc.type === 'Hidrograma de Nivel'
          );
        });

        console.log('🌊 Boundary Conditions Debug:');
        console.log('  - All BCs:', allBCs.length);
        console.log('  - Unique BCs:', uniqueBCs.length);
        console.log('  - Specific BCs:', specificBCs.length);
        console.log(
          '  - Final BCs:',
          specificBCs.map((bc: BoundaryCondition) => `${bc.name} (${bc.type})`)
        );

        setBoundaryConditions(specificBCs);
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
          Asegúrate de que el archivo contenga datos de condiciones de contorno
          válidos.
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
      {/* Compact Header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <Waves className='h-5 w-5 text-blue-400' />
          <h3 className='text-lg font-bold text-white'>
            Condiciones de Contorno
          </h3>
          <span className='text-blue-400 text-sm font-medium bg-blue-500/20 px-2 py-1 rounded'>
            {boundaryConditions.length}
          </span>
        </div>
      </div>

      {/* Boundary Conditions Grid - Horizontal Layout */}
      <div className='grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {boundaryConditions.map((bc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all cursor-pointer ${
              selectedBoundary === bc.name
                ? 'ring-2 ring-blue-400/50 bg-blue-500/10'
                : ''
            }`}
            onClick={() => setSelectedBoundary(bc.name)}
          >
            {/* Compact Header */}
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                {getBoundaryIcon(bc.type)}
                <h4 className='text-white font-medium text-sm truncate'>
                  {bc.name}
                </h4>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded border whitespace-nowrap ml-2 ${getBoundaryTypeColor(bc.type)}`}
              >
                {bc.type}
              </span>
            </div>

            {/* Compact Info Row */}
            <div className='flex items-center justify-between text-xs'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-2 h-2 rounded-full ${bc.data_available ? 'bg-green-400' : 'bg-gray-500'}`}
                />
                <span className='text-white/60'>
                  {bc.data_available ? `${bc.time_steps} pasos` : 'Sin datos'}
                </span>
              </div>
              {bc.data_available && (
                <span className='text-blue-400 font-medium'>Disponible</span>
              )}
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
              Aquí se mostraría el hidrograma y datos detallados de la condición
              de contorno seleccionada.
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

      {/* Compact Summary Stats */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='flex items-center gap-2 mb-1'>
            <Waves className='h-4 w-4 text-blue-400' />
            <h4 className='font-medium text-white text-sm'>Total</h4>
          </div>
          <p className='text-xl font-bold text-blue-400'>
            {boundaryConditions.length}
          </p>
        </div>

        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='flex items-center gap-2 mb-1'>
            <Activity className='h-4 w-4 text-green-400' />
            <h4 className='font-medium text-white text-sm'>Con Datos</h4>
          </div>
          <p className='text-xl font-bold text-green-400'>
            {boundaryConditions.filter(bc => bc.data_available).length}
          </p>
        </div>

        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='flex items-center gap-2 mb-1'>
            <TrendingUp className='h-4 w-4 text-purple-400' />
            <h4 className='font-medium text-white text-sm'>Máx. Pasos</h4>
          </div>
          <p className='text-xl font-bold text-purple-400'>
            {Math.max(...boundaryConditions.map(bc => bc.time_steps), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};
