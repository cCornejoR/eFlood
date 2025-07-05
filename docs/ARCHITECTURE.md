# eFlow Architecture Documentation

## Overview

eFlow is a desktop application built with a modern three-tier architecture that combines the best of web technologies, systems programming, and scientific computing.

## Architecture Layers

### 1. Frontend Layer (React + TypeScript)
- **Technology**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Purpose**: User interface and user experience
- **Location**: `src/` directory

#### Key Components:
- `App.tsx` - Main application shell with navigation
- `Navigation.tsx` - Tab-based navigation system
- `HDFAnalyzer.tsx` - HDF file analysis interface
- `HydraulicCalculator.tsx` - Hydraulic calculations UI
- `DataVisualization.tsx` - Data visualization and export
- `GeometryTools.tsx` - CAD-like geometry drawing tools
- `CrossSections.tsx` - Cross-section analysis interface

#### Features:
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Type-safe development with TypeScript
- Modern React patterns with hooks

### 2. Bridge Layer (Tauri + Rust)
- **Technology**: Tauri 2.0, Rust
- **Purpose**: Secure bridge between frontend and backend
- **Location**: `src-tauri/` directory

#### Key Files:
- `src/lib.rs` - Main Tauri commands and Python communication
- `src/main.rs` - Application entry point
- `Cargo.toml` - Rust dependencies and configuration
- `tauri.conf.json` - Tauri application configuration

#### Tauri Commands:
```rust
// HDF Operations
read_hdf_file_info(file_path: String)
read_hdf_file_structure(file_path: String)
find_hydraulic_datasets(file_path: String)

// Hydraulic Calculations
calculate_normal_depth(discharge, slope, manning_n, width)
calculate_critical_depth(discharge, width)
analyze_flow_conditions(discharge, depth, velocity, slope, manning_n, width)
calculate_scour_depth(velocity, depth, d50)
calculate_froude_number(velocity, depth)

// Geometry Operations
create_spline_from_points(points_json: String)
generate_cross_sections(axis_json, spacing, width)

// Raster Operations
convert_to_raster(input_data_path, output_dir)
get_raster_info(raster_path)
```

#### Communication Flow:
1. React components call Tauri commands via `invoke()`
2. Rust receives the call and validates parameters
3. Rust executes Python scripts using UV subprocess calls
4. Python processes data and returns JSON results
5. Rust forwards results back to React
6. React updates UI with the results

### 3. Backend Layer (Python)
- **Technology**: Python 3.11+, UV package manager
- **Purpose**: Scientific computing and data processing
- **Location**: `src-python/` directory

#### Core Modules:

##### `hdf_reader.py`
- Reads HEC-RAS 2D HDF files using h5py
- Extracts file structure and metadata
- Identifies hydraulic datasets (depth, velocity, flow)
- Exports structure to JSON

##### `hydraulic_calc.py`
- Implements hydraulic calculation algorithms
- Normal depth calculations using Manning's equation
- Critical depth analysis
- Flow condition analysis (Froude numbers)
- Scour depth calculations

##### `geometry_tools.py`
- Spline generation from user-defined points
- Axis creation and management
- Cross-section generation
- Coordinate system transformations
- GeoJSON export capabilities

##### `section_tools.py`
- Cross-section extraction from terrain data
- Terrain interpolation using scipy
- Hydraulic property calculations
- Profile visualization support

##### `raster_converter.py`
- Converts hydraulic results to GeoTIFF format
- Handles coordinate reference systems
- Supports various raster operations
- GIS integration capabilities

##### `export_tools.py`
- Data export to multiple formats (Excel, PDF, CSV)
- Report generation with ReportLab
- Visualization creation with matplotlib
- Professional document formatting

## Data Flow Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Tauri/Rust    │    │   Python        │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │◄├────┤ │ Commands    │◄├────┤ │ Modules     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ State Mgmt  │ │    │ │ Error       │ │    │ │ Scientific  │ │
│ └─────────────┘ │    │ │ Handling    │ │    │ │ Computing   │ │
│                 │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Model

### Tauri Security Features:
- **Process Isolation**: Frontend runs in a webview, backend in native process
- **API Allowlisting**: Only explicitly defined commands are accessible
- **CSP (Content Security Policy)**: Prevents XSS and code injection
- **Secure Context**: All communication happens over secure channels

### Python Execution Security:
- **Subprocess Isolation**: Python scripts run in isolated processes
- **Input Validation**: All parameters validated before execution
- **Error Containment**: Python errors don't crash the main application
- **Resource Limits**: UV manages Python environment and dependencies

## Performance Considerations

### Frontend Optimization:
- **Code Splitting**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large datasets in tables
- **Debounced Inputs**: Prevent excessive API calls

### Backend Optimization:
- **Async Operations**: All Tauri commands are async
- **Streaming**: Large datasets processed in chunks
- **Caching**: Frequently accessed data cached in memory
- **Parallel Processing**: Multiple Python processes for heavy computations

### Memory Management:
- **Rust RAII**: Automatic memory management in Rust layer
- **Python GC**: Garbage collection handles Python memory
- **Resource Cleanup**: Temporary files automatically cleaned up
- **Connection Pooling**: Efficient resource utilization

## Development Workflow

### 1. Frontend Development:
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run lint         # ESLint checking
npm run format       # Prettier formatting
```

### 2. Backend Development:
```bash
cd src-python
uv sync              # Install dependencies
uv run black .       # Format code
uv run flake8 .      # Lint code
uv run pytest       # Run tests
```

### 3. Tauri Development:
```bash
npm run tauri dev    # Start Tauri dev mode
npm run tauri build  # Build desktop app
cargo check          # Check Rust code
cargo test           # Run Rust tests
```

## Deployment Architecture

### Development Build:
- Vite dev server for hot reloading
- Tauri dev mode with live reload
- Python scripts executed directly

### Production Build:
- Optimized React bundle
- Compiled Rust binary
- Python environment bundled with UV
- Single executable installer

### Cross-Platform Support:
- **Windows**: .msi installer
- **macOS**: .dmg package
- **Linux**: .deb/.rpm packages

## Error Handling Strategy

### Frontend Error Boundaries:
- React error boundaries catch component errors
- User-friendly error messages
- Graceful degradation of functionality

### Rust Error Handling:
- Result<T, E> pattern for all operations
- Structured error types with context
- Automatic error propagation

### Python Error Handling:
- Try-catch blocks around all operations
- Structured error responses in JSON
- Logging for debugging purposes

## Testing Strategy

### Unit Tests:
- React components with Jest/React Testing Library
- Rust functions with built-in test framework
- Python modules with pytest

### Integration Tests:
- End-to-end communication testing
- API contract validation
- Cross-platform compatibility testing

### Performance Tests:
- Load testing with large datasets
- Memory usage profiling
- Response time benchmarking

This architecture provides a robust, secure, and maintainable foundation for the eFlow hydraulic analysis application.
