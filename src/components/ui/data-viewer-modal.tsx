import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Copy,
  BarChart3,
  Table,
  Info,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useToast } from './toast';
import { invoke } from '@tauri-apps/api/core';

interface DataViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    name: string;
    type: 'group' | 'dataset';
    metadata?: {
      shape?: number[];
      dtype?: string;
      size?: number;
      attrs?: Record<string, any>;
      sizeBytes?: number;
    };
    path?: string;
  };
}

export const DataViewerModal: React.FC<DataViewerModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastContainer } = useToast();

  // State for data visualization
  const [extractedData, setExtractedData] = useState<any>(null);
  const [plotImage, setPlotImage] = useState<string>('');
  const [hydrographImage, setHydrographImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'info' | 'data' | 'plot' | 'hydrograph'
  >('info');

  // Close modal when clicking outside
  useOutsideClick(modalRef, onClose);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Load data when modal opens and it's a dataset
  useEffect(() => {
    if (isOpen && data.type === 'dataset' && data.path) {
      loadDatasetData();
    }
  }, [isOpen, data]);

  const loadDatasetData = async () => {
    try {
      setIsLoading(true);
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath || !data.path) {
        showToast(
          'No se pudo cargar los datos: archivo o ruta no válida',
          'error'
        );
        return;
      }

      // Extract dataset data
      const result = await invoke('extract_hdf_dataset', {
        filePath: hdfFilePath,
        datasetPath: data.path,
      });

      if ((result as any).success) {
        const parsedData = JSON.parse((result as any).output);
        setExtractedData(parsedData);

        // Auto-generate hydrograph if data is cleaned
        if (parsedData.metadata?.is_cleaned) {
          await generateHydrographAutomatically();
        }
      } else {
        showToast('Error al extraer datos del dataset', 'error');
      }
    } catch (error) {
      console.error('Error loading dataset data:', error);
      showToast('Error al cargar los datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateHydrographAutomatically = async () => {
    try {
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath || !data.path) {
        return; // Silently fail for auto-generation
      }

      const result = await invoke('create_hydrograph', {
        filePath: hdfFilePath,
        datasetPath: data.path,
      });

      if ((result as any).success) {
        const hydrographData = JSON.parse((result as any).output);
        setHydrographImage(hydrographData.image);
        // Don't automatically switch to hydrograph tab, let user choose
      }
    } catch (error) {
      console.error('Error auto-generating hydrograph:', error);
      // Silently fail for auto-generation
    }
  };

  const createPlot = async () => {
    try {
      setIsLoading(true);
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath || !data.path) {
        showToast(
          'No se pudo crear el gráfico: archivo o ruta no válida',
          'error'
        );
        return;
      }

      const result = await invoke('create_time_series_plot', {
        filePath: hdfFilePath,
        datasetPath: data.path,
      });

      if ((result as any).success) {
        const plotData = JSON.parse((result as any).output);
        setPlotImage(plotData.image);
        setActiveTab('plot');
      } else {
        showToast('Error al crear el gráfico', 'error');
      }
    } catch (error) {
      console.error('Error creating plot:', error);
      showToast('Error al crear el gráfico', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const createHydrograph = async () => {
    try {
      setIsLoading(true);
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath || !data.path) {
        showToast(
          'No se pudo crear el hidrograma: archivo o ruta no válida',
          'error'
        );
        return;
      }

      const result = await invoke('create_hydrograph', {
        filePath: hdfFilePath,
        datasetPath: data.path,
      });

      if ((result as any).success) {
        const hydrographData = JSON.parse((result as any).output);
        setHydrographImage(hydrographData.image);
        setActiveTab('hydrograph');
      } else {
        showToast('Error al crear el hidrograma', 'error');
      }
    } catch (error) {
      console.error('Error creating hydrograph:', error);
      showToast('Error al crear el hidrograma', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatShape = (shape?: number[]) => {
    if (!shape || shape.length === 0) return 'N/A';
    return `[${shape.join(' × ')}]`;
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath || !data.path) {
        showToast('No se pudo exportar: archivo o ruta no válida', 'error');
        return;
      }

      let result;
      if (format === 'csv') {
        result = await invoke('export_hdf_to_csv', {
          filePath: hdfFilePath,
          datasetPath: data.path,
        });
      } else if (format === 'json') {
        result = await invoke('export_hdf_to_json', {
          filePath: hdfFilePath,
          datasetPath: data.path,
        });
      }

      // Parse the result
      const response = JSON.parse((result as any).data || '{}');

      if ((result as any).success && response.success) {
        showToast('Archivo guardado exitosamente', 'success');
      } else if (response.error === 'Exportación cancelada por el usuario') {
        showToast('Exportación cancelada', 'info');
      } else {
        throw new Error(
          response.error || 'Error desconocido en la exportación'
        );
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast(`Error al exportar como ${format.toUpperCase()}`, 'error');
    }
  };

  const handleCopyPath = () => {
    if (data.path) {
      navigator.clipboard.writeText(data.path);
      showToast('Ruta copiada al portapapeles', 'success');
    }
  };

  const handleVisualize = () => {
    // Verificar si el dataset puede ser visualizado
    if (data.type !== 'dataset') {
      showToast('Solo se pueden visualizar datasets, no grupos', 'error');
      return;
    }

    if (!data.metadata?.shape || data.metadata.shape.length === 0) {
      showToast(
        'No se puede visualizar: dataset sin dimensiones válidas',
        'error'
      );
      return;
    }

    // Verificar si es demasiado grande
    if (data.metadata.size && data.metadata.size > 1000000) {
      showToast(
        'Dataset demasiado grande para visualizar (>1M elementos)',
        'warning'
      );
      return;
    }

    // Verificar tipos de datos soportados
    const supportedTypes = [
      'float32',
      'float64',
      'int32',
      'int64',
      'int16',
      'int8',
    ];
    if (
      data.metadata.dtype &&
      !supportedTypes.some(type => data.metadata!.dtype!.includes(type))
    ) {
      showToast(
        `Tipo de datos '${data.metadata.dtype}' no soportado para visualización`,
        'error'
      );
      return;
    }

    // Crear gráfico de series temporales
    createPlot();
  };

  return (
    <>
      <ToastContainer />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
          >
            <motion.div
              ref={modalRef}
              className='min-h-[50%] max-h-[90%] md:max-w-[40%] bg-[#131414] border border-gray-600/50 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden shadow-2xl backdrop-blur-sm'
              initial={{
                opacity: 0,
                scale: 0.5,
                rotateX: 40,
                y: 40,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                rotateX: 10,
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 15,
              }}
            >
              {/* Close Icon */}
              <button
                onClick={onClose}
                className='absolute top-4 right-4 group z-10'
              >
                <X className='text-white h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200' />
              </button>

              {/* Modal Content */}
              <div className='flex flex-col flex-1 p-8 md:p-10'>
                {/* Header */}
                <div className='flex items-center gap-3 mb-6'>
                  {data.type === 'dataset' ? (
                    <Table className='h-6 w-6 text-blue-400' />
                  ) : (
                    <FileText className='h-6 w-6 text-purple-400' />
                  )}
                  <div>
                    <h2 className='text-xl font-semibold text-white'>
                      {data.name}
                    </h2>
                    <p className='text-sm text-gray-400 capitalize'>
                      {data.type}
                    </p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className='flex border-b border-gray-600/50 mb-6'>
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'info'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Info className='h-4 w-4 inline mr-2' />
                    Información
                  </button>
                  {data.type === 'dataset' && (
                    <>
                      <button
                        onClick={() => setActiveTab('data')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === 'data'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Table className='h-4 w-4 inline mr-2' />
                        Datos
                      </button>
                      <button
                        onClick={() => setActiveTab('plot')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === 'plot'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <BarChart3 className='h-4 w-4 inline mr-2' />
                        Gráfico
                      </button>
                      <button
                        onClick={() => setActiveTab('hydrograph')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === 'hydrograph'
                            ? 'text-blue-400 border-b-2 border-blue-400'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <TrendingUp className='h-4 w-4 inline mr-2' />
                        Hidrograma
                      </button>
                    </>
                  )}
                </div>

                {/* Tab Content */}
                <div className='space-y-4 flex-1 overflow-y-auto'>
                  {activeTab === 'info' && (
                    <div>
                      <div className='flex items-center gap-2 mb-4'>
                        <Info className='h-5 w-5 text-blue-400' />
                        <h3 className='text-lg font-medium text-white'>
                          Información del Dataset
                        </h3>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <label className='text-sm text-gray-400'>
                            Forma (Shape)
                          </label>
                          <p className='text-white font-mono'>
                            {formatShape(data.metadata?.shape)}
                          </p>
                        </div>

                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <label className='text-sm text-gray-400'>
                            Tipo de Datos
                          </label>
                          <p className='text-white font-mono'>
                            {data.metadata?.dtype || 'N/A'}
                          </p>
                        </div>

                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <label className='text-sm text-gray-400'>
                            Elementos
                          </label>
                          <p className='text-white font-mono'>
                            {data.metadata?.size?.toLocaleString() || 'N/A'}
                          </p>
                        </div>

                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <label className='text-sm text-gray-400'>
                            Tamaño
                          </label>
                          <p className='text-white font-mono'>
                            {formatSize(data.metadata?.sizeBytes)}
                          </p>
                        </div>
                      </div>

                      {/* Attributes */}
                      {data.metadata?.attrs &&
                        Object.keys(data.metadata.attrs).length > 0 && (
                          <div className='mt-6'>
                            <h4 className='text-md font-medium text-white mb-3'>
                              Atributos
                            </h4>
                            <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 max-h-40 overflow-y-auto backdrop-blur-sm'>
                              <div className='space-y-2'>
                                {Object.entries(data.metadata.attrs).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className='flex justify-between items-start'
                                    >
                                      <span className='text-gray-400 text-sm'>
                                        {key}:
                                      </span>
                                      <span className='text-white text-sm font-mono ml-4 text-right'>
                                        {typeof value === 'object'
                                          ? JSON.stringify(value)
                                          : String(value)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Path */}
                      {data.path && (
                        <div className='mt-6'>
                          <h4 className='text-md font-medium text-white mb-3'>
                            Ruta
                          </h4>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 flex items-center justify-between backdrop-blur-sm'>
                            <code className='text-gray-300 text-sm break-all'>
                              {data.path}
                            </code>
                            <button
                              onClick={handleCopyPath}
                              className='ml-4 p-2 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-cyan-400/20 rounded-lg transition-all duration-200 flex-shrink-0'
                              title='Copiar ruta'
                            >
                              <Copy className='h-4 w-4 text-gray-400' />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Data Tab */}
                  {activeTab === 'data' && extractedData && (
                    <div>
                      <div className='flex items-center gap-2 mb-4'>
                        <Table className='h-5 w-5 text-blue-400' />
                        <h3 className='text-lg font-medium text-white'>
                          Datos del Dataset
                        </h3>
                      </div>

                      {extractedData.summary_stats && (
                        <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-6'>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm'>
                            <label className='text-xs text-gray-400'>
                              Mínimo
                            </label>
                            <p className='text-white font-mono text-sm'>
                              {extractedData.summary_stats.min?.toFixed(3)}
                            </p>
                          </div>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm'>
                            <label className='text-xs text-gray-400'>
                              Máximo
                            </label>
                            <p className='text-white font-mono text-sm'>
                              {extractedData.summary_stats.max?.toFixed(3)}
                            </p>
                          </div>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm'>
                            <label className='text-xs text-gray-400'>
                              Media
                            </label>
                            <p className='text-white font-mono text-sm'>
                              {extractedData.summary_stats.mean?.toFixed(3)}
                            </p>
                          </div>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm'>
                            <label className='text-xs text-gray-400'>
                              Desv. Est.
                            </label>
                            <p className='text-white font-mono text-sm'>
                              {extractedData.summary_stats.std?.toFixed(3)}
                            </p>
                          </div>
                          <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-3 backdrop-blur-sm'>
                            <label className='text-xs text-gray-400'>
                              Elementos
                            </label>
                            <p className='text-white font-mono text-sm'>
                              {extractedData.summary_stats.count}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm max-h-96 overflow-auto'>
                        <div className='text-xs text-gray-400 mb-2'>
                          {extractedData.metadata?.is_truncated
                            ? `Mostrando primeros ${extractedData.metadata.truncated_at} elementos`
                            : 'Datos completos'}
                          {extractedData.metadata?.is_cleaned && (
                            <span className='ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs'>
                              Datos limpios para hidrograma
                            </span>
                          )}
                        </div>

                        {/* Show table format for cleaned data */}
                        {extractedData.metadata?.is_cleaned &&
                        Array.isArray(extractedData.data) ? (
                          <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                              <thead>
                                <tr className='border-b border-gray-600/30'>
                                  <th className='text-left py-2 px-3 text-gray-300 font-medium'>
                                    Índice
                                  </th>
                                  <th className='text-left py-2 px-3 text-gray-300 font-medium'>
                                    Valor
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {extractedData.data
                                  .slice(0, 100)
                                  .map((item: any, idx: number) => (
                                    <tr
                                      key={idx}
                                      className='border-b border-gray-700/20 hover:bg-gray-700/20'
                                    >
                                      <td className='py-1 px-3 text-gray-400 font-mono text-xs'>
                                        {typeof item.index === 'number'
                                          ? item.index.toFixed(2)
                                          : item.index}
                                      </td>
                                      <td className='py-1 px-3 text-gray-300 font-mono text-xs'>
                                        {typeof item.column_2 === 'number'
                                          ? item.column_2.toFixed(4)
                                          : item.column_2}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                            {extractedData.data.length > 100 && (
                              <div className='text-xs text-gray-500 mt-2 text-center'>
                                ... y {extractedData.data.length - 100} filas
                                más
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Show JSON format for raw data */
                          <pre className='text-gray-300 text-xs font-mono whitespace-pre-wrap'>
                            {JSON.stringify(extractedData.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plot Tab */}
                  {activeTab === 'plot' && (
                    <div>
                      <div className='flex items-center gap-2 mb-4'>
                        <BarChart3 className='h-5 w-5 text-blue-400' />
                        <h3 className='text-lg font-medium text-white'>
                          Gráfico de Series Temporales
                        </h3>
                      </div>

                      {isLoading ? (
                        <div className='flex items-center justify-center h-64'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
                          <span className='ml-3 text-gray-400'>
                            Generando gráfico...
                          </span>
                        </div>
                      ) : plotImage ? (
                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <img
                            src={`data:image/png;base64,${plotImage}`}
                            alt='Time Series Plot'
                            className='w-full h-auto rounded-lg'
                          />
                        </div>
                      ) : (
                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-8 backdrop-blur-sm text-center'>
                          <BarChart3 className='h-12 w-12 mx-auto mb-3 text-gray-500' />
                          <p className='text-gray-400 mb-4'>
                            No hay gráfico disponible
                          </p>
                          <button
                            onClick={createPlot}
                            className='px-4 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200'
                          >
                            Generar Gráfico
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hydrograph Tab */}
                  {activeTab === 'hydrograph' && (
                    <div>
                      <div className='flex items-center gap-2 mb-4'>
                        <TrendingUp className='h-5 w-5 text-blue-400' />
                        <h3 className='text-lg font-medium text-white'>
                          Hidrograma
                        </h3>
                      </div>

                      {isLoading ? (
                        <div className='flex items-center justify-center h-64'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400'></div>
                          <span className='ml-3 text-gray-400'>
                            Generando hidrograma...
                          </span>
                        </div>
                      ) : hydrographImage ? (
                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-4 backdrop-blur-sm'>
                          <img
                            src={`data:image/png;base64,${hydrographImage}`}
                            alt='Hydrograph'
                            className='w-full h-auto rounded-lg'
                          />
                        </div>
                      ) : (
                        <div className='bg-gray-800/50 border border-gray-600/30 rounded-lg p-8 backdrop-blur-sm text-center'>
                          <TrendingUp className='h-12 w-12 mx-auto mb-3 text-gray-500' />
                          <p className='text-gray-400 mb-4'>
                            No hay hidrograma disponible
                          </p>
                          <button
                            onClick={createHydrograph}
                            className='px-4 py-2 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded-lg hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200'
                          >
                            Generar Hidrograma
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className='flex justify-end p-3 bg-gray-800/30 border-t border-gray-600/50 backdrop-blur-sm'>
                <div className='flex gap-2'>
                  {data.type === 'dataset' && (
                    <>
                      <button
                        className='flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-green-500/30 to-emerald-400/30 border border-green-400/20 text-white rounded hover:from-green-500/40 hover:to-emerald-400/40 transition-all duration-200 backdrop-blur-sm'
                        onClick={() => handleExport('csv')}
                        title='Exportar CSV'
                      >
                        <Download className='h-3 w-3' />
                        CSV
                      </button>
                      <button
                        className='flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500/30 to-pink-400/30 border border-purple-400/20 text-white rounded hover:from-purple-500/40 hover:to-pink-400/40 transition-all duration-200 backdrop-blur-sm'
                        onClick={() => handleExport('json')}
                        title='Exportar JSON'
                      >
                        <Download className='h-3 w-3' />
                        JSON
                      </button>
                      <button
                        className='flex items-center gap-1 px-3 py-1.5 text-xs bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-blue-400/20 text-white rounded hover:from-blue-500/40 hover:to-cyan-400/40 transition-all duration-200 backdrop-blur-sm'
                        onClick={handleVisualize}
                        title='Visualizar datos'
                      >
                        <BarChart3 className='h-3 w-3' />
                        Visualizar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
