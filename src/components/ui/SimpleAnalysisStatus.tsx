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

interface SimpleAnalysisStatusProps {
  state: AnalysisState;
  className?: string;
}

/**
 * 📊 Componente Simple de Estado del Análisis
 * 
 * Versión minimalista y cool del estado del análisis
 * para mostrar encima del footer.
 */
export const SimpleAnalysisStatus: React.FC<SimpleAnalysisStatusProps> = ({ 
  state, 
  className = ''
}) => {
  // 🎨 Configuración de elementos de estado
  const statusItems = [
    {
      id: 'hdf',
      icon: Database,
      isActive: !!state.selectedHDFFile,
      label: 'HDF'
    },
    {
      id: 'terrain',
      icon: MapPin,
      isActive: !!state.selectedTerrainFile,
      label: 'Terreno'
    },
    {
      id: 'analysis',
      icon: Play,
      isActive: !!state.hdfData,
      isProcessing: state.isAnalyzing,
      label: 'Análisis'
    },
    {
      id: 'export',
      icon: Download,
      isActive: state.exportedVTKFiles.length > 0,
      count: state.exportedVTKFiles.length,
      label: 'Export'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex items-center justify-center gap-6 px-6 py-3',
        'bg-[#131414]/90 backdrop-blur-md border border-white/10 rounded-lg',
        'shadow-lg shadow-black/20',
        className
      )}
    >
      {statusItems.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            {/* Icono con estado */}
            <div className="relative">
              <Icon 
                className={cn(
                  'h-4 w-4 transition-all duration-300',
                  item.isActive 
                    ? 'text-green-400' 
                    : 'text-gray-500',
                  item.isProcessing && 'animate-pulse text-blue-400'
                )}
              />
              
              {/* Indicador de estado activo */}
              {item.isActive && !item.isProcessing && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-[#131414]"
                />
              )}
              
              {/* Indicador de procesamiento */}
              {item.isProcessing && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full border border-[#131414]"
                />
              )}
            </div>

            {/* Label */}
            <span 
              className={cn(
                'text-xs font-medium transition-colors duration-300',
                item.isActive 
                  ? 'text-white' 
                  : 'text-gray-500'
              )}
            >
              {item.label}
            </span>

            {/* Contador para exportación */}
            {item.id === 'export' && item.count && item.count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-mono text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full"
              >
                {item.count}
              </motion.span>
            )}

            {/* Separador */}
            {index < statusItems.length - 1 && (
              <div className="w-px h-4 bg-white/20 ml-2" />
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default SimpleAnalysisStatus;
