/**
 * 👁️ VTK Viewer Tab - Visualizador 3D de Archivos VTK
 *
 * Componente especializado para la visualización 3D de archivos VTK
 * exportados desde el análisis HEC-RAS utilizando VTK.js
 *
 * Funcionalidades:
 * - Carga de archivos VTK locales
 * - Visualización 3D interactiva
 * - Controles de cámara y renderizado
 * - Mapas de colores personalizables
 * - Modo pantalla completa
 */

import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
import {
  Eye,
  Upload,
  RotateCcw,
  // ZoomIn,
  // ZoomOut,
  Maximize,
  Minimize,
  Settings,
  // Palette,
  // Play,
  // Pause,
  // SkipBack,
  // SkipForward,
  Loader2,
  AlertCircle,
  // FileText,
} from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '@/lib/utils';
import { HecRasState } from '@/components/HecRas/index';

// Importar VTK.js
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
// import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';

interface VTKViewerTabProps {
  state: HecRasState;
  updateState: (updates: Partial<HecRasState>) => void;
}

interface VTKFile {
  path: string;
  name: string;
  type: 'depth' | 'velocity' | 'wse' | 'other';
  timeStep?: number;
}

/**
 * 👁️ Tab Visualizador VTK
 *
 * Interfaz completa para cargar y visualizar archivos VTK
 * con controles avanzados de renderizado 3D
 */
