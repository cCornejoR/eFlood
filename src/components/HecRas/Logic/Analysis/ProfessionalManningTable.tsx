/**
 * 🌿 Professional Manning Values Table Component
 *
 * Uses TanStack Table for professional data display with sorting, filtering, and export
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import {
  TreePine,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Eye,
  EyeOff,
  BarChart3,
  Layers,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HecRasState } from '../../index';

interface ProfessionalManningTableProps {
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

interface ManningTableRow {
  id: number;
  name: string;
  value: number;
  description: string;
  category: string;
  color: string;
}

const columnHelper = createColumnHelper<ManningTableRow>();

export const ProfessionalManningTable: React.FC<
  ProfessionalManningTableProps
> = ({ state }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showDetails, setShowDetails] = useState(true);

  // Parse Manning data
  const manningData: ManningData | null = state.manningValues;

  // More flexible data validation
  const hasManningData =
    manningData?.success &&
    manningData?.manning_data &&
    manningData?.manning_data?.success !== false && // Allow undefined success
    manningData?.manning_data?.manning_zones &&
    Object.keys(manningData?.manning_data?.manning_zones).length > 0;

  const manningZones = manningData?.manning_data?.manning_zones || {};
  const totalZones = manningData?.manning_data?.total_zones || 0;

  // Convert to table data
  const tableData = useMemo(() => {
    if (!hasManningData) return [];

    return Object.entries(manningZones).map(([id, zone]) => ({
      id: parseInt(id),
      name: zone.name,
      value: zone.value,
      description: zone.description,
      category: getManningCategory(zone.value),
      color: getManningColor(zone.value),
    }));
  }, [manningZones, hasManningData]);

  // Define columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => (
          <span className='font-mono text-sm text-gray-300'>
            {info.getValue()}
          </span>
        ),
        size: 60,
      }),
      columnHelper.accessor('name', {
        header: 'Tipo de Cobertura',
<<<<<<< Updated upstream
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div
              className={cn("w-3 h-3 rounded-full", info.row.original.color)}
=======
        cell: info => (
          <div className='flex items-center gap-2'>
            <div
              className={cn('w-3 h-3 rounded-full', info.row.original.color)}
>>>>>>> Stashed changes
            />
            <span className='font-medium text-white'>{info.getValue()}</span>
          </div>
        ),
        size: 200,
      }),
      columnHelper.accessor('value', {
        header: 'Manning n',
        cell: info => (
          <span
            className={cn(
              'font-mono font-semibold text-sm',
              info.row.original.color.replace('bg-', 'text-')
            )}
          >
            {info.getValue().toFixed(4)}
          </span>
        ),
        size: 100,
      }),
      columnHelper.accessor('category', {
        header: 'Categoría',
        cell: info => (
          <span className='text-sm text-gray-400'>{info.getValue()}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor('description', {
        header: 'Descripción',
        cell: info => (
          <span className='text-sm text-gray-300'>{info.getValue()}</span>
        ),
        size: 300,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
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

  // Get Manning statistics
  const getManningStats = () => {
    if (tableData.length === 0) return null;

    const values = tableData.map(item => item.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  };

  const stats = getManningStats();

  // Export functionality
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Tipo de Cobertura',
      'Manning n',
      'Categoría',
      'Descripción',
    ];
    const csvContent = [
      headers.join(','),
      ...tableData.map(row =>
        [
          row.id,
          `"${row.name}"`,
          row.value.toFixed(4),
          `"${row.category}"`,
          `"${row.description}"`,
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

        <div className='text-center py-8'>
          <TreePine className='h-12 w-12 text-gray-600 mx-auto mb-4' />
          <p className='text-white/60 text-sm mb-2'>
            No hay valores de Manning disponibles. Ejecuta el análisis primero.
          </p>
          {manningData && !manningData.success && (
            <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-4'>
              <p className='text-red-400 text-xs mb-2'>
                Error:{' '}
                {manningData.error ||
                  'Error desconocido al extraer valores de Manning'}
              </p>
              <p className='text-red-300 text-xs'>
                💡 Tip: Asegúrate de que el archivo LandCover.hdf esté en la
                misma carpeta que tu archivo HDF principal.
              </p>
            </div>
          )}
          {!manningData && (
            <div className='bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-4'>
              <p className='text-blue-400 text-xs mb-1'>
                Los datos de Manning se extraerán automáticamente durante el
                análisis.
              </p>
              <p className='text-blue-300 text-xs'>
                🔍 Se buscará en el archivo HDF principal y en archivos
                LandCover.hdf asociados.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white/5 rounded-xl p-6 border border-white/10'
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <TreePine className='h-6 w-6 text-green-400' />
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Valores de Manning Calibrados
            </h3>
            <p className='text-sm text-gray-400'>
              {totalZones} zonas de rugosidad detectadas
            </p>
          </div>
        </div>

<<<<<<< Updated upstream
        <div className="flex items-center gap-2">
=======
        <div className='flex items-center gap-2'>
>>>>>>> Stashed changes
          <button
            onClick={() => setShowDetails(!showDetails)}
            className='flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors'
          >
            {showDetails ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
          </button>

          <button
            onClick={exportToCSV}
            className='flex items-center gap-2 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-sm rounded-lg transition-colors'
          >
            <Download className='h-4 w-4' />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && showDetails && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
            <div className='flex items-center gap-2 mb-1'>
              <BarChart3 className='h-4 w-4 text-blue-400' />
              <span className='text-xs text-gray-400'>Total Zonas</span>
            </div>
            <p className='text-lg font-bold text-blue-400'>{stats.count}</p>
          </div>

<<<<<<< Updated upstream
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDown className="h-4 w-4 text-green-400" />
              <span className="text-xs text-gray-400">Mínimo</span>
=======
          <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
            <div className='flex items-center gap-2 mb-1'>
              <ArrowDown className='h-4 w-4 text-green-400' />
              <span className='text-xs text-gray-400'>Mínimo</span>
>>>>>>> Stashed changes
            </div>
            <p className='text-lg font-bold text-green-400'>
              {stats.min.toFixed(3)}
            </p>
          </div>

<<<<<<< Updated upstream
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUp className="h-4 w-4 text-red-400" />
              <span className="text-xs text-gray-400">Máximo</span>
=======
          <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
            <div className='flex items-center gap-2 mb-1'>
              <ArrowUp className='h-4 w-4 text-red-400' />
              <span className='text-xs text-gray-400'>Máximo</span>
>>>>>>> Stashed changes
            </div>
            <p className='text-lg font-bold text-red-400'>
              {stats.max.toFixed(3)}
            </p>
          </div>

<<<<<<< Updated upstream
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Promedio</span>
=======
          <div className='bg-white/5 rounded-lg p-3 border border-white/10'>
            <div className='flex items-center gap-2 mb-1'>
              <BarChart3 className='h-4 w-4 text-yellow-400' />
              <span className='text-xs text-gray-400'>Promedio</span>
>>>>>>> Stashed changes
            </div>
            <p className='text-lg font-bold text-yellow-400'>
              {stats.avg.toFixed(3)}
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className='flex items-center gap-4 mb-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Buscar en la tabla...'
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className='w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50'
          />
        </div>

<<<<<<< Updated upstream
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Filter className="h-4 w-4" />
          <span>{table.getFilteredRowModel().rows.length} de {tableData.length}</span>
=======
        <div className='flex items-center gap-2 text-sm text-gray-400'>
          <Filter className='h-4 w-4' />
          <span>
            {table.getFilteredRowModel().rows.length} de {tableData.length}
          </span>
>>>>>>> Stashed changes
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className='border-b border-gray-800'>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='text-left py-3 px-2 text-sm font-semibold text-gray-300'
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none hover:text-white'
                            : ''
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <div className='flex flex-col'>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className='h-3 w-3' />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className='h-3 w-3' />
                            ) : (
                              <ArrowUpDown className='h-3 w-3 opacity-50' />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className='border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors'
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className='py-3 px-2'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className='mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400'>
        <div className='flex items-center gap-2'>
          <Layers className='w-4 h-4' />
          <span>Valores calibrados extraídos del modelo HEC-RAS</span>
        </div>
        {stats && (
          <div className='flex items-center gap-2'>
            <BarChart3 className='w-4 h-4' />
            <span>
              Rango: {stats.min.toFixed(3)} - {stats.max.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Helper functions
function getManningCategory(value: number): string {
  if (value < 0.02) return 'Muy Lisa';
  if (value < 0.03) return 'Lisa';
  if (value < 0.04) return 'Moderada';
  if (value < 0.05) return 'Rugosa';
  if (value < 0.07) return 'Muy Rugosa';
  if (value < 0.1) return 'Extrema';
  return 'Alta Resistencia';
}

function getManningColor(value: number): string {
  if (value < 0.02) return 'bg-blue-500 text-blue-400';
  if (value < 0.03) return 'bg-cyan-500 text-cyan-400';
  if (value < 0.04) return 'bg-green-500 text-green-400';
  if (value < 0.05) return 'bg-yellow-500 text-yellow-400';
  if (value < 0.07) return 'bg-orange-500 text-orange-400';
  if (value < 0.1) return 'bg-red-500 text-red-400';
  return 'bg-purple-500 text-purple-400';
}
