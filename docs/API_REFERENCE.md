# eFlow API Reference

## Tauri Commands

All Tauri commands return a `PythonResult` structure:

```typescript
interface PythonResult {
  success: boolean;
  data?: string;      // JSON string with results
  error?: string;     // Error message if failed
}
```

### HDF File Operations

#### `read_hdf_file_info(filePath: string)`
Reads basic information about an HDF file.

**Parameters:**
- `filePath`: Path to the HDF file

**Returns:**
```json
{
  "name": "model.hdf",
  "path": "/path/to/model.hdf",
  "size_mb": 125.5,
  "modified": 1640995200,
  "created": 1640908800
}
```

#### `read_hdf_file_structure(filePath: string)`
Extracts the complete structure of an HDF file.

**Parameters:**
- `filePath`: Path to the HDF file

**Returns:**
```json
{
  "Results/Unsteady/Output/...": {
    "type": "dataset",
    "shape": [100, 200],
    "dtype": "float64",
    "size": 20000,
    "attrs": {}
  }
}
```

#### `find_hydraulic_datasets(filePath: string)`
Identifies hydraulic datasets in the HDF file.

**Returns:**
```json
{
  "depth": ["Results/.../Depth"],
  "velocity": ["Results/.../Velocity"],
  "water_surface": ["Results/.../WSE"],
  "flow_rate": ["Results/.../Flow"],
  "other": ["..."]
}
```

### Hydraulic Calculations

#### `calculate_normal_depth(discharge: number, slope: number, manning_n: number, width: number)`
Calculates normal depth for uniform flow.

**Parameters:**
- `discharge`: Flow rate (m³/s)
- `slope`: Channel slope (m/m)
- `manning_n`: Manning's roughness coefficient
- `width`: Channel bottom width (m)

**Returns:**
```json
{
  "normal_depth": 2.45,
  "area": 24.5,
  "wetted_perimeter": 14.9,
  "hydraulic_radius": 1.64,
  "velocity": 4.08,
  "discharge": 100.0
}
```

#### `calculate_critical_depth(discharge: number, width: number)`
Calculates critical depth for given discharge.

**Parameters:**
- `discharge`: Flow rate (m³/s)
- `width`: Channel bottom width (m)

**Returns:**
```json
{
  "critical_depth": 1.85,
  "area": 18.5,
  "velocity": 5.41,
  "froude_number": 1.0,
  "discharge": 100.0
}
```

#### `analyze_flow_conditions(discharge: number, depth: number, velocity: number, slope: number, manning_n: number, width: number)`
Comprehensive flow analysis.

**Returns:**
```json
{
  "flow_conditions": {
    "discharge": 100.0,
    "depth": 2.0,
    "velocity": 5.0,
    "froude_number": 1.13,
    "flow_type": "Supercritical",
    "flow_regime": "Uniform"
  },
  "normal_depth": { /* normal depth results */ },
  "critical_depth": { /* critical depth results */ },
  "energy": {
    "velocity_head": 1.27,
    "pressure_head": 2.0,
    "elevation_head": 0.0,
    "total_energy": 3.27
  }
}
```

#### `calculate_scour_depth(velocity: number, depth: number, d50: number)`
Calculates scour depth using various methods.

**Parameters:**
- `velocity`: Flow velocity (m/s)
- `depth`: Flow depth (m)
- `d50`: Median grain size (mm)

**Returns:**
```json
{
  "scour_depth": 0.85,
  "method": "lacey",
  "velocity": 5.0,
  "depth": 2.0,
  "d50": 25.0
}
```

#### `calculate_froude_number(velocity: number, depth: number)`
Calculates Froude number.

**Returns:**
```json
{
  "froude_number": 1.13
}
```

### Geometry Operations

#### `create_spline_from_points(pointsJson: string)`
Creates a smooth spline from input points.

**Parameters:**
- `pointsJson`: JSON string of point array `[[x1,y1], [x2,y2], ...]`

**Returns:**
```json
{
  "x": [0, 1.2, 2.5, ...],
  "y": [0, 0.8, 1.5, ...],
  "original_points": [[0,0], [10,5], ...],
  "parameters": {
    "smoothing": 0.0,
    "num_points": 100
  }
}
```