export const VTKViewerTab: React.FC<VTKViewerTabProps> = ({
  state,
}) => {
  const [loadedVTKFiles, setLoadedVTKFiles] = useState<VTKFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<VTKFile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [renderSettings] = useState({
    colorMap: 'viridis',
    opacity: 1.0,
    wireframe: false,
    lighting: true,
  });

  // Referencias para el contenedor VTK
  const vtkContainerRef = useRef<HTMLDivElement>(null);
  const renderWindowRef = useRef<any>(null);

  /**
   * 📁 Cargar archivos VTK
   */
  const handleLoadVTKFiles = async () => {
    try {
      setIsLoading(true);
      setViewerError(null);

      const selected = await open({
        multiple: true,
        filters: [
          {
            name: 'VTK Files',
            extensions: ['vtk', 'vtp', 'vtu'],
          },
          {
            name: 'All Files',
            extensions: ['*'],
          },
        ],
        title: 'Seleccionar archivos VTK para visualizar',
      });

      if (selected && Array.isArray(selected)) {
        const vtkFiles: VTKFile[] = selected.map(filePath => {
          const fileName =
            filePath.split('/').pop() || filePath.split('\\').pop() || '';

          // Detectar tipo de archivo basado en el nombre
          let type: VTKFile['type'] = 'other';
          if (fileName.includes('depth')) type = 'depth';
          else if (fileName.includes('velocity')) type = 'velocity';
          else if (fileName.includes('wse')) type = 'wse';

          // Extraer paso temporal si está presente
          const timeStepMatch = fileName.match(/_(\d+)\.vtk$/);
          const timeStep = timeStepMatch
            ? parseInt(timeStepMatch[1])
            : undefined;

          return {
            path: filePath,
            name: fileName,
            type,
            timeStep,
          };
        });

        setLoadedVTKFiles(vtkFiles);
        if (vtkFiles.length > 0) {
          setSelectedFile(vtkFiles[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando archivos VTK:', error);
      setViewerError('Error al cargar archivos VTK');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🎨 Inicializar visualizador VTK
   */
  const initializeVTKViewer = async (file: VTKFile) => {
    if (!vtkContainerRef.current) return;

    try {
      setIsLoading(true);
      setViewerError(null);

      console.log('Inicializando visualizador VTK para:', file.name);

      // Verificar que el archivo VTK existe y es real
      if (!file.path || file.path.includes('/mock/')) {
        throw new Error('Archivo VTK no válido o no encontrado');
      }

      // Limpiar contenedor anterior
      if (vtkContainerRef.current) {
        vtkContainerRef.current.innerHTML = '';
      }

      // Crear renderizador VTK
      const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        container: vtkContainerRef.current,
        background: [0.1, 0.1, 0.1], // Fondo oscuro
      });

      const renderer = fullScreenRenderer.getRenderer();
      const renderWindow = fullScreenRenderer.getRenderWindow();

      // Crear lector de archivos VTK
      const reader = vtkXMLPolyDataReader.newInstance();

      // Cargar archivo VTK
      try {
        // En un entorno real, aquí cargaríamos el archivo desde el sistema de archivos
        // Por ahora, mostraremos un placeholder hasta que tengamos archivos VTK reales
        console.log('Cargando archivo VTK desde:', file.path);

        // Crear mapper y actor
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();

        // Configurar pipeline de renderizado
        mapper.setInputConnection(reader.getOutputPort());
        actor.setMapper(mapper);

        // Configurar colores y propiedades
        const colorTransferFunction = vtkColorTransferFunction.newInstance();
        colorTransferFunction.addRGBPoint(0.0, 0.0, 0.0, 1.0); // Azul para valores bajos
        colorTransferFunction.addRGBPoint(0.5, 0.0, 1.0, 0.0); // Verde para valores medios
        colorTransferFunction.addRGBPoint(1.0, 1.0, 0.0, 0.0); // Rojo para valores altos

        mapper.setLookupTable(colorTransferFunction);

        // Configurar propiedades del actor
        const property = actor.getProperty();
        property.setOpacity(renderSettings.opacity);
        property.setRepresentation(renderSettings.wireframe ? 1 : 2); // 1=wireframe, 2=surface

        // Agregar actor al renderer
        renderer.addActor(actor);
        renderer.resetCamera();

        // Configurar iluminación
        if (renderSettings.lighting) {
          property.setAmbient(0.3);
          property.setDiffuse(0.7);
          property.setSpecular(0.3);
        }

        renderWindow.render();
        renderWindowRef.current = renderWindow;

      } catch (error) {
        console.error('Error cargando archivo VTK:', error);
        throw new Error('No se pudo cargar el archivo VTK');
      }
    } catch (error) {
      console.error('Error inicializando VTK viewer:', error);
      setViewerError('Error al inicializar el visualizador 3D');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 🔄 Cambiar archivo seleccionado
   */
  const handleFileSelect = (file: VTKFile) => {
    setSelectedFile(file);
    initializeVTKViewer(file);
  };

  /**
   * 🎨 Obtener color por tipo de archivo
   */
  const getFileTypeColor = (type: VTKFile['type']) => {
    switch (type) {
      case 'depth':
        return 'text-blue-400';
      case 'velocity':
        return 'text-green-400';
      case 'wse':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * 📊 Obtener icono por tipo de archivo
   */
  const getFileTypeIcon = (type: VTKFile['type']) => {
    switch (type) {
      case 'depth':
        return '🌊';
      case 'velocity':
        return '⚡';
      case 'wse':
        return '📏';
      default:
        return '📄';
    }
  };

  // Cargar archivos VTK reales cuando estén disponibles
  useEffect(() => {
    if (state.exportedVTKFiles.length > 0 && loadedVTKFiles.length === 0) {
      // Crear lista de archivos VTK reales desde las rutas exportadas
      const realVTKFiles: VTKFile[] = state.exportedVTKFiles
        .filter(filePath => filePath && !filePath.includes('/mock/'))
        .map(filePath => {
          const fileName = filePath.split('/').pop() || filePath;
          return {
            path: filePath,
            name: fileName,
            type: fileName.includes('depth')
              ? 'depth'
              : fileName.includes('velocity')
                ? 'velocity'
                : fileName.includes('wse')
                  ? 'wse'
                  : 'other',
            timeStep: fileName.match(/_(\d+)\.vtk$/)
              ? parseInt(fileName.match(/_(\d+)\.vtk$/)![1])
              : undefined,
          };
        });

      if (realVTKFiles.length > 0) {
        setLoadedVTKFiles(realVTKFiles);
        setSelectedFile(realVTKFiles[0]);
      }
    }
  }, [state.exportedVTKFiles]);

  return (
    <div className='space-y-4'>
      {/* 📋 Título y descripción */}
      <div className='text-center'>
        <h2 className='text-2xl font-bold text-white mb-2'>
          Visualizador VTK 3D
        </h2>
        <p className='text-white/60'>
          Visualización interactiva de archivos VTK exportados desde HEC-RAS
        </p>
      </div>

      {/* 🎛️ Panel de control - Solo mostrar si hay archivos cargados */}
      {loadedVTKFiles.length > 0 && (
        <div className='bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10'>
          {/* Controles de vista - Solo mostrar si hay archivo seleccionado */}
          {selectedFile && (
            <div className='flex items-center justify-end gap-2 mb-6'>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className='p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors'
                title={
                  isFullscreen
                    ? 'Salir de pantalla completa'
                    : 'Pantalla completa'
                }
              >
                {isFullscreen ? (
                  <Minimize className='h-4 w-4' />
                ) : (
                  <Maximize className='h-4 w-4' />
                )}
              </button>
              <button
                className='p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors'
                title='Resetear vista'
              >
                <RotateCcw className='h-4 w-4' />
              </button>
              <button
                className='p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors'
                title='Configuración'
              >
                <Settings className='h-4 w-4' />
              </button>
            </div>
          )}

          {/* 📁 Lista de archivos cargados */}
          <div className='mb-6'>
            <h4 className='text-white font-medium mb-3'>Archivos Cargados</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto'>
              {loadedVTKFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => handleFileSelect(file)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg text-left transition-all border',
                    selectedFile?.path === file.path
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className='text-lg'>{getFileTypeIcon(file.type)}</span>
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium truncate'>{file.name}</p>
                    <p className={cn('text-xs', getFileTypeColor(file.type))}>
                      {file.type.toUpperCase()}
                      {file.timeStep !== undefined &&
                        ` - Paso ${file.timeStep}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ Área de visualización */}
      <div
        className={cn(
          'bg-black rounded-2xl border border-white/10 relative overflow-hidden',
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[600px]'
        )}
      >
        {/* Contenedor VTK */}
        <div ref={vtkContainerRef} className='w-full h-full' />

        {/* Estado de carga */}
        {isLoading && (
          <div className='absolute inset-0 bg-black/80 flex items-center justify-center'>
            <div className='text-center'>
              <Loader2 className='h-12 w-12 text-blue-400 animate-spin mx-auto mb-4' />
              <p className='text-white font-medium'>
                Cargando visualización 3D...
              </p>
              <p className='text-white/60 text-sm'>Procesando archivo VTK</p>
            </div>
          </div>
        )}

        {/* Estado sin archivos */}
        {!selectedFile && !isLoading && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <Eye className='h-16 w-16 text-white/40 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                Visualizador VTK 3D
              </h3>
              <p className='text-white/60 mb-4'>
                Carga archivos VTK para comenzar la visualización
              </p>
              <button
                onClick={handleLoadVTKFiles}
                className='bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-200 px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto'
              >
                <Upload className='h-4 w-4' />
                Cargar Archivos VTK
              </button>
            </div>
          </div>
        )}

        {/* Placeholder de visualización */}
        {selectedFile && !isLoading && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10'>
                <span className='text-4xl'>
                  {getFileTypeIcon(selectedFile.type)}
                </span>
              </div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                {selectedFile.name}
              </h3>
              <p className='text-white/60 mb-4'>
                Visualización 3D - {selectedFile.type.toUpperCase()}
              </p>
              <div className='bg-white/10 rounded-lg p-4 max-w-md mx-auto'>
                <p className='text-white/80 text-sm'>
                  <strong>Nota:</strong> La visualización VTK 3D se implementará
                  completamente con VTK.js. Este es un placeholder que muestra
                  la estructura y controles del visualizador.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error de visualización */}
        {viewerError && (
          <div className='absolute inset-0 bg-red-500/10 flex items-center justify-center'>
            <div className='text-center'>
              <AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
              <h3 className='text-xl font-semibold text-red-200 mb-2'>
                Error de Visualización
              </h3>
              <p className='text-red-300/80 mb-4'>{viewerError}</p>
              <button
                onClick={() => setViewerError(null)}
                className='bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-200 px-4 py-2 rounded-lg transition-colors'
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 💡 Información del visualizador */}
      <div className='bg-blue-500/10 border border-blue-400/30 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <Eye className='h-5 w-5 text-blue-400 mt-0.5' />
          <div>
            <h4 className='font-medium text-blue-200 mb-1'>
              Visualizador VTK 3D
            </h4>
            <p className='text-blue-300/80 text-sm'>
              Este módulo utiliza VTK.js para proporcionar visualización 3D
              interactiva de los archivos VTK exportados. Incluye controles de
              cámara, mapas de colores personalizables y modo pantalla completa
              para análisis detallado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VTKViewerTab;
