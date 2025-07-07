import React from 'react';
import { motion } from 'framer-motion';
import { Database, MapPin, Play, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

// 🎯 Interfaz para el estado del análisis
interface AnalysisState {
  selectedHDFFile: string | null;
  selectedTerrainFile: string | null;
  hdfData: any;
  isAnalyzing: boolean;
  exportedVTKFiles: string[];
}

interface AnalysisStatusProps {
  state: AnalysisState;
  className?: string;
  compact?: boolean;
}

/**
 * 📊 Componente de Estado del Análisis
 *
 * Muestra el estado actual del análisis HDF de forma compacta
 * para ser usado en el footer o en otras partes de la aplicación.
 */
export const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
  state,
  className = '',
  compact = false,
}) => {
  // 🎨 Configuración de elementos de estado
  const statusItems = [
    {
      id: 'hdf',
      icon: Database,
      label: 'Archivo HDF',
      status: state.selectedHDFFile ? 'Cargado' : 'No cargado',
      isActive: !!state.selectedHDFFile,
      color: state.selectedHDFFile ? 'text-green-400' : 'text-gray-400',
    },
    {
      id: 'terrain',
      icon: MapPin,
      label: 'Terreno',
      status: state.selectedTerrainFile ? 'Cargado' : 'Opcional',
      isActive: !!state.selectedTerrainFile,
      color: state.selectedTerrainFile ? 'text-green-400' : 'text-gray-400',
    },
    {
      id: 'analysis',
      icon: Play,
      label: 'Análisis',
      status: state.isAnalyzing
        ? 'Procesando...'
        : state.hdfData
          ? 'Completado'
          : 'Pendiente',
      isActive: !!state.hdfData,
      color: state.hdfData ? 'text-green-400' : 'text-gray-400',
    },
    {
      id: 'export',
      icon: Download,
      label: 'Exportación',
      status: `${state.exportedVTKFiles.length} archivos VTK`,
      isActive: state.exportedVTKFiles.length > 0,
      color:
        state.exportedVTKFiles.length > 0 ? 'text-green-400' : 'text-gray-400',
    },
  ];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center gap-3 ${className}`}
      >
        {statusItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id} className='flex items-center gap-1'>
              <Icon className={cn('h-3 w-3', item.color)} />
              {item.id === 'export' && state.exportedVTKFiles.length > 0 && (
                <span className='text-xs font-mono text-green-400'>
                  {state.exportedVTKFiles.length}
                </span>
              )}
              {item.isActive && item.id !== 'export' && (
                <div className='w-1 h-1 bg-green-400 rounded-full'></div>
              )}
            </div>
          );
        })}

        {/* Indicador de procesamiento */}
        {state.isAnalyzing && (
          <div className='flex items-center gap-1'>
            <div className='w-1 h-1 bg-blue-400 rounded-full animate-pulse'></div>
            <span className='text-xs text-blue-400'>Procesando...</span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10 ${className}`}
    >
      <h3 className='text-base font-semibold text-white mb-3'>
        Estado del Análisis
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
        {statusItems.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className='flex items-center gap-2 p-2 bg-white/5 rounded-lg'
            >
              <Icon className={cn('h-4 w-4', item.color)} />
              <div>
                <p className='text-xs font-medium text-white'>{item.label}</p>
                <p className='text-xs text-white/60'>{item.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AnalysisStatus;
