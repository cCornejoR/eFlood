# 🦀 eFlood2 Tauri Backend

<div align="center">

![Rust](https://img.shields.io/badge/Rust-2021-orange.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)
![Cross Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Backend Rust de alto rendimiento para eFlood2**

*Interfaz nativa entre el frontend React y el backend Python*

</div>

---

## 🚀 **Características Principales**

### ⚡ **Alto Rendimiento**
- ✅ Ejecución nativa compilada con Rust
- ✅ Gestión eficiente de memoria sin garbage collector
- ✅ Concurrencia segura con async/await
- ✅ Interfaz optimizada con el sistema operativo

### 🔗 **Integración Python**
- ✅ Ejecución de módulos Python con UV
- ✅ Gestión automática de entornos virtuales
- ✅ Comunicación bidireccional con scripts Python
- ✅ Manejo robusto de errores y excepciones

### 🖥️ **Funcionalidades del Sistema**
- ✅ Monitoreo de recursos del sistema (CPU, memoria)
- ✅ Gestión de archivos y directorios
- ✅ Diálogos nativos de selección de archivos
- ✅ Apertura de directorios en el explorador

### 🌊 **Comandos Hidráulicos**
- ✅ Procesamiento de archivos HDF de HEC-RAS
- ✅ Integración con RAS Commander
- ✅ Exportación VTK para visualización
- ✅ Análisis de series temporales

---

## 🏗️ **Arquitectura**

```
src-tauri/
├── src/
│   ├── main.rs              # Punto de entrada de la aplicación
│   └── lib.rs               # Lógica principal y comandos Tauri
├── Cargo.toml               # Configuración de dependencias
├── tauri.conf.json          # Configuración de Tauri
├── build.rs                 # Script de construcción
├── capabilities/            # Permisos y capacidades
│   └── default.json
└── icons/                   # Iconos de la aplicación
    ├── icon.ico
    ├── icon.icns
    └── ...
```

---

## ⚙️ **Instalación y Configuración**

### **Requisitos Previos**
- 🦀 **Rust 1.70+** con Cargo
- 🔧 **Tauri CLI**: `cargo install tauri-cli`
- 🐍 **Python 3.11+** con UV
- 🖥️ **Dependencias del sistema** (WebView2 en Windows)

### **Configuración de Desarrollo**

```bash
# Instalar Tauri CLI
cargo install tauri-cli

# Verificar instalación
cargo tauri --version

# Instalar dependencias
cd src-tauri
cargo build

# Ejecutar en modo desarrollo
cargo tauri dev
```

### **Construcción para Producción**

```bash
# Construcción optimizada
cargo tauri build

# Construcción con debug info
cargo tauri build --debug

# Construcción para target específico
cargo tauri build --target x86_64-pc-windows-msvc
```

---

## 🎯 **Comandos Tauri Disponibles**

### **📊 Sistema y Archivos**

```rust
// Obtener métricas del sistema
#[tauri::command]
async fn get_system_metrics() -> Result<SystemMetrics, String>

// Información de archivos
#[tauri::command]
async fn get_file_info(file_path: String) -> Result<FileInfo, String>

// Abrir directorio en explorador
#[tauri::command]
async fn open_directory(path: String) -> Result<(), String>
```

### **🌊 Análisis HDF**

```rust
// Leer información de archivo HDF
#[tauri::command]
async fn read_hdf_file_info(file_path: String) -> Result<PythonResult, String>

// Obtener estructura del archivo
#[tauri::command]
async fn read_hdf_file_structure(file_path: String) -> Result<PythonResult, String>

// Encontrar datasets hidráulicos
#[tauri::command]
async fn find_hydraulic_datasets(file_path: String) -> Result<PythonResult, String>
```

### **🔧 RAS Commander Integration**

```rust
// Información completa de malla
#[tauri::command]
async fn get_comprehensive_mesh_info(
    hdf_file_path: String,
    terrain_file_path: Option<String>
) -> Result<PythonResult, String>

// Exportación VTK mejorada
#[tauri::command]
async fn export_vtk_enhanced(
    hdf_file_path: String,
    output_directory: String,
    terrain_file_path: Option<String>
) -> Result<PythonResult, String>
```

### **📤 Exportación de Datos**

```rust
// Exportar a CSV
#[tauri::command]
async fn export_hdf_to_csv(
    app: AppHandle,
    file_path: String,
    dataset_path: String
) -> Result<PythonResult, String>

// Exportar hidrogramas
#[tauri::command]
async fn export_hydrograph_data(
    hdf_file_path: String,
    boundary_conditions: Vec<String>,
    output_path: String,
    format: String
) -> Result<PythonResult, String>
```

---

## 🔧 **Configuración**

### **Cargo.toml**

```toml
[package]
name = "eflood2"
version = "0.1.0"
description = "eFlood² - Advanced Hydraulic Analysis Tool"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["macos-private-api", "protocol-asset"] }
tauri-plugin-opener = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
sysinfo = "0.30"
```

### **tauri.conf.json**

```json
{
  "productName": "eFlood²",
  "version": "0.1.0",
  "identifier": "com.eflood2.app",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  }
}
```

---

## 🧪 **Testing y Calidad**

### **Tests Unitarios**

```bash
# Ejecutar tests
cargo test

# Tests con output detallado
cargo test -- --nocapture

# Tests específicos
cargo test test_python_execution
```

### **Linting y Formateo**

```bash
# Formateo automático
cargo fmt

# Linting con Clippy
cargo clippy -- -D warnings

# Verificación de compilación
cargo check
```

### **Pre-commit Hooks**

Los hooks de pre-commit incluyen:
- 🦀 **cargo fmt**: Formateo automático
- 🔍 **cargo clippy**: Linting avanzado
- ⚙️ **cargo check**: Verificación de compilación
- 🧪 **cargo test**: Tests unitarios

---

## 📊 **Estructuras de Datos**

### **SystemMetrics**

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct SystemMetrics {
    pub memory_usage_mb: f64,
    pub cpu_usage_percent: f64,
    pub gpu_usage_percent: f64,
    pub total_memory_mb: f64,
    pub available_memory_mb: f64,
    pub process_id: u32,
    pub cpu_cores: usize,
}
```

### **PythonResult**

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct PythonResult {
    pub success: bool,
    pub data: Option<String>,
    pub error: Option<String>,
}
```

---

## 🔄 **Integración con Python**

### **Ejecución de Módulos**

```rust
fn execute_python_module(module_name: &str, args: Vec<String>) -> PythonResult {
    let mut cmd = Command::new("uv");
    cmd.arg("run")
        .arg("python")
        .arg("-m")
        .arg(module_name)
        .args(&args)
        .current_dir(&backend_path);
    
    // Manejo de resultado...
}
```

### **Ejecución de Scripts**

```rust
fn execute_python_script(script_name: &str, args: Vec<String>) -> PythonResult {
    let mut cmd = Command::new("uv");
    cmd.arg("run")
        .arg("python")
        .arg(&script_path)
        .args(&args)
        .current_dir(&backend_path);
    
    // Manejo de resultado...
}
```

---

## 🚀 **Optimizaciones de Rendimiento**

### **Compilación Optimizada**

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"
```

### **Gestión de Memoria**

- ✅ **Zero-copy**: Minimiza copias de datos
- ✅ **RAII**: Gestión automática de recursos
- ✅ **Async/await**: Concurrencia eficiente
- ✅ **Lazy loading**: Carga bajo demanda

---

## 🤝 **Contribución**

### **Estándares de Código Rust**

- ✅ Seguir las convenciones de Rust (rustfmt)
- ✅ Usar Clippy para linting
- ✅ Documentar funciones públicas
- ✅ Escribir tests para nuevas funcionalidades
- ✅ Manejar errores explícitamente

### **Proceso de Desarrollo**

1. **Fork** y crear rama feature
2. **Implementar** cambios con tests
3. **Verificar** con `cargo clippy` y `cargo test`
4. **Commit** siguiendo conventional commits
5. **Crear** Pull Request

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

<div align="center">

**🦀 eFlood2 Tauri Backend - Rendimiento nativo para análisis hidráulico**

*Desarrollado con Rust para máxima eficiencia y seguridad*

</div>