#### `generate_cross_sections(axisJson: string, spacing: number, width: number)`
Generates cross-sections along an axis.

**Parameters:**
- `axisJson`: JSON string with axis definition
- `spacing`: Distance between sections (m)
- `width`: Width of each section (m)

**Returns:**
```json
[
  {
    "id": 1,
    "station": 0.0,
    "center_point": [1000, 2000],
    "left_point": [990, 2000],
    "right_point": [1010, 2000],
    "bearing": 90.0,
    "width": 200.0,
    "axis_name": "Main Axis"
  }
]
```

### Raster Operations

#### `convert_to_raster(inputDataPath: string, outputDir: string)`
Converts hydraulic data to raster format.

**Parameters:**
- `inputDataPath`: Path to input data JSON file
- `outputDir`: Directory for output raster files

**Returns:**
```json
{
  "created_files": [
    "/path/to/output/depth.tif",
    "/path/to/output/velocity.tif"
  ]
}
```

#### `get_raster_info(rasterPath: string)`
Gets information about a raster file.

**Returns:**
```json
{
  "width": 1000,
  "height": 800,
  "count": 1,
  "dtype": "float64",
  "crs": "EPSG:4326",
  "bounds": [0, 0, 1000, 800],
  "transform": [1, 0, 0, 0, -1, 800],
  "nodata": -9999.0,
  "description": "Hydraulic depth data"
}
```

## Python Module APIs

### HDFReader Class

```python
from src_python import HDFReader

reader = HDFReader("model.hdf")
info = reader.get_file_info()
structure = reader.get_file_structure()
datasets = reader.find_hydraulic_results()
data = reader.get_dataset_data("Results/Unsteady/Output/.../Depth")
```

### HydraulicCalculator Class

```python
from src_python import HydraulicCalculator

calc = HydraulicCalculator()
normal = calc.calculate_normal_depth(100, 0.001, 0.03, 10)
critical = calc.calculate_critical_depth(100, 10)
analysis = calc.analyze_flow_conditions(100, 2, 5, 0.001, 0.03, 10)
```

### GeometryTools Class

```python
from src_python import GeometryTools

tools = GeometryTools()
spline = tools.create_spline_from_points([(0,0), (10,5), (20,3)])
axis = tools.create_axis_from_spline(spline, "Main Axis")
sections = tools.generate_cross_sections(axis, 50, 200)
```

### RasterConverter Class

```python
from src_python import RasterConverter

converter = RasterConverter()
converter.array_to_geotiff(data, bounds, "output.tif")
info = converter.get_raster_info("output.tif")
```

### SectionTools Class

```python
from src_python import SectionTools

tools = SectionTools()
tools.load_terrain_data(points, elevations)
profile = tools.extract_section_profile((0,0), (100,0))
props = tools.calculate_hydraulic_properties(profile, water_level=5.0)
```

### ExportTools Class

```python
from src_python import ExportTools

export = ExportTools()
export.export_to_excel(data, "output.xlsx")
export.export_to_csv(data, "output.csv")
export.create_summary_report(project, hdf, sections, hydraulic, "report.pdf")
```

## Error Handling

All API calls should be wrapped in try-catch blocks:

```typescript
try {
  const result = await invoke('calculate_normal_depth', {
    discharge: 100,
    slope: 0.001,
    manningN: 0.03,
    width: 10
  });

  if (result.success && result.data) {
    const data = JSON.parse(result.data);
    // Use the data
  } else {
    console.error('Calculation failed:', result.error);
  }
} catch (error) {
  console.error('API call failed:', error);
}
```

## Data Formats

### Point Format
```json
[x, y]  // Array of two numbers
```

### Bounds Format
```json
[min_x, min_y, max_x, max_y]  // Array of four numbers
```

### Coordinate System
- Default CRS: EPSG:4326 (WGS84)
- Units: Meters for distances, degrees for coordinates
- Elevation: Meters above datum

### File Formats Supported
- **Input**: HDF5 (.hdf, .h5), JSON (.json)
- **Output**: GeoTIFF (.tif), Excel (.xlsx), CSV (.csv), PDF (.pdf), GeoJSON (.geojson)

This API reference provides complete documentation for integrating with the eFlow application's backend services.
