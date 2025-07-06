/**
 * 📁 File Upload Component for HEC-RAS Suite
 *
 * Componente hermoso basado en el example.tsx con animaciones SVG
 * y diseño elegante, adaptado para Tauri y tipos de archivo HEC-RAS
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, X } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

// 🎯 Tipos de archivo predefinidos
export type FileType = 'hdf' | 'terrain' | 'vtk' | 'custom';

type FileStatus = 'idle' | 'dragging' | 'uploading' | 'error';

// interface FileError {
//   message: string;
//   code: string;
// }

// 🎨 Configuración de tipos de archivo
const fileTypeConfig = {
  hdf: {
    extensions: ['hdf', 'h5', 'hdf5'],
    name: 'HDF Files',
    description: 'Archivos de resultados HEC-RAS',
    icon: '📊',
    color: 'blue',
    accept: '.hdf,.h5,.hdf5',
    acceptedTypes: ['application/x-hdf', 'application/octet-stream'],
  },
  terrain: {
    extensions: ['tif', 'tiff', 'asc', 'dem'],
    name: 'Terrain Files',
    description: 'Archivos de terreno/DEM',
    icon: '🗺️',
    color: 'green',
    accept: '.tif,.tiff,.asc,.dem',
    acceptedTypes: ['image/tiff', 'text/plain', 'application/octet-stream'],
  },
  vtk: {
    extensions: ['vtk', 'vtp', 'vtu'],
    name: 'VTK Files',
    description: 'Archivos de visualización VTK',
    icon: '🎯',
    color: 'purple',
    accept: '.vtk,.vtp,.vtu',
    acceptedTypes: ['application/octet-stream', 'text/plain'],
  },
  custom: {
    extensions: ['*'],
    name: 'All Files',
    description: 'Todos los archivos',
    icon: '📄',
    color: 'gray',
    accept: '*',
    acceptedTypes: ['*'],
  },
};

// 🎨 Componente de ilustración de upload con animaciones SVG hermosas
const UploadIllustration = () => (
  <div className='relative w-16 h-16'>
    <svg
      viewBox='0 0 100 100'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='w-full h-full'
      aria-label='Upload illustration'
    >
      <title>Upload File Illustration</title>
      <circle
        cx='50'
        cy='50'
        r='45'
        className='stroke-gray-200 dark:stroke-gray-700'
        strokeWidth='2'
        strokeDasharray='4 4'
      >
        <animateTransform
          attributeName='transform'
          type='rotate'
          from='0 50 50'
          to='360 50 50'
          dur='60s'
          repeatCount='indefinite'
        />
      </circle>

      <path
        d='M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z'
        className='fill-blue-100 dark:fill-blue-900/30 stroke-blue-500 dark:stroke-blue-400'
        strokeWidth='2'
      >
        <animate
          attributeName='d'
          dur='2s'
          repeatCount='indefinite'
          values='
                        M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z;
                        M30 38H70C75 38 75 43 75 43V68C75 73 70 73 70 73H30C25 73 25 68 25 68V43C25 38 30 38 30 38Z;
                        M30 35H70C75 35 75 40 75 40V65C75 70 70 70 70 70H30C25 70 25 65 25 65V40C25 35 30 35 30 35Z'
        />
      </path>

      <path
        d='M30 35C30 35 35 35 40 35C45 35 45 30 50 30C55 30 55 35 60 35C65 35 70 35 70 35'
        className='stroke-blue-500 dark:stroke-blue-400'
        strokeWidth='2'
        fill='none'
      />

      <g className='transform translate-y-2'>
        <line
          x1='50'
          y1='45'
          x2='50'
          y2='60'
          className='stroke-blue-500 dark:stroke-blue-400'
          strokeWidth='2'
          strokeLinecap='round'
        >
          <animate
            attributeName='y2'
            values='60;55;60'
            dur='2s'
            repeatCount='indefinite'
          />
        </line>
        <polyline
          points='42,52 50,45 58,52'
          className='stroke-blue-500 dark:stroke-blue-400'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        >
          <animate
            attributeName='points'
            values='42,52 50,45 58,52;42,47 50,40 58,47;42,52 50,45 58,52'
            dur='2s'
            repeatCount='indefinite'
          />
        </polyline>
      </g>
    </svg>
  </div>
);

interface FileUploadProps {
  /** Tipo de archivo a cargar */
  fileType: FileType;
  /** Archivo seleccionado actualmente */
  selectedFile?: string | null;
  /** Callback cuando se selecciona un archivo */
  onFileSelect: (filePath: string) => void;
  /** Callback cuando se remueve un archivo */
  onFileRemove?: () => void;
  /** Estado de carga */
  isLoading?: boolean;
  /** Si es requerido u opcional */
  required?: boolean;
  /** Texto personalizado */
  label?: string;
  /** Descripción personalizada */
  description?: string;
  /** Extensiones personalizadas */
  customExtensions?: string[];
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
  /** Estilo del componente */
  variant?: 'default' | 'compact' | 'minimal';
  /** Clase CSS personalizada */
  className?: string;
}

