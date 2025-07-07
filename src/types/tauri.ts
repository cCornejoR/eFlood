/**
 * Tipos TypeScript para la comunicación con Tauri y el backend Python
 * Estos tipos definen las interfaces para los comandos de Tauri y las respuestas del backend
 */

// Resultado base de Python
export interface PythonResult {
  success: boolean;
  data?: string | null;
  error?: string | null;
}

// Información de archivo
export interface FileInfo {
  size: number;
  modified: number;
}

// Información de archivo HDF
export interface HDFFileInfo {
  name: string;
  path: string;
  size_mb: number;
  modified: number;
}

// Métricas del sistema
export interface SystemMetrics {
  memory_usage_mb: number;
  cpu_usage_percent: number;
  gpu_usage_percent: number;
  total_memory_mb: number;
  available_memory_mb: number;
  process_id: number;
  cpu_cores: number;
}

// Comandos de Tauri para operaciones HDF
export interface TauriHDFCommands {
  read_hdf_file_info: (filePath: string) => Promise<PythonResult>;
  read_hdf_file_structure: (filePath: string) => Promise<PythonResult>;
  find_hydraulic_datasets: (filePath: string) => Promise<PythonResult>;
  get_detailed_hdf_metadata: (filePath: string) => Promise<PythonResult>;
  extract_manning_values: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
}

// Comandos de Tauri para operaciones de raster
export interface TauriRasterCommands {
  convert_to_raster: (
    inputDataPath: string,
    outputDir: string
  ) => Promise<PythonResult>;
  get_raster_info: (rasterPath: string) => Promise<PythonResult>;
}

// Comandos de Tauri para operaciones de geometría
export interface TauriGeometryCommands {
  create_spline_from_points: (pointsJson: string) => Promise<PythonResult>;
  generate_cross_sections: (
    axisJson: string,
    spacing: number,
    width: number
  ) => Promise<PythonResult>;
}

// Comandos de Tauri para extracción de datos HDF
export interface TauriDataExtractionCommands {
  extract_hdf_dataset: (
    filePath: string,
    datasetPath: string
  ) => Promise<PythonResult>;
  create_time_series_plot: (
    filePath: string,
    datasetPath: string
  ) => Promise<PythonResult>;
  create_hydrograph: (
    filePath: string,
    datasetPath: string
  ) => Promise<PythonResult>;
  export_hdf_to_csv: (
    filePath: string,
    datasetPath: string
  ) => Promise<PythonResult>;
  export_hdf_to_json: (
    filePath: string,
    datasetPath: string
  ) => Promise<PythonResult>;
}

