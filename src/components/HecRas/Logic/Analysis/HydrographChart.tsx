import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Waves,
  TrendingUp,
  Download,
  // Settings,
  Eye,
  EyeOff,
} from 'lucide-react';

interface HydrographChartProps {
  boundaryConditions: any[];
  timeSeriesData: any;
  selectedBoundary: string | null;
}

interface ChartDataPoint {
  time: number;
  [key: string]: number;
}

export const HydrographChart: React.FC<HydrographChartProps> = ({
  // boundaryConditions,
  timeSeriesData,
  selectedBoundary,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set());
  const [chartType, setChartType] = useState<'line' | 'area'>('line');

  useEffect(() => {
    if (timeSeriesData && Object.keys(timeSeriesData).length > 0) {
      generateChartData();
    }
  }, [timeSeriesData, selectedBoundary]);

  const generateChartData = () => {
    const data: ChartDataPoint[] = [];
    const seriesNames = new Set<string>();

    // Si hay una condición de contorno seleccionada, mostrar solo esa
    if (selectedBoundary) {
      const relevantSeries = Object.keys(timeSeriesData).filter(key =>
        key.toLowerCase().includes(selectedBoundary.toLowerCase())
      );

      if (relevantSeries.length > 0) {
        const firstSeries = timeSeriesData[relevantSeries[0]];
        if (firstSeries && firstSeries.data) {
          firstSeries.data.forEach((value: number, index: number) => {
            data.push({
              time: index,
              [selectedBoundary]: value,
            });
          });
          seriesNames.add(selectedBoundary);
        }
      }
    } else {
      // Mostrar todas las series disponibles
      const allSeries = Object.keys(timeSeriesData);
      const maxLength = Math.max(
        ...allSeries.map(key => timeSeriesData[key]?.data?.length || 0)
      );

      for (let i = 0; i < maxLength; i++) {
        const dataPoint: ChartDataPoint = { time: i };

        allSeries.forEach(seriesKey => {
          const series = timeSeriesData[seriesKey];
          if (series && series.data && series.data[i] !== undefined) {
            const seriesName = seriesKey.split('/').pop() || seriesKey;
            dataPoint[seriesName] = series.data[i];
            seriesNames.add(seriesName);
          }
        });

        data.push(dataPoint);
      }
    }

    setChartData(data);
    setVisibleSeries(new Set(Array.from(seriesNames).slice(0, 3))); // Mostrar máximo 3 series por defecto
  };

  const toggleSeriesVisibility = (seriesName: string) => {
    const newVisible = new Set(visibleSeries);
    if (newVisible.has(seriesName)) {
      newVisible.delete(seriesName);
    } else {
      newVisible.add(seriesName);
    }
    setVisibleSeries(newVisible);
  };

  const getSeriesColor = (index: number) => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#F59E0B', // amber
      '#EF4444', // red
      '#06B6D4', // cyan
    ];
    return colors[index % colors.length];
  };

  const getAllSeriesNames = () => {
    if (chartData.length === 0) return [];
    return Object.keys(chartData[0]).filter(key => key !== 'time');
  };

  if (chartData.length === 0) {
    return (
      <div className='bg-white/5 rounded-xl p-6 border border-white/10'>
        <div className='text-center py-12'>
          <Waves className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-gray-400 font-medium mb-2'>
            No hay datos de hidrograma disponibles
          </h3>
          <p className='text-gray-500 text-sm'>
            Selecciona una condición de contorno con datos disponibles
          </p>
        </div>
      </div>
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
        <div>
          <h3 className='text-xl font-bold text-white flex items-center gap-3'>
            <TrendingUp className='h-6 w-6 text-blue-400' />
            Hidrograma
            {selectedBoundary && (
              <span className='text-blue-400'>- {selectedBoundary}</span>
            )}
          </h3>
          <p className='text-white/60 text-sm mt-1'>
            {chartData.length} puntos temporales
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {/* Chart Type Toggle */}
          <div className='flex bg-white/10 rounded-lg p-1'>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Línea
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                chartType === 'area'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Área
            </button>
          </div>

          <button className='p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors'>
            <Download className='h-4 w-4 text-white' />
          </button>
        </div>
      </div>

      {/* Series Controls */}
      {getAllSeriesNames().length > 1 && (
        <div className='mb-4'>
          <h4 className='text-white/80 text-sm font-medium mb-2'>
            Series visibles:
          </h4>
          <div className='flex flex-wrap gap-2'>
            {getAllSeriesNames().map((seriesName, index) => (
              <button
                key={seriesName}
                onClick={() => toggleSeriesVisibility(seriesName)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs transition-colors border ${
                  visibleSeries.has(seriesName)
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
                style={{
                  borderColor: visibleSeries.has(seriesName)
                    ? getSeriesColor(index)
                    : undefined,
                }}
              >
                {visibleSeries.has(seriesName) ? (
                  <Eye className='h-3 w-3' />
                ) : (
                  <EyeOff className='h-3 w-3' />
                )}
                {seriesName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className='h-80 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
              <XAxis
                dataKey='time'
                stroke='rgba(255,255,255,0.6)'
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke='rgba(255,255,255,0.6)'
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              {getAllSeriesNames().map((seriesName, index) => (
                visibleSeries.has(seriesName) && (
                  <Line
                    key={seriesName}
                    type='monotone'
                    dataKey={seriesName}
                    stroke={getSeriesColor(index)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: getSeriesColor(index) }}
                  />
                )
              ))}
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
              <XAxis
                dataKey='time'
                stroke='rgba(255,255,255,0.6)'
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke='rgba(255,255,255,0.6)'
                fontSize={12}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                }}
              />
              <Legend />
              {getAllSeriesNames().map((seriesName, index) => (
                visibleSeries.has(seriesName) && (
                  <Area
                    key={seriesName}
                    type='monotone'
                    dataKey={seriesName}
                    stroke={getSeriesColor(index)}
                    fill={getSeriesColor(index)}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                )
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10'>
        {getAllSeriesNames().slice(0, 3).map((seriesName, index) => {
          const seriesData = chartData.map(d => d[seriesName]).filter(v => v !== undefined);
          const max = Math.max(...seriesData);
          const min = Math.min(...seriesData);
          const avg = seriesData.reduce((a, b) => a + b, 0) / seriesData.length;

          return (
            <div key={seriesName} className='bg-white/5 rounded-lg p-3'>
              <h5 className='text-white font-medium text-sm mb-2 flex items-center gap-2'>
                <div
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: getSeriesColor(index) }}
                ></div>
                {seriesName}
              </h5>
              <div className='space-y-1 text-xs'>
                <div className='flex justify-between'>
                  <span className='text-white/60'>Máximo:</span>
                  <span className='text-white'>{max.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-white/60'>Mínimo:</span>
                  <span className='text-white'>{min.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-white/60'>Promedio:</span>
                  <span className='text-white'>{avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
