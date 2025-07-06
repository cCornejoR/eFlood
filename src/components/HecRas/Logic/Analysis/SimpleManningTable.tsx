/**
 * 🌿 Professional Manning Table Component
 * Displays Manning zones and values with sorting, filtering, and export capabilities
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TreePine,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { HecRasState } from '../../index';

interface SimpleManningTableProps {
  state: HecRasState;
}

interface ManningZone {
  id: number;
  name: string;
  value: number;
  description?: string;
  landCoverType?: string;
}

// Column helper for type safety
const columnHelper = createColumnHelper<ManningZone>();

export const SimpleManningTable: React.FC<SimpleManningTableProps> = ({
  state,
}) => {
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Parse Manning data
  const manningData = state.manningValues;

  // Debug logging
  console.log('🌿 Manning Data Debug:', {
    manningData,
    hasData: !!manningData,
    success: manningData?.success,
    manning_data: manningData?.manning_data,
    manning_zones: manningData?.manning_data?.manning_zones,
    zones_keys: manningData?.manning_data?.manning_zones
      ? Object.keys(manningData?.manning_data?.manning_zones)
      : [],
  });

  // Check if we have valid Manning data - Simplified validation
  const hasManningData = !!(
    manningData?.success &&
    manningData?.manning_data?.manning_zones &&
    Object.keys(manningData.manning_data.manning_zones).length > 0
  );

  console.log('🌿 Validation Check:', {
    hasManningData,
    step1_success: !!manningData?.success,
    step2_manning_data: !!manningData?.manning_data,
    step3_manning_zones: !!manningData?.manning_data?.manning_zones,
    step4_zones_count: manningData?.manning_data?.manning_zones
      ? Object.keys(manningData.manning_data.manning_zones).length
      : 0,
  });

  const manningZones = manningData?.manning_data?.manning_zones || {};
  const totalZones = manningData?.manning_data?.total_zones || 0;

  // Convert zones to array for table display
  const zonesArray: ManningZone[] = useMemo(
    () =>
      Object.entries(manningZones)
        .map(([id, zone]: [string, any]) => ({
          id: parseInt(id),
          name: zone.name || `Zona ${id}`,
          value: zone.value || 0,
          description: zone.description || '',
          landCoverType: zone.land_cover_type || 'No especificado',
        }))
        .sort((a: any, b: any) => a.value - b.value), // Sort by Manning value
    [manningZones]
  );

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => (
          <span className='font-mono text-xs text-gray-400'>
            {info.getValue()}
          </span>
        ),
        size: 60,
      }),
      columnHelper.accessor('name', {
        header: 'Zona',
        cell: info => (
          <span className='font-medium text-white'>{info.getValue()}</span>
        ),
        size: 200,
      }),
      columnHelper.accessor('landCoverType', {
        header: 'Tipo de Cobertura',
        cell: info => (
          <span className='text-gray-300 text-sm'>{info.getValue()}</span>
        ),
        size: 180,
      }),
      columnHelper.accessor('value', {
        header: 'Manning n',
        cell: info => {
          const value = info.getValue();
          const colorClass =
            value > 0.1
              ? 'text-red-400'
              : value > 0.05
                ? 'text-yellow-400'
                : 'text-green-400';
          return (
            <span className={`font-mono font-bold ${colorClass}`}>
              {value.toFixed(4)}
            </span>
          );
        },
        size: 120,
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => (
          <span className='text-gray-400 text-sm'>
            {info.getValue() || 'Sin descripción'}
          </span>
        ),
        size: 250,
      }),
    ],
    []
  );

  // Configure table
  const table = useReactTable({
    data: zonesArray,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (!hasManningData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white/5 rounded-xl p-6 border border-white/10'
      >
        <div className='flex items-center gap-3 mb-4'>
          <TreePine className='h-6 w-6 text-green-400' />
          <h3 className='text-lg font-semibold text-white'>
            Valores de Manning
          </h3>
        </div>

<<<<<<< Updated upstream
        <div className="text-center py-8">
          <TreePine className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-white/60 text-sm mb-2">
=======
        <div className='text-center py-8'>
          <TreePine className='h-12 w-12 text-gray-600 mx-auto mb-4' />
          <p className='text-white/60 text-sm mb-2'>
>>>>>>> Stashed changes
            No hay valores de Manning disponibles. Ejecuta el análisis primero.
          </p>
          {manningData && !manningData.success && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4'>
              <div className='flex items-center gap-2 mb-2'>
                <AlertTriangle className='h-4 w-4 text-red-400' />
                <span className='text-red-400 text-sm font-medium'>Error</span>
              </div>
              <p className='text-red-300 text-xs'>
                {manningData.error ||
                  'Error desconocido al extraer valores de Manning'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Export function
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Zona',
      'Tipo de Cobertura',
      'Manning n',
      'Descripción',
    ];
    const csvContent = [
      headers.join(','),
      ...zonesArray.map(zone =>
        [
          zone.id,
          `"${zone.name}"`,
          `"${zone.landCoverType}"`,
          zone.value,
          `"${zone.description}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manning_values.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 rounded-xl p-6 border border-white/10'
    >
      {/* Header with Controls */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <TreePine className='h-6 w-6 text-green-400' />
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Valores de Manning
            </h3>
            <p className='text-sm text-gray-400'>
              {table.getFilteredRowModel().rows.length} de {totalZones} zonas
              mostradas
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-3'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Buscar...'
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className='pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all'
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-400/20 border border-green-400/20 text-green-400 rounded-lg hover:from-green-500/30 hover:to-emerald-400/30 transition-all text-sm'
          >
            <Download className='h-4 w-4' />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Professional Table */}
      <div className='overflow-x-auto bg-white/5 rounded-lg border border-white/10'>
        <table className='w-full'>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className='border-b border-gray-700'>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='text-left py-3 px-3 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors'
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ width: header.getSize() }}
                  >
                    <div className='flex items-center gap-2'>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <div className='flex flex-col'>
                          {header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className='h-3 w-3 text-blue-400' />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className='h-3 w-3 text-blue-400' />
                          ) : (
                            <ArrowUpDown className='h-3 w-3 text-gray-500' />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className='border-b border-gray-800 hover:bg-white/5 transition-colors'
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='py-3 px-3'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='text-xs text-gray-400 mb-1'>Total Zonas</div>
          <div className='text-lg font-bold text-white'>
            {zonesArray.length}
          </div>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='text-xs text-gray-400 mb-1'>Manning Promedio</div>
          <div className='text-lg font-bold text-green-400'>
            {zonesArray.length > 0
              ? (
                  zonesArray.reduce((sum, zone) => sum + zone.value, 0) /
                  zonesArray.length
                ).toFixed(4)
              : '0.0000'}
          </div>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='text-xs text-gray-400 mb-1'>Manning Mínimo</div>
          <div className='text-lg font-bold text-blue-400'>
            {zonesArray.length > 0
              ? Math.min(...zonesArray.map(z => z.value)).toFixed(4)
              : '0.0000'}
          </div>
        </div>
        <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
          <div className='text-xs text-gray-400 mb-1'>Manning Máximo</div>
          <div className='text-lg font-bold text-red-400'>
            {zonesArray.length > 0
              ? Math.max(...zonesArray.map(z => z.value)).toFixed(4)
              : '0.0000'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
