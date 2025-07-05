import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Upload,
  FileText,
  Calendar,
  HardDrive,
  Folder,
} from 'lucide-react';
import { FilesystemItem } from './ui/filesystem';
import { DotLoader } from './ui/loader-dot';

interface HDFAnalyzerProps {
  selectedFile?: string;
  hdfData?: any;
  fileMetadata?: any;
  isAnalyzing?: boolean;
}

const HDFAnalyzer: React.FC<HDFAnalyzerProps> = ({
  selectedFile,
  hdfData,
  fileMetadata,
  isAnalyzing = false,
}) => {
  // Set current HDF file in global context for other components
  useEffect(() => {
    if (selectedFile) {
      (window as any).currentHdfFile = selectedFile;
    }
  }, [selectedFile]);

  // Helper function to process Python result data
  const processFileMetadata = (metadata: any) => {
    if (!metadata) return null;

    // If it's a PythonResult, extract the data
    let data = metadata;
    if (metadata.success && metadata.data) {
      try {
        data = JSON.parse(metadata.data);
      } catch (e) {
        console.error('Error parsing metadata:', e);
        return null;
      }
    }

    return {
      ...data,
      size: data.size_mb ? `${data.size_mb} MB` : 'N/A',
      modified: data.modified
        ? new Date(data.modified * 1000).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A',
    };
  };

  // Helper function to process HDF structure data
  const processHdfData = (hdfData: any) => {
    if (!hdfData) return null;

    // If it's a PythonResult, extract the data
    let data = hdfData;
    if (hdfData.success && hdfData.data) {
      try {
        data = JSON.parse(hdfData.data);
      } catch (e) {
        console.error('Error parsing HDF data:', e);
        return null;
      }
    }

    return data;
  };

  const processedMetadata = processFileMetadata(fileMetadata);
  const processedHdfData = processHdfData(hdfData);

  // Count groups and datasets
  const getStructureStats = (structure: any) => {
    if (!structure || typeof structure !== 'object')
      return { groups: 0, datasets: 0 };

    let groups = 0;
    let datasets = 0;

    Object.values(structure).forEach((item: any) => {
      if (item.type === 'group') {
        groups++;
      } else if (item.type === 'dataset') {
        datasets++;
      }
    });

    return { groups, datasets };
  };

  const structureStats = getStructureStats(processedHdfData);

  // Frames para el DotLoader - animación de carga de datos
  const loadingFrames = [
    [21, 22, 23], // Línea horizontal centro
    [14, 21, 28], // Línea vertical centro
    [20, 21, 22], // Expandir horizontal
    [13, 20, 27], // Expandir vertical
    [12, 13, 14, 20, 21, 22, 26, 27, 28], // Cruz completa
    [19, 20, 21, 22, 23], // Línea horizontal expandida
    [7, 14, 21, 28, 35], // Línea vertical expandida
    [6, 7, 8, 13, 14, 15, 20, 21, 22, 26, 27, 28, 34, 35, 36], // Cruz grande
    [24, 25, 26, 31, 32, 33, 38, 39, 40], // Esquina inferior derecha
    [18, 19, 20, 25, 26, 27, 32, 33, 34], // Esquina inferior izquierda
    [10, 11, 12, 17, 18, 19, 24, 25, 26], // Esquina superior izquierda
    [16, 17, 18, 23, 24, 25, 30, 31, 32], // Esquina superior derecha
  ];

  // Debug logs
  console.log('Raw fileMetadata:', fileMetadata);
  console.log('Processed metadata:', processedMetadata);
  console.log('Raw hdfData:', hdfData);
  console.log('Processed HDF data:', processedHdfData);
  if (isAnalyzing) {
    return (
      <div className='w-full min-h-[calc(100vh-120px)] flex items-center justify-center'>
        <motion.div
          className='text-center'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Loader principal */}
          <motion.div
            className='mb-8'
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DotLoader
              frames={loadingFrames}
              duration={150}
              dotClassName='bg-blue-400/30 active:bg-blue-400 active:shadow-lg active:shadow-blue-400/50 transition-all duration-150'
              className='mx-auto mb-6'
            />
          </motion.div>

          {/* Texto animado */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.h1
              className='text-2xl font-bold text-white mb-3'
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className='eflow-brand'>eFlow</span> - Analizando Archivo
              HDF
            </motion.h1>
            <motion.p
              className='text-gray-400 text-base'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Procesando estructura y metadatos...
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!selectedFile || !processedHdfData) {
    return (
      <div className='w-full min-h-[calc(100vh-120px)] flex items-center justify-center'>
        <motion.div
          className='text-center max-w-2xl mx-auto px-4'
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Icono principal con animación sutil */}
          <motion.div
            className='mb-8'
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className='relative'
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Database className='h-24 w-24 text-gray-400 mx-auto' />

              {/* Efecto de brillo sutil */}
              <motion.div
                className='absolute inset-0 h-24 w-24 mx-auto rounded-full bg-gray-400/10'
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Título con animación de aparición */}
          <motion.h1
            className='text-4xl font-bold text-white mb-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span className='eflow-brand'>eFlow</span> - Análisis de Archivos
            HDF
          </motion.h1>

          {/* Descripción */}
          <motion.p
            className='text-gray-400 text-lg leading-relaxed mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Usa el botón "Upload HDF" en el header para seleccionar y analizar
            archivos HDF de modelos HEC-RAS 2D.
          </motion.p>

          {/* Indicador de acción */}
          <motion.div
            className='flex items-center justify-center gap-3 text-gray-500 text-base'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            >
              <Upload className='h-5 w-5' />
            </motion.div>
            <span>Haz clic en "Upload HDF" arriba para comenzar</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const fileName =
    selectedFile.split('/').pop() ||
    selectedFile.split('\\').pop() ||
    'Archivo';

  // Helper function to shorten file paths
  const shortenPath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    const parts = path.split(/[/\\]/);
    if (parts.length <= 2) return path;

    const fileName = parts[parts.length - 1];
    const firstPart = parts[0];
    const remaining = maxLength - fileName.length - firstPart.length - 6; // 6 for ".../"

    if (remaining > 0) {
      return `${firstPart}/.../${fileName}`;
    }
    return `.../${fileName}`;
  };

  return (
    <div className='w-full min-h-[calc(100vh-120px)] px-2 sm:px-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='max-w-7xl mx-auto space-y-2'
      >
        {/* Header del análisis - Compacto */}
        <motion.div
          className='p-4 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-xl border border-green-400/20 backdrop-blur-sm'
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-2 bg-green-500/20 rounded-lg'>
              <Database className='h-6 w-6 text-green-400' />
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='text-lg font-bold text-white'>
                <span className='eflow-brand'>eFlow</span> - Análisis Completo
              </h1>
              <p className='text-green-400 font-medium text-sm truncate'>
                {fileName}
              </p>
            </div>
          </div>

          {/* Metadata - Compacto y responsive */}
          {processedMetadata && (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2'>
              <div className='flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg'>
                <FileText className='h-4 w-4 text-gray-400 flex-shrink-0' />
                <div className='min-w-0'>
                  <p className='text-xs text-gray-400'>Tamaño</p>
                  <p className='text-white font-medium text-sm'>
                    {processedMetadata.size}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg'>
                <Calendar className='h-4 w-4 text-gray-400 flex-shrink-0' />
                <div className='min-w-0'>
                  <p className='text-xs text-gray-400'>Modificado</p>
                  <p className='text-white font-medium text-sm'>
                    {processedMetadata.modified}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg'>
                <Folder className='h-4 w-4 text-blue-400 flex-shrink-0' />
                <div className='min-w-0'>
                  <p className='text-xs text-gray-400'>Grupos</p>
                  <p className='text-white font-medium text-sm'>
                    {structureStats.groups}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg'>
                <Database className='h-4 w-4 text-green-400 flex-shrink-0' />
                <div className='min-w-0'>
                  <p className='text-xs text-gray-400'>Datasets</p>
                  <p className='text-white font-medium text-sm'>
                    {structureStats.datasets}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-gray-700/20 rounded-lg sm:col-span-3 lg:col-span-1'>
                <HardDrive className='h-4 w-4 text-gray-400 flex-shrink-0' />
                <div className='min-w-0 flex-1'>
                  <p className='text-xs text-gray-400'>Ruta</p>
                  <p
                    className='text-white font-medium text-xs truncate'
                    title={selectedFile}
                  >
                    {shortenPath(selectedFile, 30)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Estructura del archivo - Sin contenedor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className='text-lg font-bold text-white mb-2 flex items-center gap-2'>
            <Database className='h-5 w-5 text-blue-400' />
            Estructura del Archivo
          </h2>

          {processedHdfData ? (
            <ul
              className='text-gray-300 font-mono text-sm list-none'
              key={selectedFile}
            >
              {convertHdfToNodes(processedHdfData).map((node, index) => (
                <FilesystemItem
                  key={`${selectedFile}-${node.name || index}`}
                  node={node}
                  animated={true}
                />
              ))}
            </ul>
          ) : (
            <div className='text-gray-500 text-center py-8'>
              <Database className='h-12 w-12 mx-auto mb-3 opacity-50' />
              <p className='text-base'>
                No se pudo cargar la estructura del archivo
              </p>
              <p className='text-sm mt-2 opacity-75'>
                Verifica que el archivo HDF sea válido
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Helper function to convert flat HDF structure to hierarchical filesystem nodes
function convertHdfToNodes(structure: any): any[] {
  if (!structure || typeof structure !== 'object') return [];

  console.log('Converting HDF structure:', structure);

  // Build hierarchical structure from flat paths
  const root: any = {};

  Object.keys(structure).forEach(path => {
    const value = structure[path];
    if (!value) return; // Skip null or undefined values

    const parts = path.split('/').filter(part => part.length > 0);

    let current = root;

    // Build the path hierarchy
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current[part]) {
        if (isLast) {
          // This is a dataset/file - store the complete info
          current[part] = {
            type: value?.type || 'dataset',
            info: value,
          };
        } else {
          // This is a group/folder - check if it exists in the flat structure
          const currentPath = parts.slice(0, i + 1).join('/');
          const groupInfo = structure[currentPath];

          current[part] = {
            type: groupInfo?.type || 'group',
            info: groupInfo,
            children: {},
          };
        }
      }

      if (!isLast) {
        if (!current[part].children) {
          current[part].children = {};
        }
        current = current[part].children;
      }
    }
  });

  console.log('Built hierarchical structure:', root);

  // Convert to filesystem node format
  function buildNodes(obj: any): any[] {
    console.log('Building nodes from:', obj);
    const nodes: any[] = [];

    Object.keys(obj).forEach(key => {
      const item = obj[key];
      if (!item) return; // Skip null or undefined items

      if (item.type === 'group' || item.children) {
        // It's a folder/group
        const childNodes = buildNodes(item.children || {});
        nodes.push({
          name: key,
          type: 'group',
          nodes: childNodes,
          metadata: item.info?.attrs ? { attrs: item.info.attrs } : undefined,
        });
      } else if (item.type === 'dataset' || (!item.children && item.info)) {
        // It's a dataset/file
        const info = item.info || {};

        // Calculate size in bytes based on dtype and shape
        let sizeBytes = undefined;
        if (info.size && info.dtype) {
          const bytesPerElement = info.dtype.includes('float64')
            ? 8
            : info.dtype.includes('float32')
              ? 4
              : info.dtype.includes('int64')
                ? 8
                : info.dtype.includes('int32')
                  ? 4
                  : info.dtype.includes('int16')
                    ? 2
                    : info.dtype.includes('int8')
                      ? 1
                      : info.dtype.includes('S')
                        ? parseInt(info.dtype.match(/\d+/)?.[0] || '1')
                        : 1;
          sizeBytes = info.size * bytesPerElement;
        }

        nodes.push({
          name: key,
          type: 'dataset',
          metadata: {
            shape: info.shape,
            dtype: info.dtype,
            size: info.size,
            attrs: info.attrs,
            sizeBytes: sizeBytes,
          },
        });
      }
    });

    const sortedNodes = nodes.sort((a, b) => {
      // Sort folders first, then files
      if (a.nodes && !b.nodes) return -1;
      if (!a.nodes && b.nodes) return 1;
      return a.name.localeCompare(b.name);
    });

    console.log('Built nodes:', sortedNodes);
    return sortedNodes;
  }

  const finalNodes = buildNodes(root);
  console.log('Final nodes to render:', finalNodes);
  return finalNodes;
}

export default HDFAnalyzer;
