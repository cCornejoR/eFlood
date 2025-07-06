use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Command;
use std::fs;
use tauri::AppHandle;
use sysinfo::{System, Pid};

// Constants for better maintainability
const HECRAS_PROCESSOR_SCRIPT: &str = "HECRAS-HDF/hecras_processor.py";
const NULL_ARG: &str = "null";

/// System metrics structure for monitoring app performance
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    /// Memory usage in MB
    pub memory_usage_mb: f64,
    /// CPU usage percentage (0-100)
    pub cpu_usage_percent: f64,
    /// GPU usage percentage (0-100) - may be 0 if not available
    pub gpu_usage_percent: f64,
    /// Total system memory in MB
    pub total_memory_mb: f64,
    /// Available system memory in MB
    pub available_memory_mb: f64,
    /// Process ID of the current application
    pub process_id: u32,
    /// Number of CPU cores
    pub cpu_cores: usize,
}

/// Helper function to convert optional terrain file path to string argument
///
/// # Arguments
/// * `terrain_file_path` - Optional path to terrain file
///
/// # Returns
/// * String - Either the provided path or "null" if None
fn terrain_arg_or_null(terrain_file_path: Option<String>) -> String {
    terrain_file_path.unwrap_or_else(|| NULL_ARG.to_string())
}

