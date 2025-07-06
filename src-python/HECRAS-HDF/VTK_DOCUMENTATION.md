# VTK Files Documentation for eFlood2

## VTK File Structure Analysis

### Current Export Format
Our HECRAS-HDF integration exports VTK files in the following format:
- **Format**: ASCII VTK Legacy Format (Version 5.1)
- **Dataset Type**: UNSTRUCTURED_GRID
- **One file per time step**: Each time step creates a separate .vtk file

### File Structure Components

#### 1. Header
```
# vtk DataFile Version 5.1
vtk output
ASCII
DATASET UNSTRUCTURED_GRID
```

#### 2. Geometry Data
- **POINTS**: 20,611 points with 3D coordinates (X, Y, Z)
- **CELLS**: 34,537 cells (including boundary cells)
- **CELL_TYPES**: All cells are type 9 (VTK_QUAD - quadrilateral cells)

#### 3. Data Arrays
- **CELL_DATA** (34,536 cells):
  - `Water_Depth_m`: Water depth in meters
  - `Water_Surface_m`: Water surface elevation in meters
  - `Manning_n`: Manning's roughness coefficient
- **POINT_DATA** (20,611 points):
  - `Velocity_m_p_s`: 3D velocity vectors (X, Y, Z components)
  - `Bed_Elev_m`: Bed elevation in meters

## Visualization Software Compatibility

### ParaView
- **Individual Loading**: Each VTK file loads as a separate time step
- **Time Series**: ParaView can automatically detect time series if files follow naming convention
- **Naming Convention**: `basename_####.vtk` (e.g., `data_0000.vtk`, `data_0001.vtk`)
- **Animation**: Can animate through time steps automatically

### VTK Viewers
- **Single File**: Most VTK viewers load one file at a time
- **Time Series**: Advanced viewers can load multiple files as animation sequence

## Time Series Handling Options

### Option 1: Multiple VTK Files (Current Implementation)
**Pros:**
- Compatible with all VTK software
- Individual time steps can be analyzed separately
- Memory efficient for large datasets
- Standard approach in hydraulic modeling

**Cons:**
- Many files to manage (145 files for our test case)
- Requires organized folder structure

### Option 2: Single VTK File with Time Steps
**Format**: VTK XML format (.vtu/.pvtu) with time arrays
**Pros:**
- Single file to manage
- Built-in time information

**Cons:**
- Larger file size
- More complex format
- Not supported by pyHMT2D natively

### Option 3: Maximum Values Only
**Description**: Single VTK file with maximum values across all time steps
**Data Arrays:**
- `Max_Water_Depth_m`: Maximum depth at each cell
- `Max_Water_Surface_m`: Maximum WSE at each cell
- `Max_Velocity_m_p_s`: Maximum velocity magnitude at each point

## Recommendations for eFlood2

### Primary Export (All Time Steps)
- Continue using multiple VTK files approach
- Organize files in user-selected directories
- Provide clear naming convention
- Include metadata file with time information

### Secondary Export (Maximum Values)
- Implement single VTK file with maximum values
- Useful for flood extent mapping
- Faster to load and visualize
- Ideal for preliminary analysis

### File Organization
```
Selected_Directory/
├── ProjectName_AllTimeSteps/
│   ├── ProjectName_0000.vtk
│   ├── ProjectName_0001.vtk
│   └── ...
├── ProjectName_MaxValues.vtk
└── export_info.json
```

## Implementation Strategy

### 1. User Directory Selection
- Use Tauri's file dialog API
- Allow users to choose export location
- Create organized subdirectories

### 2. Export Options Modal
- "Export all time steps" (145 files)
- "Export maximum values only" (1 file)
- Progress indication during export

### 3. Maximum Values Calculation
- Process all time steps to find maximum values
- Create single VTK file with max data
- Maintain same geometry structure

### 4. Progress Feedback
- Real-time progress updates
- File count and current operation
- Estimated time remaining

## Technical Implementation Notes

### pyHMT2D Integration
- Current `saveHEC_RAS2D_results_to_VTK()` method exports all time steps
- Need to add maximum values calculation method
- Maintain compatibility with existing functionality

### Data Processing
- Maximum depth: `max(depth_array, axis=0)`
- Maximum WSE: `max(wse_array, axis=0)`
- Maximum velocity: `max(velocity_magnitude, axis=0)`

### File Naming Convention
- All time steps: `{project_name}_{area_name}_{time_index:04d}.vtk`
- Maximum values: `{project_name}_{area_name}_MaxValues.vtk`
