import { useState } from 'react';
import {
  ChevronRight,
  Folder,
  Database,
  Hash,
  Layers,
  Info,
  Eye,
  Download,
  BarChart3,
  Copy,
} from 'lucide-react';
import { IconButton } from './IconButton';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from './context-menu';
import { DataViewerModal } from './data-viewer-modal';

type Node = {
  name: string;
  nodes?: Node[];
  type?: 'group' | 'dataset';
  metadata?: {
    shape?: number[];
    dtype?: string;
    size?: number;
    attrs?: Record<string, any>;
    sizeBytes?: number;
  };
};

interface FilesystemItemProps {
  node: Node;
  animated?: boolean;
  path?: string;
}

export function FilesystemItem({
  node,
  animated = false,
  path = '',
}: FilesystemItemProps) {
  let [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Construir la ruta completa del nodo
  const fullPath = path ? `${path}/${node.name}` : node.name;

  // Funciones del menú contextual
  const handleViewData = () => {
    setIsModalOpen(true);
  };

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      // Get the current HDF file path from context or props
      const hdfFilePath = (window as any).currentHdfFile || '';

      if (!hdfFilePath) {
        console.error('No HDF file selected');
        return;
      }

      const { invoke } = await import('@tauri-apps/api/core');

      let result;
      if (format === 'csv') {
        result = await invoke('export_hdf_to_csv', {
          filePath: hdfFilePath,
          datasetPath: fullPath,
        });
      } else if (format === 'json') {
        result = await invoke('export_hdf_to_json', {
          filePath: hdfFilePath,
          datasetPath: fullPath,
        });
      }

      // Parse the result
      const response = JSON.parse((result as any).data || '{}');

      if ((result as any).success && response.success) {
        console.log(`${format.toUpperCase()} export successful`);
      } else if (response.error === 'Exportación cancelada por el usuario') {
        console.log('Export cancelled by user');
      } else {
        console.error('Export failed:', response.error);
      }
    } catch (error) {
      console.error(`Error exporting ${node.name} as ${format}:`, error);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullPath);
  };

  const handleVisualize = () => {
    setIsModalOpen(true);
  };

  // Helper function to format file size
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  };

  // Helper function to format shape
  const formatShape = (shape?: number[]) => {
    if (!shape || shape.length === 0) return '';
    return `[${shape.join('×')}]`;
  };

  // Helper function to get appropriate icon
  const getIcon = () => {
    if (node.nodes) {
      // It's a group/folder
      return <Folder className='size-5 text-blue-400 fill-blue-400/20' />;
    } else {
      // It's a dataset/file
      if (node.metadata?.dtype) {
        // Show different icons based on data type
        if (node.metadata.dtype.includes('float')) {
          return <Hash className='size-5 text-green-400' />;
        } else if (node.metadata.dtype.includes('int')) {
          return <Layers className='size-5 text-yellow-400' />;
        } else if (
          node.metadata.dtype.includes('string') ||
          node.metadata.dtype.includes('S')
        ) {
          return <Info className='size-5 text-purple-400' />;
        }
      }
      return <Database className='size-5 text-gray-400' />;
    }
  };

  // Chevron icon component
  const ChevronIcon = () =>
    animated ? (
      <motion.span
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
        className='flex'
      >
        <ChevronRight className='size-4 text-gray-400' />
      </motion.span>
    ) : (
      <ChevronRight
        className={`size-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
      />
    );

  const ChildrenList = () => {
    const children = node.nodes?.map(childNode => (
      <FilesystemItem
        node={childNode}
        key={childNode.name}
        animated={animated}
        path={fullPath}
      />
    ));

    if (animated) {
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className='pl-6 overflow-hidden flex flex-col justify-end list-none'
            >
              {children}
            </motion.ul>
          )}
        </AnimatePresence>
      );
    }

    return isOpen && <ul className='pl-6 list-none'>{children}</ul>;
  };

  return (
    <li key={node.name} className='list-none'>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className='flex items-center gap-2 py-1.5 text-sm hover:bg-white/5 rounded-md px-2 transition-colors group'>
            {/* Chevron button for expandable items */}
            {node.nodes && node.nodes.length > 0 && (
              <IconButton
                onClick={() => setIsOpen(!isOpen)}
                variant='minimal'
                size='sm'
                icon={<ChevronIcon />}
                className='-m-1 hover:bg-white/10'
                animate={false}
              />
            )}

            {/* Icon */}
            <div
              className={
                node.nodes && node.nodes.length === 0 ? 'ml-[24px]' : ''
              }
            >
              {getIcon()}
            </div>

            {/* Name and metadata */}
            <div className='flex-1 min-w-0 flex items-center justify-between'>
              <span className='truncate text-gray-300 hover:text-white transition-colors font-medium'>
                {node.name}
              </span>

              {/* Metadata for datasets */}
              {!node.nodes && node.metadata && (
                <div className='flex items-center gap-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {node.metadata.shape && (
                    <span className='bg-gray-800/50 px-2 py-1 rounded text-blue-300'>
                      {formatShape(node.metadata.shape)}
                    </span>
                  )}
                  {node.metadata.dtype && (
                    <span className='bg-gray-800/50 px-2 py-1 rounded text-green-300'>
                      {node.metadata.dtype}
                    </span>
                  )}
                  {node.metadata.sizeBytes && (
                    <span className='bg-gray-800/50 px-2 py-1 rounded text-yellow-300'>
                      {formatSize(node.metadata.sizeBytes)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={handleViewData}>
            <Eye className='mr-2 h-4 w-4' />
            Ver Información
          </ContextMenuItem>

          {node.type === 'dataset' && (
            <>
              <ContextMenuItem onClick={handleVisualize}>
                <BarChart3 className='mr-2 h-4 w-4' />
                Visualizar Datos
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleExportData('csv')}>
                <Download className='mr-2 h-4 w-4' />
                Exportar como CSV
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleExportData('json')}>
                <Download className='mr-2 h-4 w-4' />
                Exportar como JSON
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleCopyPath}>
            <Copy className='mr-2 h-4 w-4' />
            Copiar Ruta
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ChildrenList />

      {/* Modal para visualizar datos */}
      <DataViewerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          name: node.name,
          type: node.type || 'dataset',
          metadata: node.metadata,
          path: fullPath,
        }}
      />
    </li>
  );
}