/// Helper function to create a consistent error result
///
/// # Arguments
/// * `error_message` - The error message to include
///
/// # Returns
/// * PythonResult - A failed result with the error message
fn create_error_result(error_message: &str) -> PythonResult {
    PythonResult {
        success: false,
        data: None,
        error: Some(error_message.to_string()),
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PythonResult {
    pub success: bool,
    pub data: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HDFFileInfo {
    pub name: String,
    pub path: String,
    pub size_mb: f64,
    pub modified: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub size: u64,
    pub modified: u64,
}

// Python execution helper function
fn execute_python_script(script_name: &str, args: Vec<String>) -> PythonResult {
    // Get the project root directory (parent of src-tauri)
    let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

    // Try to find the project root by looking for src-python directory
    let backend_path = if current_dir.join("src-python").exists() {
        // We're already in the project root
        current_dir.join("src-python")
    } else if current_dir.parent().is_some()
        && current_dir.parent().unwrap().join("src-python").exists()
    {
        // We're in src-tauri, go up one level
        current_dir.parent().unwrap().join("src-python")
    } else {
        // Fallback: try relative path from src-tauri
        current_dir.join("../src-python")
    };

    let script_path = backend_path.join(script_name);

    // Debug information
    println!("Current dir: {:?}", current_dir);
    println!("Backend path: {:?}", backend_path);
    println!("Script path: {:?}", script_path);
    println!("Script exists: {}", script_path.exists());

    // Check if the backend directory exists
    if !backend_path.exists() {
        return PythonResult {
            success: false,
            data: None,
            error: Some(format!(
                "Python backend directory not found: {:?}",
                backend_path
            )),
        };
    }

    // Check if the script exists
    if !script_path.exists() {
        return PythonResult {
            success: false,
            data: None,
            error: Some(format!("Python script not found: {:?}", script_path)),
        };
    }

    // Use UV to run Python scripts with the virtual environment
    let mut cmd = Command::new("uv");
    cmd.arg("run")
        .arg("python")
        .arg(&script_path)
        .args(&args)
        .current_dir(&backend_path);

    match cmd.output() {
        Ok(output) => {
            if output.status.success() {
                PythonResult {
                    success: true,
                    data: Some(String::from_utf8_lossy(&output.stdout).to_string()),
                    error: None,
                }
            } else {
                PythonResult {
                    success: false,
                    data: None,
                    error: Some(String::from_utf8_lossy(&output.stderr).to_string()),
                }
            }
        }
        Err(e) => PythonResult {
            success: false,
            data: None,
            error: Some(format!("Failed to execute Python script: {}", e)),
        },
    }
}

// Tauri commands for HDF file operations
#[tauri::command]
async fn read_hdf_file_info(file_path: String) -> Result<PythonResult, String> {
    let result = execute_python_script("hdf_reader.py", vec![file_path, "info".to_string()]);
    Ok(result)
}

#[tauri::command]
async fn read_hdf_file_structure(file_path: String) -> Result<PythonResult, String> {
    let result = execute_python_script("hdf_reader.py", vec![file_path, "structure".to_string()]);
    Ok(result)
}

#[tauri::command]
async fn find_hydraulic_datasets(file_path: String) -> Result<PythonResult, String> {
    let result = execute_python_script("hdf_reader.py", vec![file_path, "hydraulic".to_string()]);
    Ok(result)
}

#[tauri::command]
async fn get_detailed_hdf_metadata(file_path: String) -> Result<PythonResult, String> {
    let result = execute_python_script("hdf_reader.py", vec![file_path, "metadata".to_string()]);
    Ok(result)
}

#[tauri::command]
async fn extract_manning_values(
    hdf_file_path: String,
    _terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    // Use the new manning_extractor.py script that doesn't require terrain files
    let result = execute_python_script(
        "manning_extractor.py",
        vec![hdf_file_path],
    );
    Ok(result)
}

// Tauri commands for raster operations
#[tauri::command]
async fn convert_to_raster(
    input_data_path: String,
    output_dir: String,
) -> Result<PythonResult, String> {
    let result = execute_python_script(
        "raster_converter.py",
        vec!["convert".to_string(), input_data_path, output_dir],
    );
    Ok(result)
}

#[tauri::command]
async fn get_raster_info(raster_path: String) -> Result<PythonResult, String> {
    let result =
        execute_python_script("raster_converter.py", vec!["info".to_string(), raster_path]);
    Ok(result)
}

// Tauri commands for geometry operations
#[tauri::command]
async fn create_spline_from_points(points_json: String) -> Result<PythonResult, String> {
    // Save points to temporary file and call Python script
    let temp_file = "temp_points.json";
    std::fs::write(temp_file, points_json).map_err(|e| e.to_string())?;

    let result = execute_python_script(
        "geometry_tools.py",
        vec!["spline".to_string(), temp_file.to_string()],
    );

    // Clean up temp file
    let _ = std::fs::remove_file(temp_file);
    Ok(result)
}

#[tauri::command]
async fn generate_cross_sections(
    axis_json: String,
    spacing: f64,
    width: f64,
) -> Result<PythonResult, String> {
    // Save axis data to temporary file and call Python script
    let temp_file = "temp_axis.json";
    std::fs::write(temp_file, axis_json).map_err(|e| e.to_string())?;

    let result = execute_python_script(
        "geometry_tools.py",
        vec![
            "sections".to_string(),
            temp_file.to_string(),
            spacing.to_string(),
            width.to_string(),
        ],
    );

    // Clean up temp file
    let _ = std::fs::remove_file(temp_file);
    Ok(result)
}

// Tauri commands for hydraulic calculations
#[tauri::command]
async fn calculate_normal_depth(
    discharge: f64,
    slope: f64,
    manning_n: f64,
    width: f64,
) -> Result<PythonResult, String> {
    let args = vec![
        "normal".to_string(),
        discharge.to_string(),
        slope.to_string(),
        manning_n.to_string(),
        width.to_string(),
    ];
    let result = execute_python_script("hydraulic_calc.py", args);
    Ok(result)
}

#[tauri::command]
async fn calculate_critical_depth(discharge: f64, width: f64) -> Result<PythonResult, String> {
    let args = vec![
        "critical".to_string(),
        discharge.to_string(),
        width.to_string(),
    ];
    let result = execute_python_script("hydraulic_calc.py", args);
    Ok(result)
}

#[tauri::command]
async fn analyze_flow_conditions(
    discharge: f64,
    depth: f64,
    velocity: f64,
    slope: f64,
    manning_n: f64,
    width: f64,
) -> Result<PythonResult, String> {
    let args = vec![
        "analyze".to_string(),
        discharge.to_string(),
        depth.to_string(),
        velocity.to_string(),
        slope.to_string(),
        manning_n.to_string(),
        width.to_string(),
    ];
    let result = execute_python_script("hydraulic_calc.py", args);
    Ok(result)
}

#[tauri::command]
async fn calculate_scour_depth(
    velocity: f64,
    depth: f64,
    d50: f64,
) -> Result<PythonResult, String> {
    let args = vec![
        "scour".to_string(),
        velocity.to_string(),
        depth.to_string(),
        d50.to_string(),
    ];
    let result = execute_python_script("hydraulic_calc.py", args);
    Ok(result)
}

#[tauri::command]
async fn calculate_froude_number(velocity: f64, depth: f64) -> Result<PythonResult, String> {
    let args = vec![
        "froude".to_string(),
        velocity.to_string(),
        depth.to_string(),
    ];
    let result = execute_python_script("hydraulic_calc.py", args);
    Ok(result)
}

// New Tauri commands for HDF data extraction and visualization
#[tauri::command]
async fn extract_hdf_dataset(
    file_path: String,
    dataset_path: String,
) -> Result<PythonResult, String> {
    let result = execute_python_script(
        "hdf_data_extractor.py",
        vec![file_path, "extract".to_string(), dataset_path],
    );
    Ok(result)
}

#[tauri::command]
async fn create_time_series_plot(
    file_path: String,
    dataset_path: String,
) -> Result<PythonResult, String> {
    let result = execute_python_script(
        "hdf_data_extractor.py",
        vec![file_path, "plot".to_string(), dataset_path],
    );
    Ok(result)
}

#[tauri::command]
async fn create_hydrograph(
    file_path: String,
    dataset_path: String,
) -> Result<PythonResult, String> {
    let result = execute_python_script(
        "hdf_data_extractor.py",
        vec![file_path, "hydrograph".to_string(), dataset_path],
    );
    Ok(result)
}

#[tauri::command]
async fn export_hdf_to_csv(
    app: AppHandle,
    file_path: String,
    dataset_path: String,
) -> Result<PythonResult, String> {
    use tauri_plugin_dialog::DialogExt;

    // Crear nombre de archivo sugerido
    let safe_dataset_name = dataset_path.replace(['/', ' '], "_");
    let suggested_name = format!("hdf_export_{}.csv", safe_dataset_name);

    // Abrir diálogo de guardado
    let save_path = app
        .dialog()
        .file()
        .set_title("Guardar archivo CSV")
        .set_file_name(&suggested_name)
        .add_filter("Archivos CSV", &["csv"])
        .blocking_save_file();

    match save_path {
        Some(path) => {
            let path_str = path.to_string();
            let result = execute_python_script(
                "hdf_data_extractor.py",
                vec![file_path, "export_csv".to_string(), dataset_path, path_str],
            );
            Ok(result)
        }
        None => {
            // Usuario canceló el diálogo
            Ok(PythonResult {
                success: false,
                data: None,
                error: Some("Exportación cancelada por el usuario".to_string()),
            })
        }
    }
}

#[tauri::command]
async fn export_hdf_to_json(
    app: AppHandle,
    file_path: String,
    dataset_path: String,
) -> Result<PythonResult, String> {
    use tauri_plugin_dialog::DialogExt;

    // Crear nombre de archivo sugerido
    let safe_dataset_name = dataset_path.replace(['/', ' '], "_");
    let suggested_name = format!("hdf_export_{}.json", safe_dataset_name);

    // Abrir diálogo de guardado
    let save_path = app
        .dialog()
        .file()
        .set_title("Guardar archivo JSON")
        .set_file_name(&suggested_name)
        .add_filter("Archivos JSON", &["json"])
        .blocking_save_file();

    match save_path {
        Some(path) => {
            let path_str = path.to_string();
            let result = execute_python_script(
                "hdf_data_extractor.py",
                vec![file_path, "export_json".to_string(), dataset_path, path_str],
            );
            Ok(result)
        }
        None => {
            // Usuario canceló el diálogo
            Ok(PythonResult {
                success: false,
                data: None,
                error: Some("Exportación cancelada por el usuario".to_string()),
            })
        }
    }
}

// pyHMT2D integration commands
#[tauri::command]
async fn process_pyhmt2d(
    operation: String,
    #[allow(non_snake_case)] hdfFile: String,
    #[allow(non_snake_case)] cellId: Option<i32>,
    #[allow(non_snake_case)] outputDirectory: Option<String>,
    #[allow(non_snake_case)] terrainFile: Option<String>,
) -> Result<PythonResult, String> {
    let mut args = vec![operation.clone(), hdfFile];

    // Add arguments based on specific operation
    match operation.as_str() {
        "process" => {
            // process operation: python script.py process <hdf_file> <terrain_file>
            if let Some(terrain) = terrainFile {
                args.push(terrain);
            } else {
                args.push("null".to_string());
            }
        }
        "hydrograph" => {
            // hydrograph operation: python script.py hydrograph <hdf_file> <cell_id> <terrain_file>
            if let Some(cell) = cellId {
                args.push(cell.to_string());
            } else {
                args.push("0".to_string());
            }
            if let Some(terrain) = terrainFile {
                args.push(terrain);
            } else {
                args.push("null".to_string());
            }
        }
        "depth_map" | "profile" => {
            // depth_map/profile operation: python script.py <operation> <hdf_file> <terrain_file>
            if let Some(terrain) = terrainFile {
                args.push(terrain);
            } else {
                args.push("null".to_string());
            }
        }
        "export_vtk" => {
            // export_vtk operation: python script.py export_vtk <hdf_file> <output_dir> <terrain_file>
            if let Some(output_dir) = outputDirectory {
                args.push(output_dir);
            } else {
                args.push("temp".to_string());
            }
            if let Some(terrain) = terrainFile {
                args.push(terrain);
            } else {
                args.push("null".to_string());
            }
        }
        _ => {
            // Default case - add terrain file
            if let Some(terrain) = terrainFile {
                args.push(terrain);
            } else {
                args.push("null".to_string());
            }
        }
    }

    let result = execute_python_script("HECRAS-HDF/hecras_processor.py", args);
    Ok(result)
}

#[tauri::command]
async fn process_hec_ras_data(
    hdf_file_path: String,
    terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    let terrain_arg = terrain_arg_or_null(terrain_file_path);
    let result = execute_python_script(
        HECRAS_PROCESSOR_SCRIPT,
        vec!["process".to_string(), hdf_file_path, terrain_arg],
    );
    Ok(result)
}

#[tauri::command]
async fn create_hydrograph_py_hmt2_d(
    hdf_file_path: String,
    cell_id: Option<i32>,
    terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    let cell_id_str = cell_id.unwrap_or(0).to_string();
    let terrain_arg = terrain_arg_or_null(terrain_file_path);
    let result = execute_python_script(
        HECRAS_PROCESSOR_SCRIPT,
        vec![
            "hydrograph".to_string(),
            hdf_file_path,
            cell_id_str,
            terrain_arg,
        ],
    );
    Ok(result)
}

#[tauri::command]
async fn create_depth_map_py_hmt2_d(
    hdf_file_path: String,
    terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    let terrain_arg = terrain_arg_or_null(terrain_file_path);
    let result = execute_python_script(
        HECRAS_PROCESSOR_SCRIPT,
        vec!["depth_map".to_string(), hdf_file_path, terrain_arg],
    );
    Ok(result)
}

#[tauri::command]
async fn create_profile_py_hmt2_d(
    hdf_file_path: String,
    terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    let terrain_arg = terrain_arg_or_null(terrain_file_path);
    let result = execute_python_script(
        HECRAS_PROCESSOR_SCRIPT,
        vec!["profile".to_string(), hdf_file_path, terrain_arg],
    );
    Ok(result)
}

#[tauri::command]
async fn export_to_vtk_py_hmt2_d(
    app: AppHandle,
    hdf_file_path: String,
    terrain_file_path: Option<String>,
    export_type: Option<String>,
) -> Result<PythonResult, String> {
    use tauri_plugin_dialog::DialogExt;

    // Open folder selection dialog
    let output_path = app
        .dialog()
        .file()
        .set_title("Seleccionar carpeta para exportar archivos VTK")
        .set_directory("/")
        .blocking_pick_folder();

    match output_path {
        Some(path) => {
            let path_str = path.to_string();
            let terrain_arg = terrain_arg_or_null(terrain_file_path);
            let export_type_arg = export_type.unwrap_or_else(|| "all_timesteps".to_string());
            let result = execute_python_script(
                HECRAS_PROCESSOR_SCRIPT,
                vec![
                    "export_vtk".to_string(),
                    hdf_file_path,
                    path_str,
                    terrain_arg,
                    export_type_arg,
                ],
            );
            Ok(result)
        }
        None => {
            // User cancelled the dialog
            Ok(create_error_result("Exportación cancelada por el usuario"))
        }
    }
}

#[tauri::command]
async fn get_vtk_export_info(
    hdf_file_path: String,
    terrain_file_path: Option<String>,
) -> Result<PythonResult, String> {
    let terrain_arg = terrain_arg_or_null(terrain_file_path);
    let result = execute_python_script(
        HECRAS_PROCESSOR_SCRIPT,
        vec!["vtk_info".to_string(), hdf_file_path, terrain_arg],
    );
    Ok(result)
}

// Boundary conditions extraction command
#[tauri::command]
async fn extract_boundary_conditions(hdf_file_path: String) -> Result<PythonResult, String> {
    let result = execute_python_script("enhanced_boundary_conditions_reader.py", vec![hdf_file_path]);
    Ok(result)
}

// Export hydrograph data to CSV/Excel
#[tauri::command]
async fn export_hydrograph_data(
    hdf_file_path: String,
    boundary_conditions: Vec<String>,
    output_path: String,
    format: String,
) -> Result<PythonResult, String> {
    let mut args = vec![
        "export_hydrograph".to_string(),
        hdf_file_path,
        output_path,
        format,
    ];

    // Agregar condiciones de contorno como argumentos
    for bc in boundary_conditions {
        args.push(bc);
    }

    let result = execute_python_script("hydrograph_exporter.py", args);
    Ok(result)
}

// Open directory in file explorer
#[tauri::command]
async fn open_directory(path: String) -> Result<(), String> {
    use std::process::Command;

    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }

    Ok(())
}

/// Get file information (size and modification time)
#[tauri::command]
async fn get_file_info(file_path: String) -> Result<FileInfo, String> {
    let metadata = fs::metadata(&file_path)
        .map_err(|e| format!("Error obteniendo información del archivo: {}", e))?;

    let size = metadata.len();
    let modified = metadata
        .modified()
        .map_err(|e| format!("Error obteniendo fecha de modificación: {}", e))?
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Error convirtiendo fecha: {}", e))?
        .as_secs();

    Ok(FileInfo { size, modified })
}

/// Get system metrics for monitoring app performance
#[tauri::command]
async fn get_system_metrics() -> Result<SystemMetrics, String> {
    let mut system = System::new_all();
    system.refresh_all();

    // Get current process info
    let current_pid = std::process::id();
    let process = system.process(Pid::from(current_pid as usize));

    // Calculate memory usage
    let memory_usage_mb = if let Some(proc) = process {
        proc.memory() as f64 / 1024.0 / 1024.0 // Convert from bytes to MB
    } else {
        0.0
    };

    // Calculate CPU usage (average across all cores)
    let cpu_usage_percent = system.global_cpu_info().cpu_usage() as f64;

    // Get total and available memory
    let total_memory_mb = system.total_memory() as f64 / 1024.0 / 1024.0;
    let available_memory_mb = system.available_memory() as f64 / 1024.0 / 1024.0;

    // Get CPU cores count
    let cpu_cores = system.cpus().len();

    // GPU usage - simplified approach (would need additional crates for detailed GPU monitoring)
    // For now, we'll estimate based on system load or return 0
    let gpu_usage_percent = 0.0; // TODO: Implement proper GPU monitoring

    Ok(SystemMetrics {
        memory_usage_mb,
        cpu_usage_percent,
        gpu_usage_percent,
        total_memory_mb,
        available_memory_mb,
        process_id: current_pid,
        cpu_cores,
    })
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_file_info,
            get_system_metrics,
            read_hdf_file_info,
            read_hdf_file_structure,
            find_hydraulic_datasets,
            get_detailed_hdf_metadata,
            extract_manning_values,
            convert_to_raster,
            get_raster_info,
            create_spline_from_points,
            generate_cross_sections,
            calculate_normal_depth,
            calculate_critical_depth,
            calculate_scour_depth,
            calculate_froude_number,
            analyze_flow_conditions,
            extract_hdf_dataset,
            create_time_series_plot,
            create_hydrograph,
            export_hdf_to_csv,
            export_hdf_to_json,
            process_pyhmt2d,
            process_hec_ras_data,
            create_hydrograph_py_hmt2_d,
            create_depth_map_py_hmt2_d,
            create_profile_py_hmt2_d,
            export_to_vtk_py_hmt2_d,
            get_vtk_export_info,
            extract_boundary_conditions,
            export_hydrograph_data,
            open_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
