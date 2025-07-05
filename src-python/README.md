# eFlow Backend

Python backend for eFlow hydraulic analysis application.

## Features

- HDF file reading and analysis for HEC-RAS 2D models
- Raster conversion and GIS integration
- Geometry tools for axis and cross-section management
- Hydraulic calculations and flow analysis
- Data export to various formats (Excel, PDF, CSV)

## Modules

- `hdf_reader.py` - HDF file reading and metadata extraction
- `raster_converter.py` - Convert hydraulic results to GeoTIFF format
- `geometry_tools.py` - Axis definition and spline generation
- `section_tools.py` - Cross-section extraction and analysis
- `hydraulic_calc.py` - Hydraulic calculations and flow analysis
- `export_tools.py` - Data export utilities

## Installation

This package is designed to be used with UV package manager:

```bash
uv sync
```

## Usage

Each module can be used as a command-line tool or imported as a Python module.

### Command Line Usage

```bash
# HDF file analysis
python hdf_reader.py input.hdf structure

# Raster conversion
python raster_converter.py convert data.json output_dir

# Hydraulic calculations
python hydraulic_calc.py normal 100 0.001 0.03 10
```

### Python API Usage

```python
from eflow_backend import HDFReader, HydraulicCalculator

# Read HDF file
reader = HDFReader("model.hdf")
structure = reader.get_file_structure()

# Hydraulic calculations
calc = HydraulicCalculator()
result = calc.calculate_normal_depth(100, 0.001, 0.03, 10)
```
