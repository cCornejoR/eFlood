/**
 * 🌿 Manning Values Viewer Component
 * 
 * Displays calibrated Manning's n values from HEC-RAS model
 * Shows a comprehensive table with land cover types and roughness coefficients
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TreePine,
  Info,
  Eye,
  EyeOff,
  BarChart3,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasState } from '../../index';

interface ManningValuesViewerProps {
  state: HecRasState;
}

interface ManningZone {
  name: string;
  value: number;
  description: string;
}

interface ManningData {
  success: boolean;
  manning_data?: {
    success: boolean;
    manning_zones: Record<string, ManningZone>;
    total_zones: number;
    table_data: Array<[number, string, string, string]>;
    formatted_table: string;
  };
  table_printed?: boolean;
  error?: string;
}

/**
 * 🌿 Manning Values Viewer Component
 */
export const ManningValuesViewer: React.FC<ManningValuesViewerProps> = ({
  state,
}) => {
  const [showDetails, setShowDetails] = useState(true);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'value'>('value');

  // Parse Manning data with flexible validation
  const manningData: ManningData | null = state.manningValues;

  // Debug logging
  console.log('🌿 ManningValuesViewer Debug:', {
    manningData,
    hasData: !!manningData,
    success: manningData?.success,
    manning_data: manningData?.manning_data,
    manning_zones: manningData?.manning_data?.manning_zones,
    zones_keys: manningData?.manning_data?.manning_zones ? Object.keys(manningData?.manning_data?.manning_zones) : []
  });

  const hasManningData = !!(
    manningData?.success &&
    manningData?.manning_data?.manning_zones &&
    Object.keys(manningData.manning_data.manning_zones).length > 0
  );

  console.log('🌿 ManningValuesViewer Validation:', {
    hasManningData,
    step1_success: !!manningData?.success,
    step2_manning_data: !!manningData?.manning_data,
    step3_manning_zones: !!manningData?.manning_data?.manning_zones,
    step4_zones_count: manningData?.manning_data?.manning_zones ? Object.keys(manningData.manning_data.manning_zones).length : 0
  });

  const manningZones = manningData?.manning_data?.manning_zones || {};
  const totalZones = manningData?.manning_data?.total_zones || 0;

  // Convert to array and sort
  const manningArray = Object.entries(manningZones).map(([id, zone]) => ({
    id: parseInt(id),
    ...zone,
  }));

  const sortedManning = manningArray.sort((a, b) => {
    switch (sortBy) {
      case 'id':
        return a.id - b.id;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return a.value - b.value;
      default:
        return 0;
    }
  });

  // Get Manning value statistics
  const getManningStats = () => {
    if (manningArray.length === 0) return null;
    
    const values = manningArray.map(m => m.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  };

  const stats = getManningStats();

  // Get color for Manning value
  const getManningColor = (value: number) => {
    if (value < 0.020) return 'text-blue-400';
    if (value < 0.030) return 'text-cyan-400';
    if (value < 0.040) return 'text-green-400';
    if (value < 0.050) return 'text-yellow-400';
    if (value < 0.070) return 'text-orange-400';
    if (value < 0.100) return 'text-red-400';
    return 'text-purple-400';
  };

  if (!hasManningData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TreePine className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Valores de Manning
          </h3>
        </div>
        
        <div className="flex items-center gap-3 text-gray-400">
          <Info className="w-4 h-4" />
          <span>
            {manningData?.error 
              ? `Error: ${manningData.error}`
              : 'No hay valores de Manning disponibles. Ejecuta el análisis primero.'
            }
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TreePine className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">
            Valores de Manning Calibrados
          </h3>
          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
            {totalZones} zonas
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showDetails
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            {showDetails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400">Mínimo</div>
            <div className="text-lg font-semibold text-blue-400">
              {stats.min.toFixed(4)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400">Máximo</div>
            <div className="text-lg font-semibold text-red-400">
              {stats.max.toFixed(4)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400">Promedio</div>
            <div className="text-lg font-semibold text-yellow-400">
              {stats.avg.toFixed(4)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm text-gray-400">Total</div>
            <div className="text-lg font-semibold text-green-400">
              {stats.count}
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-400">Ordenar por:</span>
        {(['id', 'name', 'value'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option)}
            className={cn(
              "px-3 py-1 rounded text-sm transition-colors",
              sortBy === option
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            )}
          >
            {option === 'id' ? 'ID' : option === 'name' ? 'Nombre' : 'Valor'}
          </button>
        ))}
      </div>

      {/* Manning Values Table */}
      {showDetails && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">
                  ID
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">
                  Tipo de Cobertura
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">
                  Manning n
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-400">
                  Descripción
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedManning.map((manning, index) => (
                <motion.tr
                  key={manning.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-3 px-2 text-sm text-gray-300">
                    {manning.id}
                  </td>
                  <td className="py-3 px-2 text-sm text-white font-medium">
                    {manning.name}
                  </td>
                  <td className="py-3 px-2">
                    <span className={cn(
                      "text-sm font-mono font-semibold",
                      getManningColor(manning.value)
                    )}>
                      {manning.value.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-400">
                    {manning.description}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>
            Valores calibrados extraídos del modelo HEC-RAS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span>
            Rango: {stats?.min.toFixed(3)} - {stats?.max.toFixed(3)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