// Comandos de Tauri para pyHMT2D
export interface TauriPyHMT2DCommands {
  process_pyhmt2d: (
    operation: string,
    hdfFile: string,
    cellId?: number,
    outputDirectory?: string,
    terrainFile?: string
  ) => Promise<PythonResult>;
  process_hec_ras_data: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  create_hydrograph_py_hmt2_d: (
    hdfFilePath: string,
    cellId?: number,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  create_depth_map_py_hmt2_d: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  create_profile_py_hmt2_d: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  export_to_vtk_py_hmt2_d: (
    hdfFilePath: string,
    terrainFilePath?: string,
    exportType?: string
  ) => Promise<PythonResult>;
  get_vtk_export_info: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
}

// Comandos de Tauri para RAS Commander
export interface TauriRASCommanderCommands {
  get_comprehensive_mesh_info: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  get_manning_values_enhanced: (
    hdfFilePath: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  export_vtk_enhanced: (
    hdfFilePath: string,
    outputDirectory: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
  get_time_series_data: (
    hdfFilePath: string,
    meshName: string,
    variable: string,
    terrainFilePath?: string
  ) => Promise<PythonResult>;
}

// Tipos específicos para Analyzer+
export interface AnalyzerPlusData {
  projectMetadata?: ProjectMetadata;
  meshInfo?: MeshInfo;
  manningValues?: ManningValues;
  hydrographData?: HydrographData;
  timeSeriesData?: TimeSeriesData;
}

export interface ProjectMetadata {
  file_info: {
    hdf_file: string;
    terrain_file?: string;
    analysis_date: string;
  };
  mesh_summary?: MeshInfo;
  manning_summary?: ManningValues;
  temporal_summary?: TimeSeriesData;
}

export interface MeshInfo {
  total_cells?: number;
  total_nodes?: number;
  mesh_areas?: number;
  mesh_names?: string[];
  cell_size_avg?: number;
  cell_size_min?: number;
  cell_size_max?: number;
  coordinate_system?: string;
  bounds?: {
    min_x: number;
    max_x: number;
    min_y: number;
    max_y: number;
  };
}

export interface ManningValues {
  zones?: ManningZone[];
  total_zones?: number;
  average_value?: number;
  calibration_info?: {
    base_values: Record<string, number>;
    calibrated_values: Record<string, number>;
    calibration_factors: Record<string, number>;
  };
}

export interface ManningZone {
  name: string;
  value: number;
  description: string;
  area_coverage?: number;
  calibration_factor?: number;
}

export interface HydrographData {
  time_steps?: number;
  duration_hours?: number;
  peak_value?: number;
  peak_time?: string;
  base_flow?: number;
  total_volume?: number;
  statistics?: {
    mean: number;
    median: number;
    std_dev: number;
    min: number;
    max: number;
  };
  data_points?: Array<{
    time: string;
    value: number;
  }>;
}

export interface TimeSeriesData {
  mesh_name: string;
  variable: string;
  time_range: {
    start: string;
    end: string;
  };
  data_points: Array<{
    time: string;
    value: number;
  }>;
  statistics: {
    count: number;
    mean: number;
    std: number;
    min: number;
    max: number;
  };
}

// Comandos de Tauri para condiciones de contorno
export interface TauriBoundaryCommands {
  extract_boundary_conditions: (hdfFilePath: string) => Promise<PythonResult>;
  export_hydrograph_data: (
    hdfFilePath: string,
    boundaryConditions: string[],
    outputPath: string,
    format: string
  ) => Promise<PythonResult>;
}

// Comandos de Tauri para sistema
export interface TauriSystemCommands {
  get_file_info: (filePath: string) => Promise<FileInfo>;
  get_system_metrics: () => Promise<SystemMetrics>;
  open_directory: (path: string) => Promise<void>;
  greet: (name: string) => Promise<string>;
}

// Interfaz completa de comandos de Tauri
export interface TauriCommands
  extends TauriHDFCommands,
    TauriRasterCommands,
    TauriGeometryCommands,
    TauriDataExtractionCommands,
    TauriPyHMT2DCommands,
    TauriRASCommanderCommands,
    TauriBoundaryCommands,
    TauriSystemCommands {}

// Tipos para datos específicos del dominio
// Tipos duplicados eliminados - usar las definiciones más arriba

export interface BoundaryCondition {
  name: string;
  type: string;
  location: {
    x: number;
    y: number;
  };
  data: number[];
  time_series?: number[];
}

// Tipos de operaciones
export type HDFOperation = 'info' | 'structure' | 'hydraulic' | 'metadata';
export type RasterOperation = 'convert' | 'info';
export type GeometryOperation = 'spline' | 'sections';
export type DataExtractionOperation =
  | 'extract'
  | 'plot'
  | 'hydrograph'
  | 'export_csv'
  | 'export_json';
export type PyHMT2DOperation =
  | 'process'
  | 'hydrograph'
  | 'depth_map'
  | 'profile'
  | 'export_vtk';
export type ExportFormat = 'csv' | 'json' | 'excel' | 'vtk';

// Utilidades para manejo de errores
export class TauriError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly pythonError?: string | null
  ) {
    super(message);
    this.name = 'TauriError';
  }
}

// Helper para procesar resultados de Python
export function processPythonResult<T = any>(result: PythonResult): T {
  if (!result.success) {
    throw new TauriError(
      result.error || 'Unknown error occurred',
      'unknown',
      result.error
    );
  }

  if (result.data) {
    try {
      return JSON.parse(result.data);
    } catch {
      return result.data as T;
    }
  }

  return null as T;
}

// Helper para validar archivos antes de enviar comandos
export function validateFilePath(filePath: string): void {
  if (!filePath || filePath.trim() === '') {
    throw new TauriError('File path cannot be empty', 'validation');
  }

  // Validaciones adicionales pueden agregarse aquí
  const validExtensions = ['.hdf', '.h5', '.tif', '.tiff', '.json', '.csv'];
  const hasValidExtension = validExtensions.some(ext =>
    filePath.toLowerCase().endsWith(ext)
  );

  if (!hasValidExtension) {
    console.warn(`File extension may not be supported: ${filePath}`);
  }
}