/**
 * 📁 Componente de Carga de Archivos
 *
 * Componente hermoso con animaciones basado en example.tsx
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  fileType,
  selectedFile,
  onFileSelect,
  onFileRemove,
  isLoading = false,
  required: _required = true,
  label,
  description,
  customExtensions,
  size: _size = 'md',
  variant = 'default',
  className,
}) => {
  const [status, setStatus] = useState<FileStatus>('idle');
  // const [error, setError] = useState<FileError | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // Configuración del tipo de archivo
  const config = fileTypeConfig[fileType];
  const extensions = customExtensions || config.extensions;
  const displayLabel = label || config.name;
  const displayDescription = description || config.description;
  // const acceptedFileTypes = config.acceptedTypes;

  useEffect(() => {
    return () => {
      setStatus('idle');
    };
  }, []);

  const handleTauriFileSelect = useCallback(async () => {
    if (isLoading) return;

    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: config.name,
            extensions: extensions.filter(ext => ext !== '*'),
          },
          ...(extensions.includes('*')
            ? [{ name: 'All Files', extensions: ['*'] }]
            : []),
        ],
        title: `Seleccionar ${displayLabel}`,
      });

      if (selected && typeof selected === 'string') {
        onFileSelect(selected);
      }
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
    }
  }, [isLoading, config.name, extensions, displayLabel, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus(prev => (prev !== 'uploading' ? 'dragging' : prev));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus(prev => (prev === 'dragging' ? 'idle' : prev));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (status === 'uploading') return;
      setStatus('idle');
      // En Tauri no podemos usar drag & drop de archivos directamente
      // Así que abrimos el diálogo
      handleTauriFileSelect();
    },
    [status, handleTauriFileSelect]
  );

  const resetState = useCallback(() => {
    setStatus('idle');
    if (onFileRemove) onFileRemove();
  }, [onFileRemove]);

  // Para variantes simples, usar Tauri directamente
  if (variant === 'compact' || variant === 'minimal') {
    return (
      <div className='space-y-2'>
        <div className='flex items-center gap-3'>
          <Button
            onClick={handleTauriFileSelect}
            disabled={isLoading}
            variant={selectedFile ? 'default' : 'ghost'}
            size='sm'
            className={cn(
              'flex items-center gap-2',
              selectedFile
                ? 'bg-gradient-to-r from-green-500/30 to-emerald-400/30 border-green-400/20 text-green-300'
                : ''
            )}
          >
            {isLoading ? (
              <UploadCloud className='h-4 w-4 animate-spin' />
            ) : selectedFile ? (
              <CheckCircle className='h-4 w-4' />
            ) : (
              <UploadCloud className='h-4 w-4' />
            )}
            <span className='font-medium text-sm'>
              {isLoading
                ? 'Cargando...'
                : selectedFile
                  ? 'Cargado'
                  : displayLabel}
            </span>
          </Button>

          {selectedFile && onFileRemove && (
            <IconButton
              onClick={onFileRemove}
              variant='minimal'
              size='sm'
              icon={<X className='h-4 w-4' />}
              tooltip='Remover archivo'
              className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
            />
          )}
        </div>

        {/* Ruta oculta - solo mostrar botón verde "Cargado" */}
      </div>
    );
  }

  // Variante default con el diseño hermoso del example.tsx
  return (
    <div
      className={cn('relative w-full max-w-sm mx-auto', className || '')}
      role='complementary'
      aria-label='File upload'
    >
      <div className='group relative w-full rounded-xl bg-gradient-to-br from-[#131414]/80 to-[#0f1010]/80 ring-1 ring-white/10 p-0.5 backdrop-blur-sm'>
        <div className='absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent' />

        <div className='relative w-full rounded-[10px] bg-gradient-to-br from-[#131414]/60 to-[#0f1010]/40 p-1.5'>
          <div
            className={cn(
              'relative mx-auto w-full overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-br from-[#131414]/90 to-[#0f1010]/90 backdrop-blur-sm',
              status === 'error' ? 'border-red-500/50' : ''
            )}
          >
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-300',
                status === 'dragging' ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className='absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-blue-500/10 to-transparent' />
              <div className='absolute inset-x-0 bottom-0 h-[20%] bg-gradient-to-t from-blue-500/10 to-transparent' />
              <div className='absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-blue-500/10 to-transparent' />
              <div className='absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-blue-500/10 to-transparent' />
              <div className='absolute inset-[20%] bg-blue-500/5 rounded-lg transition-all duration-300 animate-pulse' />
            </div>

            <div className='absolute -right-4 -top-4 h-8 w-8 bg-gradient-to-br from-blue-500/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

            <div className='relative h-[240px]'>
              <AnimatePresence mode='wait'>
                {status === 'idle' || status === 'dragging' ? (
                  <motion.div
                    key='dropzone'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: status === 'dragging' ? 0.8 : 1,
                      y: 0,
                      scale: status === 'dragging' ? 0.98 : 1,
                    }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='absolute inset-0 flex flex-col items-center justify-center p-6'
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className='mb-4'>
                      <UploadIllustration />
                    </div>

                    <div className='text-center space-y-1.5 mb-4'>
                      <h3 className='text-lg font-semibold text-gray-900 dark:text-white tracking-tight'>
                        {displayLabel}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {extensions
                          .filter(ext => ext !== '*')
                          .join(', ')
                          .toUpperCase()}{' '}
                        hasta 500MB
                      </p>
                    </div>

                    <div className='flex items-center gap-3 w-4/5'>
                      <Button
                        onClick={handleTauriFileSelect}
                        disabled={isLoading}
                        variant={selectedFile ? 'default' : 'ghost'}
                        size='default'
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50',
                          selectedFile
                            ? 'bg-gradient-to-r from-green-500/30 to-emerald-400/30 border-green-400/20 text-green-300 hover:from-green-500/40 hover:to-emerald-400/40'
                            : ''
                        )}
                      >
                        {isLoading ? (
                          <>
                            <UploadCloud className='w-4 h-4 animate-spin' />
                            <span>Cargando...</span>
                          </>
                        ) : selectedFile ? (
                          <>
                            <CheckCircle className='w-4 h-4' />
                            <span>Cargado</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className='w-4 h-4' />
                            <span>Seleccionar Archivo</span>
                          </>
                        )}
                      </Button>

                      {selectedFile && onFileRemove && (
                        <IconButton
                          onClick={onFileRemove}
                          variant='minimal'
                          size='sm'
                          icon={<X className='w-4 h-4' />}
                          tooltip='Remover archivo'
                          className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
                        />
                      )}
                    </div>

                    <p className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
                      {displayDescription}
                    </p>
                  </motion.div>
                ) : status === 'uploading' ? (
                  <motion.div
                    key='uploading'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className='absolute inset-0 flex flex-col items-center justify-center p-6'
                  >
                    <div className='mb-4'>
                      <UploadCloud className='w-16 h-16 text-blue-500 animate-pulse' />
                    </div>

                    <div className='text-center space-y-1.5 mb-4'>
                      <h3 className='text-sm font-semibold text-gray-900 dark:text-white truncate'>
                        Procesando archivo...
                      </h3>
                      <div className='flex items-center justify-center gap-2 text-xs'>
                        <span className='font-medium text-blue-500'>
                          Cargando...
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={resetState}
                      type='button'
                      className='w-4/5 flex items-center justify-center gap-2 rounded-lg bg-gray-100 dark:bg-white/10 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white transition-all duration-200 hover:bg-gray-200 dark:hover:bg-white/20'
                    >
                      Cancelar
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg'
                >
                  <p className='text-sm text-red-500 dark:text-red-400'>
                    {'Error al cargar el archivo'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
