/**
 * Hook personalizado para usar comandos de Tauri de manera más fácil
 * Proporciona funciones tipadas y manejo de errores consistente
 */

import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  PythonResult,
  TauriError,
  processPythonResult,
  validateFilePath,
  SystemMetrics,
  FileInfo,
} from '@/types/tauri';

// Estado de carga para operaciones asíncronas
interface LoadingState {
  [key: string]: boolean;
}

// Hook principal
export function useTauri() {
  const [loading, setLoading] = useState<LoadingState>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Helper para manejar operaciones asíncronas
  const executeCommand = useCallback(
    async <T = any>(
      commandName: string,
      args: Record<string, any> = {},
      options: {
        validateFiles?: string[];
        parseResult?: boolean;
      } = {}
    ): Promise<T> => {
      const { validateFiles = [], parseResult = true } = options;

      try {
        // Validar archivos si se especifican
        validateFiles.forEach(filePath => {
          if (args[filePath]) {
            validateFilePath(args[filePath]);
          }
        });

        // Establecer estado de carga
        setLoading(prev => ({ ...prev, [commandName]: true }));
        setErrors(prev => ({ ...prev, [commandName]: '' }));

        // Ejecutar comando
        const result = await invoke(commandName, args);

        // Procesar resultado si es necesario
        if (
          parseResult &&
          result &&
          typeof result === 'object' &&
          'success' in result
        ) {
          return processPythonResult<T>(result as PythonResult);
        }

        return result as T;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        setErrors(prev => ({ ...prev, [commandName]: errorMessage }));
        throw new TauriError(errorMessage, commandName);
      } finally {
        setLoading(prev => ({ ...prev, [commandName]: false }));
      }
    },
    []
  );

  // Comandos HDF
  const hdf = {
    getFileInfo: useCallback(
      (filePath: string) =>
        executeCommand(
          'read_hdf_file_info',
          { filePath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    getFileStructure: useCallback(
      (filePath: string) =>
        executeCommand(
          'read_hdf_file_structure',
          { filePath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    findHydraulicDatasets: useCallback(
      (filePath: string) =>
        executeCommand(
          'find_hydraulic_datasets',
          { filePath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    getDetailedMetadata: useCallback(
      (filePath: string) =>
        executeCommand(
          'get_detailed_hdf_metadata',
          { filePath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    extractManningValues: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'extract_manning_values',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos de extracción de datos
  const dataExtraction = {
    extractDataset: useCallback(
      (filePath: string, datasetPath: string) =>
        executeCommand(
          'extract_hdf_dataset',
          { filePath, datasetPath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    createTimeSeriesPlot: useCallback(
      (filePath: string, datasetPath: string) =>
        executeCommand(
          'create_time_series_plot',
          { filePath, datasetPath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    createHydrograph: useCallback(
      (filePath: string, datasetPath: string) =>
        executeCommand(
          'create_hydrograph',
          { filePath, datasetPath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    exportToCsv: useCallback(
      (filePath: string, datasetPath: string) =>
        executeCommand(
          'export_hdf_to_csv',
          { filePath, datasetPath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),

    exportToJson: useCallback(
      (filePath: string, datasetPath: string) =>
        executeCommand(
          'export_hdf_to_json',
          { filePath, datasetPath },
          { validateFiles: ['filePath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos pyHMT2D
  const pyHMT2D = {
    process: useCallback(
      (
        operation: string,
        hdfFile: string,
        cellId?: number,
        outputDirectory?: string,
        terrainFile?: string
      ) =>
        executeCommand(
          'process_pyhmt2d',
          {
            operation,
            hdfFile,
            cellId,
            outputDirectory,
            terrainFile,
          },
          { validateFiles: ['hdfFile'] }
        ),
      [executeCommand]
    ),

    processHecRasData: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'process_hec_ras_data',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    createHydrograph: useCallback(
      (hdfFilePath: string, cellId?: number, terrainFilePath?: string) =>
        executeCommand(
          'create_hydrograph_py_hmt2_d',
          { hdfFilePath, cellId, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    createDepthMap: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'create_depth_map_py_hmt2_d',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    createProfile: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'create_profile_py_hmt2_d',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    exportToVtk: useCallback(
      (hdfFilePath: string, terrainFilePath?: string, exportType?: string) =>
        executeCommand(
          'export_to_vtk_py_hmt2_d',
          { hdfFilePath, terrainFilePath, exportType },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    getVtkExportInfo: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'get_vtk_export_info',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos RAS Commander
  const rasCommander = {
    getMeshInfo: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'get_comprehensive_mesh_info',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    getManningValues: useCallback(
      (hdfFilePath: string, terrainFilePath?: string) =>
        executeCommand(
          'get_manning_values_enhanced',
          { hdfFilePath, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    exportVtk: useCallback(
      (
        hdfFilePath: string,
        outputDirectory: string,
        terrainFilePath?: string
      ) =>
        executeCommand(
          'export_vtk_enhanced',
          { hdfFilePath, outputDirectory, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    getTimeSeriesData: useCallback(
      (
        hdfFilePath: string,
        meshName: string,
        variable: string,
        terrainFilePath?: string
      ) =>
        executeCommand(
          'get_time_series_data',
          { hdfFilePath, meshName, variable, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    // Alias más corto para usar en Analyzer+
    getTimeSeries: useCallback(
      (
        hdfFilePath: string,
        meshName: string,
        variable: string,
        terrainFilePath?: string
      ) =>
        executeCommand(
          'get_time_series_data',
          { hdfFilePath, meshName, variable, terrainFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos de geometría
  const geometry = {
    createSpline: useCallback(
      (pointsJson: string) =>
        executeCommand('create_spline_from_points', { pointsJson }),
      [executeCommand]
    ),

    generateCrossSections: useCallback(
      (axisJson: string, spacing: number, width: number) =>
        executeCommand('generate_cross_sections', { axisJson, spacing, width }),
      [executeCommand]
    ),
  };

  // Comandos de raster
  const raster = {
    convert: useCallback(
      (inputDataPath: string, outputDir: string) =>
        executeCommand('convert_to_raster', { inputDataPath, outputDir }),
      [executeCommand]
    ),

    getInfo: useCallback(
      (rasterPath: string) =>
        executeCommand(
          'get_raster_info',
          { rasterPath },
          { validateFiles: ['rasterPath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos de condiciones de contorno
  const boundary = {
    extractConditions: useCallback(
      (hdfFilePath: string) =>
        executeCommand(
          'extract_boundary_conditions',
          { hdfFilePath },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),

    exportHydrographData: useCallback(
      (
        hdfFilePath: string,
        boundaryConditions: string[],
        outputPath: string,
        format: string
      ) =>
        executeCommand(
          'export_hydrograph_data',
          {
            hdfFilePath,
            boundaryConditions,
            outputPath,
            format,
          },
          { validateFiles: ['hdfFilePath'] }
        ),
      [executeCommand]
    ),
  };

  // Comandos del sistema
  const system = {
    getFileInfo: useCallback(
      (filePath: string) =>
        executeCommand<FileInfo>(
          'get_file_info',
          { filePath },
          { parseResult: false }
        ),
      [executeCommand]
    ),

    getSystemMetrics: useCallback(
      () =>
        executeCommand<SystemMetrics>(
          'get_system_metrics',
          {},
          { parseResult: false }
        ),
      [executeCommand]
    ),

    openDirectory: useCallback(
      (path: string) =>
        executeCommand('open_directory', { path }, { parseResult: false }),
      [executeCommand]
    ),

    greet: useCallback(
      (name: string) =>
        executeCommand<string>('greet', { name }, { parseResult: false }),
      [executeCommand]
    ),
  };

  // Utilidades
  const isLoading = useCallback(
    (commandName?: string) => {
      if (commandName) {
        return loading[commandName] || false;
      }
      return Object.values(loading).some(Boolean);
    },
    [loading]
  );

  const getError = useCallback(
    (commandName: string) => {
      return errors[commandName] || null;
    },
    [errors]
  );

  const clearError = useCallback((commandName: string) => {
    setErrors(prev => ({ ...prev, [commandName]: '' }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    // Comandos agrupados
    hdf,
    dataExtraction,
    pyHMT2D,
    rasCommander,
    geometry,
    raster,
    boundary,
    system,

    // Utilidades
    isLoading,
    getError,
    clearError,
    clearAllErrors,

    // Estado
    loading,
    errors,
  };
}

export default useTauri;
