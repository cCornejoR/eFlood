# eFlow User Guide

## Introduction

eFlow is a comprehensive desktop application for analyzing HEC-RAS 2D hydraulic models. It provides tools for reading HDF files, performing hydraulic calculations, creating geometry, analyzing cross-sections, and exporting results.

## Getting Started

### Installation

1. Download the eFlow installer for your operating system
2. Run the installer and follow the setup wizard
3. Launch eFlow from your applications menu

### First Launch

When you first open eFlow, you'll see the main interface with six tabs:
- **HDF Analysis** - Analyze HEC-RAS model files
- **Hydraulic Calc** - Perform hydraulic calculations
- **Visualization** - Create charts and visualizations
- **Geometry** - Draw and manage geometric elements
- **Cross Sections** - Analyze cross-sectional data
- **Export** - Export data and reports

## Features Overview

### 📊 HDF Analysis

The HDF Analysis tab allows you to explore HEC-RAS 2D model files.

#### Opening an HDF File
1. Click the **"Browse Files"** button
2. Select your HEC-RAS HDF file (.hdf or .h5)
3. Click **"Analyze File"** to process the file

#### Understanding the Results
- **File Information**: Shows file size, modification date, and basic metadata
- **Hydraulic Datasets**: Automatically categorizes data by type (depth, velocity, flow rate)
- **File Structure**: Displays the hierarchical organization of data within the file

#### Tips
- Large files may take several minutes to analyze
- The application automatically identifies common hydraulic parameters
- Use the structure view to understand your model's data organization

### 🌊 Hydraulic Calculations

Perform standard hydraulic engineering calculations with built-in formulas.

#### Normal Depth Calculation
1. Select **"Normal Depth"** calculation type
2. Enter parameters:
   - **Discharge** (m³/s): Flow rate
   - **Slope** (m/m): Channel slope
   - **Manning's n**: Roughness coefficient
   - **Channel Width** (m): Bottom width
3. Click **"Calculate Normal Depth"**

#### Critical Depth Calculation
1. Select **"Critical Depth"** calculation type
2. Enter:
   - **Discharge** (m³/s): Flow rate
   - **Channel Width** (m): Bottom width
3. Click **"Calculate Critical Depth"**

#### Flow Analysis
1. Select **"Flow Analysis"** for comprehensive analysis
2. Enter all flow parameters:
   - Discharge, depth, velocity, slope, Manning's n, width
3. Get complete flow characterization including:
   - Flow type (subcritical, critical, supercritical)
   - Froude number
   - Energy calculations
   - Normal and critical depth comparisons

### 📈 Data Visualization

Create interactive charts and export data in various formats.

#### Creating Visualizations
1. Select a dataset from the dropdown menu
2. Click **"Generate Visualization"**
3. View the interactive chart with your data
4. Use the data table below to see numerical values

#### Exporting Data
- **CSV**: Spreadsheet-compatible format
- **JSON**: Machine-readable format
- **Excel**: Professional spreadsheet with formatting

### 📐 Geometry Tools

Draw and manage geometric elements like axes and cross-sections.

#### Drawing an Axis
1. Ensure **"Draw"** mode is selected
2. Click on the canvas to add points for your axis
3. Add at least 3 points for spline creation
4. Click **"Create Spline"** to generate a smooth curve
5. Click **"Create Axis"** to convert the spline to a geometric axis

#### Generating Cross-Sections
1. After creating an axis, click **"Generate Sections"**
2. The application automatically creates perpendicular cross-sections
3. Export geometry as GeoJSON or Shapefile format

#### Canvas Controls
- **Draw Mode**: Click to add points
- **View Mode**: View existing geometry without adding points
- **Clear**: Remove all points and start over

### 📏 Cross-Section Analysis

Analyze terrain profiles and calculate hydraulic properties.

#### Generating Sections
1. Set **Section Spacing** (distance between sections)
2. Set **Section Width** (total width of each section)
3. Click **"Generate Sections"** to create terrain profiles

#### Analyzing Hydraulic Properties
1. Select a cross-section from the generated list
2. Set the **Water Level** for analysis
3. Click **"Calculate Hydraulics"** to get:
   - Wetted area
   - Wetted perimeter
   - Hydraulic radius
   - Top width
   - Maximum depth

#### Interpreting Results
- The profile chart shows terrain elevation vs. distance
- The dashed blue line represents the water surface
- Hydraulic properties are calculated for the wetted portion

### 📤 Export Tools

Export your analysis results in professional formats.

#### Available Export Formats
- **Excel**: Multi-sheet workbooks with formatted data
- **PDF**: Professional reports with charts and tables
- **CSV**: Simple data tables
- **GeoJSON**: Geographic data for GIS applications

## Workflow Examples

### Typical HEC-RAS Analysis Workflow

1. **Load Model Data**
   - Open HDF Analysis tab
   - Load your HEC-RAS HDF file
   - Review the file structure and available datasets

2. **Explore Results**
   - Switch to Visualization tab
   - Create charts of depth, velocity, or other parameters
   - Export key datasets for further analysis

3. **Perform Calculations**
   - Use Hydraulic Calc tab for design calculations
   - Compare model results with theoretical calculations
   - Document findings

4. **Create Geometry**
   - Define analysis axes in Geometry Tools
   - Generate cross-sections for detailed analysis
   - Export geometry for use in other software

5. **Generate Reports**
   - Use Export tools to create professional documentation
   - Include charts, tables, and calculated results

### Cross-Section Analysis Workflow

1. **Define Geometry**
   - Draw axis line through your area of interest
   - Generate cross-sections at regular intervals

2. **Analyze Profiles**
   - Review each cross-section profile
   - Set appropriate water levels
   - Calculate hydraulic properties

3. **Compare Results**
   - Analyze multiple sections to understand flow patterns
   - Export data for trend analysis

## Tips and Best Practices

### File Management
- Keep HDF files in easily accessible locations
- Use descriptive names for exported files
- Organize results by project or analysis date

### Performance
- Large HDF files may require significant processing time
- Close unused tabs to improve performance
- Export intermediate results to avoid re-processing

### Data Quality
- Verify input parameters before calculations
- Cross-check results with hand calculations when possible
- Document assumptions and methods used

### Troubleshooting
- If analysis fails, check file permissions and format
- Ensure HDF files are not corrupted or incomplete
- Restart the application if performance degrades

## Keyboard Shortcuts

- **Ctrl+O**: Open file (when available)
- **Ctrl+S**: Save/Export (when available)
- **Ctrl+Z**: Undo (in geometry tools)
- **Escape**: Cancel current operation
- **Tab**: Navigate between input fields

## Getting Help

### Built-in Help
- Hover over buttons and fields for tooltips
- Error messages provide specific guidance
- Status indicators show operation progress

### Documentation
- Refer to this user guide for detailed instructions
- Check the API reference for technical details
- Review example workflows for guidance

### Support
- Report issues through the application's help menu
- Check for software updates regularly
- Consult with hydraulic engineering professionals for analysis interpretation

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.15, or Linux (Ubuntu 18.04+)
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Display**: 1024x768 resolution

### Recommended Requirements
- **OS**: Latest version of supported operating systems
- **RAM**: 8 GB or more
- **Storage**: 2 GB free space
- **Display**: 1920x1080 or higher resolution

This user guide provides comprehensive instructions for using all features of the eFlow hydraulic analysis application. For technical support or advanced usage questions, consult the development team or hydraulic engineering professionals.
