/**
 * 📊 CompleteDataViewer - Visualizador Completo de Datos del Backend
 * ================================================================
 * 
 * Componente que muestra toda la información JSON extraída por el backend
 * de manera visual y organizada, incluyendo:
 * - Metadatos del proyecto HEC-RAS
 * - Valores de Manning (base y calibración)
 * - Datos de hidrogramas con gráficos
 * - Información de mallas y geometría
 * - Condiciones de frontera
 * - Análisis de infraestructura
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Layers,
  Zap,
  TreePine,
  Activity,
  Settings,
  FileText,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { HecRasState } from '../../index';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts';

interface CompleteDataViewerProps {
  state: HecRasState;
}

interface DataSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  data: any;
  description: string;
}

export const CompleteDataViewer: React.FC<CompleteDataViewerProps> = ({
  state,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['project']));
  const [showRawJson, setShowRawJson] = useState<Set<string>>(new Set());

  // 📊 Organizar datos en secciones
  const dataSections: DataSection[] = [
    {
      id: 'project',
      title: 'Información del Proyecto',
      icon: Database,
      color: 'blue',
      data: state.hdfData,
      description: 'Metadatos generales del proyecto HEC-RAS',
    },
    {
      id: 'manning',
      title: 'Valores de Manning',
      icon: TreePine,
      color: 'green',
      data: state.manningValues,
      description: 'Coeficientes de rugosidad base y calibrados',
    },
    {
      id: 'hydrograph',
      title: 'Datos de Hidrogramas',
      icon: Activity,
      color: 'cyan',
      data: state.hydrographData,
      description: 'Series temporales de flujo y niveles de agua',
    },
    {
      id: 'boundary',
      title: 'Condiciones de Frontera',
      icon: Zap,
      color: 'yellow',
      data: state.boundaryConditions,
      description: 'Condiciones de contorno del modelo hidráulico',
    },
    {
      id: 'geometry',
      title: 'Geometría y Mallas',
      icon: Layers,
      color: 'purple',
      data: state.analysisResults,
      description: 'Información de mallas 2D y geometría del modelo',
    },
    {
      id: 'metadata',
      title: 'Metadatos del Archivo',
      icon: FileText,
      color: 'orange',
      data: state.fileMetadata,
      description: 'Información técnica del archivo HDF',
    },
  ];

  // 🎯 Funciones de utilidad
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleRawJson = (sectionId: string) => {
    const newShowRaw = new Set(showRawJson);
    if (newShowRaw.has(sectionId)) {
      newShowRaw.delete(sectionId);
    } else {
      newShowRaw.add(sectionId);
    }
    setShowRawJson(newShowRaw);
  };

  const copyToClipboard = async (data: any, sectionTitle: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success(`Datos de ${sectionTitle} copiados al portapapeles`);
    } catch (error) {
      toast.error('Error al copiar datos');
    }
  };

  const downloadJson = (data: any, sectionTitle: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eflood_${sectionTitle.toLowerCase().replace(/\s+/g, '_')}_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Archivo ${sectionTitle} descargado`);
  };

  // 🎨 Función para obtener colores por sección
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
      green: 'border-green-500/30 bg-green-500/5 text-green-400',
      cyan: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
      yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
      purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
      orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // 📈 Renderizar datos específicos por tipo
  const renderSpecificData = (section: DataSection) => {
    if (!section.data) return null;

    switch (section.id) {
      case 'manning':
        return renderManningData(section.data);
      case 'hydrograph':
        return renderHydrographData(section.data);
      case 'project':
        return renderProjectData(section.data);
      case 'boundary':
        return renderBoundaryData(section.data);
      default:
        return null;
    }
  };

  // 🌿 Renderizar datos de Manning
  const renderManningData = (data: any) => {
    const manningData = data?.data || data;
    if (!manningData) return null;

    // Preparar datos para el gráfico de distribución (comentado por ahora)
    // const allValues = [
    //   ...(manningData.base_manning_values || []).map((v: number) => ({ value: v, type: 'Base' })),
    //   ...(manningData.calibration_manning_values || []).map((v: number) => ({ value: v, type: 'Calibración' }))
    // ];

    // Crear histograma de distribución
    const createHistogram = (values: number[], bins: number = 10) => {
      if (values.length === 0) return [];

      const min = Math.min(...values);
      const max = Math.max(...values);
      const binSize = (max - min) / bins;

      const histogram = Array.from({ length: bins }, (_, i) => ({
        range: `${(min + i * binSize).toFixed(3)}-${(min + (i + 1) * binSize).toFixed(3)}`,
        count: 0,
        rangeStart: min + i * binSize,
      }));

      values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
        histogram[binIndex].count++;
      });

      return histogram;
    };

    const baseHistogram = createHistogram(manningData.base_manning_values || []);
    const calibHistogram = createHistogram(manningData.calibration_manning_values || []);

    return (
      <div className='space-y-6'>
        {/* Estadísticas de Manning */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Total Zonas</div>
            <div className='text-2xl font-bold text-green-400'>
              {manningData.total_manning_zones || 0}
            </div>
          </div>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Valores Base</div>
            <div className='text-2xl font-bold text-blue-400'>
              {manningData.base_manning_values?.length || 0}
            </div>
          </div>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Valores Calibración</div>
            <div className='text-2xl font-bold text-cyan-400'>
              {manningData.calibration_manning_values?.length || 0}
            </div>
          </div>
        </div>

        {/* Gráfico de distribución de valores base */}
        {baseHistogram.length > 0 && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-white/80 mb-4 flex items-center gap-2'>
              <TreePine className='h-5 w-5 text-blue-400' />
              Distribución de Valores Base de Manning
            </h4>
            <div className='h-64 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={baseHistogram}>
                  <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
                  <XAxis
                    dataKey='range'
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={10}
                    angle={-45}
                    textAnchor='end'
                    height={60}
                  />
                  <YAxis
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey='count'
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Gráfico de distribución de valores de calibración */}
        {calibHistogram.length > 0 && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-white/80 mb-4 flex items-center gap-2'>
              <Settings className='h-5 w-5 text-cyan-400' />
              Distribución de Valores de Calibración
            </h4>
            <div className='h-64 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={calibHistogram}>
                  <CartesianGrid strokeDasharray='3 3' stroke='rgba(255,255,255,0.1)' />
                  <XAxis
                    dataKey='range'
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={10}
                    angle={-45}
                    textAnchor='end'
                    height={60}
                  />
                  <YAxis
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey='count'
                    fill='#06b6d4'
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rangos de valores */}
        {manningData.base_manning_values?.length > 0 && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-white/80 mb-2'>Estadísticas de Valores</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-white/60'>Base: </span>
                <span className='text-blue-400 font-mono'>
                  {Math.min(...manningData.base_manning_values).toFixed(4)} - {Math.max(...manningData.base_manning_values).toFixed(4)}
                </span>
                <div className='text-xs text-white/50 mt-1'>
                  Promedio: {(manningData.base_manning_values.reduce((a: number, b: number) => a + b, 0) / manningData.base_manning_values.length).toFixed(4)}
                </div>
              </div>
              {manningData.calibration_manning_values?.length > 0 && (
                <div>
                  <span className='text-white/60'>Calibración: </span>
                  <span className='text-cyan-400 font-mono'>
                    {Math.min(...manningData.calibration_manning_values).toFixed(4)} - {Math.max(...manningData.calibration_manning_values).toFixed(4)}
                  </span>
                  <div className='text-xs text-white/50 mt-1'>
                    Promedio: {(manningData.calibration_manning_values.reduce((a: number, b: number) => a + b, 0) / manningData.calibration_manning_values.length).toFixed(4)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 📈 Renderizar datos de hidrograma
  const renderHydrographData = (data: any) => {
    const hydroData = data?.data || data;
    if (!hydroData) return null;

    // Preparar datos para el gráfico
    const chartData = hydroData.flow_data && hydroData.time_series
      ? hydroData.flow_data.slice(0, 500).map((flow: number, index: number) => ({
          time: index,
          flow: flow,
          timeFormatted: `T${index}`,
        }))
      : [];

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className='bg-black/90 border border-white/20 rounded-lg p-3 shadow-lg'>
            <p className='text-white/60 text-xs mb-1'>Punto: {label}</p>
            <p className='text-cyan-400 font-semibold'>
              Flujo: {data.flow.toFixed(2)} m³/s
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className='space-y-6'>
        {/* Estadísticas del hidrograma */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Puntos Temporales</div>
            <div className='text-2xl font-bold text-cyan-400'>
              {hydroData.time_series?.length || 0}
            </div>
          </div>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Datos de Flujo</div>
            <div className='text-2xl font-bold text-blue-400'>
              {hydroData.flow_data?.length || 0}
            </div>
          </div>
          <div className='bg-white/5 rounded-lg p-4'>
            <div className='text-sm text-white/60'>Malla</div>
            <div className='text-lg font-bold text-green-400'>
              {hydroData.mesh_name || 'N/A'}
            </div>
          </div>
        </div>

        {/* Gráfico del hidrograma */}
        {chartData.length > 0 && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-white/80 mb-4 flex items-center gap-2'>
              <Activity className='h-5 w-5 text-cyan-400' />
              Gráfico del Hidrograma
            </h4>
            <div className='h-80 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id='flowGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#06b6d4' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#06b6d4' stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='rgba(255,255,255,0.1)'
                  />
                  <XAxis
                    dataKey='time'
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={12}
                    tickFormatter={(value) => `T${value}`}
                  />
                  <YAxis
                    stroke='rgba(255,255,255,0.6)'
                    fontSize={12}
                    tickFormatter={(value) => `${value.toFixed(1)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='flow'
                    stroke='#06b6d4'
                    strokeWidth={2}
                    fill='url(#flowGradient)'
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: '#06b6d4',
                      stroke: '#ffffff',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rangos de flujo */}
        {hydroData.flow_data?.length > 0 && (
          <div className='bg-white/5 rounded-lg p-4'>
            <h4 className='text-sm font-medium text-white/80 mb-2'>Estadísticas de Flujo</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-white/60'>Mínimo: </span>
                <span className='text-cyan-400 font-mono'>
                  {Math.min(...hydroData.flow_data).toFixed(2)} m³/s
                </span>
              </div>
              <div>
                <span className='text-white/60'>Máximo: </span>
                <span className='text-cyan-400 font-mono'>
                  {Math.max(...hydroData.flow_data).toFixed(2)} m³/s
                </span>
              </div>
              <div>
                <span className='text-white/60'>Promedio: </span>
                <span className='text-cyan-400 font-mono'>
                  {(hydroData.flow_data.reduce((a: number, b: number) => a + b, 0) / hydroData.flow_data.length).toFixed(2)} m³/s
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 🏗️ Renderizar datos del proyecto
  const renderProjectData = (data: any) => {
    if (!data) return null;

    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className='bg-white/5 rounded-lg p-4'>
              <div className='text-sm text-white/60 capitalize'>
                {key.replace(/_/g, ' ')}
              </div>
              <div className='text-sm font-mono text-white/90 break-all'>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ⚡ Renderizar condiciones de frontera
  const renderBoundaryData = (data: any) => {
    if (!data) return null;

    return (
      <div className='space-y-4'>
        <div className='bg-white/5 rounded-lg p-4'>
          <div className='text-sm text-white/60'>Condiciones Detectadas</div>
          <div className='text-2xl font-bold text-yellow-400'>
            {Array.isArray(data) ? data.length : Object.keys(data).length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* 🎯 Encabezado */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          📊 Visualizador Completo de Datos
        </h2>
        <p className='text-white/60'>
          Toda la información extraída del archivo HDF organizada por categorías
        </p>
      </div>

      {/* 📋 Secciones de datos */}
      <div className='space-y-4'>
        {dataSections.map((section) => {
          const isExpanded = expandedSections.has(section.id);
          const showRaw = showRawJson.has(section.id);
          const hasData = section.data && Object.keys(section.data).length > 0;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border rounded-xl overflow-hidden',
                getColorClasses(section.color)
              )}
            >
              {/* 🎯 Encabezado de sección */}
              <div
                className='p-4 cursor-pointer hover:bg-white/5 transition-colors'
                onClick={() => toggleSection(section.id)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Icon className='h-5 w-5' />
                    <div>
                      <h3 className='font-semibold'>{section.title}</h3>
                      <p className='text-xs text-white/60'>{section.description}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    {hasData && (
                      <div className='text-xs bg-white/10 px-2 py-1 rounded'>
                        {Object.keys(section.data).length} elementos
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </div>
                </div>
              </div>

              {/* 📊 Contenido de sección */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className='border-t border-white/10'
                  >
                    <div className='p-4 space-y-4'>
                      {/* 🎛️ Controles */}
                      {hasData && (
                        <div className='flex gap-2 flex-wrap'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => toggleRawJson(section.id)}
                            className='text-xs'
                          >
                            {showRaw ? <EyeOff className='h-3 w-3 mr-1' /> : <Eye className='h-3 w-3 mr-1' />}
                            {showRaw ? 'Ocultar JSON' : 'Ver JSON'}
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => copyToClipboard(section.data, section.title)}
                            className='text-xs'
                          >
                            <Copy className='h-3 w-3 mr-1' />
                            Copiar
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => downloadJson(section.data, section.title)}
                            className='text-xs'
                          >
                            <Download className='h-3 w-3 mr-1' />
                            Descargar
                          </Button>
                        </div>
                      )}

                      {/* 📊 Contenido específico o mensaje de no datos */}
                      {hasData ? (
                        <div>
                          {/* Vista específica por tipo */}
                          {!showRaw && renderSpecificData(section)}
                          
                          {/* Vista JSON cruda */}
                          {showRaw && (
                            <div className='bg-black/30 rounded-lg p-4 overflow-auto max-h-96'>
                              <pre className='text-xs text-white/80 whitespace-pre-wrap'>
                                {JSON.stringify(section.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='text-center py-8'>
                          <Icon className='h-12 w-12 text-white/20 mx-auto mb-2' />
                          <p className='text-white/40'>No hay datos disponibles</p>
                          <p className='text-xs text-white/30'>
                            Ejecuta el análisis para ver información aquí
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CompleteDataViewer;
