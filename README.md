# eFlood² - Hydraulic Analysis Tool

<div align="center">
  <img src="frontend/src/assets/logo.svg" alt="eFlood² Logo" width="120" height="120">
  <h1 style="font-family: 'Allenoire', serif; font-size: 3rem; margin: 0;">eFlood²</h1>
  <p><strong>Advanced Hydraulic Analysis Tool for HEC-RAS 2D Model Analysis & Visualization</strong></p>
</div>

[![CI/CD Pipeline](https://github.com/cCornejoR/eFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/cCornejoR/eFlow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)

Built with Tauri + React + TypeScript + Python, eFlood2 provides comprehensive hydraulic analysis capabilities for civil engineers and water resources professionals.

## 🚀 Features

### 🏠 Homepage & UI
- **Modern Interface**: Beautiful gradient backgrounds with dark/light mode toggle
- **Custom Typography**: Allenoire font for branding and titles, Coolvetica for body text
- **Responsive Design**: Built with Tailwind CSS v4 for optimal performance
- **Smooth Animations**: Framer Motion integration for enhanced user experience

### 📊 HDF File Analysis
- **HDF5 File Processing**: Advanced analysis of HEC-RAS 2D model output files
- **File Structure Explorer**: Detailed exploration of HDF file contents and metadata
- **Hydraulic Dataset Detection**: Automatic identification of depth, velocity, water surface, and flow rate datasets
- **File Information**: Display file size, modification date, and path details

### 🔧 Hydraulic Calculator
- **Normal Depth Calculation**: Calculate normal depth for open channel flow
- **Critical Depth Calculation**: Determine critical depth conditions
- **Flow Analysis**: Comprehensive flow condition analysis including:
  - Wetted area and perimeter
  - Hydraulic radius
  - Froude number
  - Flow regime determination (subcritical/supercritical)
  - Velocity and discharge calculations

### 📈 Data Visualization & Export
- **Interactive Charts**: SVG-based line charts and scatter plots
- **Data Tables**: Tabular display of hydraulic data with pagination
- **Multiple Export Formats**:
  - CSV export
  - JSON export
  - Excel export
- **Dataset Selection**: Choose from available HDF datasets for visualization

### 📐 Geometry Tools
- **Interactive Drawing Canvas**: Click-to-draw interface for creating geometric elements
- **Spline Creation**: Advanced spline interpolation from user-drawn points
- **Axis Generation**: Create hydraulic axes from geometric splines
- **Cross-Section Generation**: Automated cross-section creation along axes
- **Export Capabilities**: Export geometry as GeoJSON and Shapefile formats

### 📏 Cross-Section Analysis
- **Section Profile Visualization**: SVG-based cross-section profile display
- **Hydraulic Properties Calculator**: Calculate wetted area, perimeter, hydraulic radius, and top width
- **Water Level Analysis**: Interactive water level adjustment with real-time calculations
- **Multiple Sections**: Generate and analyze multiple cross-sections simultaneously
- **Terrain Interpolation**: Mock terrain generation for demonstration purposes

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4 with custom font integration
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Heroicons for consistent iconography
- **UI Components**: Headless UI for accessible components
- **Build Tool**: Vite for fast development and building

### Backend
- **Runtime**: Tauri 2.6.0 for desktop application framework
- **Language**: Rust for system-level operations
- **Python Integration**: Python backend for hydraulic calculations
- **Data Processing**: NumPy, SciPy, and Pandas for numerical computations
- **File Handling**: H5py for HDF file processing
- **Spatial Analysis**: Rasterio, PyProj, and Shapely for geospatial operations

### Python Dependencies
- **Core Libraries**: h5py, numpy, scipy, pandas
- **Visualization**: matplotlib for advanced plotting
- **Export Tools**: xlsxwriter, reportlab for document generation
- **Geospatial**: rasterio, pyproj, shapely for spatial analysis
- **Development**: pytest, black, isort, mypy for code quality

## 🎨 Design System

### Fonts
- **Allenoire**: Used exclusively for the eFlow brand name and main titles
- **Coolvetica**: Default font for all other text and UI elements

### Color Palette
- **Primary**: Blue gradient themes (Ocean, Blue variants)
- **Dark Mode**: Dark gradient backgrounds with light text
- **Accent Colors**: Custom eFlow blue palette with multiple shades

## 📋 Available Scripts

### Workspace Commands
```bash
npm run dev           # Start frontend development server
npm run build         # Build frontend for production
npm run preview       # Preview production build
npm run tauri:dev     # Start Tauri development environment
npm run tauri:build   # Build Tauri application
npm run install:all   # Install all dependencies
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run test          # Run tests
npm run clean         # Clean build artifacts
```

### Python Backend
```bash
# Available via project scripts
hdf-reader           # HDF file reading utilities
raster-converter     # Raster data conversion tools
geometry-tools       # Geometric processing functions
section-tools        # Cross-section analysis tools
hydraulic-calc       # Hydraulic calculation engine
export-tools         # Data export utilities
```

## 🏗️ Project Structure

```
eFlood2/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Homepage.tsx         # Landing page with features
│   │   │   ├── HDFAnalyzer.tsx      # HDF file analysis
│   │   │   ├── HydraulicCalculator.tsx # Hydraulic calculations
│   │   │   ├── DataVisualization.tsx   # Charts and exports
│   │   │   ├── GeometryTools.tsx       # Geometric operations
│   │   │   ├── CrossSections.tsx       # Cross-section analysis
│   │   │   └── Navigation.tsx          # App navigation
│   │   ├── assets/           # Fonts and static assets
│   │   └── utils/            # Utility functions
├── backend/
│   ├── src-tauri/            # Tauri Rust backend
│   └── src-python/           # Python computational backend
├── docs/                     # Documentation
└── tests/                    # Test files
```

## 🎯 Use Cases

### Civil Engineers
- Analyze HEC-RAS 2D model outputs
- Calculate hydraulic properties for channel design
- Generate cross-sections for floodplain analysis
- Export data for further analysis in other tools

### Water Resources Professionals
- Visualize hydraulic simulation results
- Perform rapid hydraulic calculations
- Create geometric elements for model setup
- Export results in multiple formats for reporting

### Researchers & Students
- Explore HDF file structures and datasets
- Learn hydraulic calculation principles
- Visualize complex hydraulic data
- Practice geometric modeling techniques

## 📄 Documentation

Additional documentation available in the `/docs` directory:
- **[Workflow Automation](docs/WORKFLOW_AUTOMATION.md)**: Complete CI/CD and validation guide
- **API Reference**: Detailed API documentation
- **Architecture**: System architecture and design patterns
- **Development Guide**: Setup and development instructions
- **User Guide**: Complete user manual
- **Deployment**: Deployment and distribution guide

## 🔧 Development

### Prerequisites
- Node.js 18+ and npm
- Rust 1.70+
- Python 3.11+
- UV package manager for Python dependencies

### Quick Start
```bash
# Clone the repository
git clone https://github.com/cCornejoR/eFlow.git
cd eFlood2

# Setup development environment (Windows)
.\scripts\setup-hooks.ps1

# Install all dependencies
npm run install:all

# Run validation
.\scripts\validate.ps1

# Start development environment
npm run dev          # Frontend only
npm run tauri:dev    # Full application with Tauri
```

### Code Quality & Validation

This project uses a comprehensive validation system with multiple layers:

#### Automated Validation
- **Pre-commit Hooks**: Automatic validation before each commit
- **GitHub Actions**: CI/CD pipeline with comprehensive testing
- **Branch Protection**: Enforced validation for main branch

#### Manual Validation
```bash
# Run complete validation
.\scripts\validate.ps1

# Auto-fix issues
.\scripts\validate.ps1 -Fix

# Individual checks
npm run lint          # ESLint
npm run format        # Prettier
npm run test          # Tests
```

#### Quality Tools
- **Frontend**: ESLint, Prettier, TypeScript, Vitest
- **Python**: Black, isort, Flake8, MyPy, Pytest
- **Rust**: rustfmt, Clippy, Cargo tests
- **Security**: npm audit, cargo audit, secret scanning

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run validation: `.\scripts\validate.ps1`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🚀 Deployment

### Building for Production
```bash
# Build frontend
npm run build

# Build Tauri application
npm run tauri:build
```

### Release Process
1. Update version in `package.json` and `Cargo.toml`
2. Run full validation: `.\scripts\validate.ps1`
3. Create release commit
4. Tag release: `git tag v1.0.0`
5. Push with tags: `git push origin main --tags`

## 📊 Project Status

- ✅ **Frontend**: React + TypeScript + Tailwind CSS
- ✅ **Backend**: Tauri + Rust + Python integration
- ✅ **HDF Analysis**: Complete HDF5 file processing
- ✅ **Hydraulic Calculations**: Normal/critical depth calculations
- ✅ **Data Visualization**: Charts and export capabilities
- ✅ **Geometry Tools**: Interactive drawing and spline creation
- ✅ **Cross-Section Analysis**: Profile visualization and calculations
- ✅ **CI/CD Pipeline**: Automated testing and validation
- 🔄 **Documentation**: Ongoing improvements
- 🔄 **Testing Coverage**: Expanding test suite

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/cCornejoR/eFlow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cCornejoR/eFlow/discussions)
- **Documentation**: [Project Wiki](https://github.com/cCornejoR/eFlow/wiki)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>eFlood2</strong> - Empowering hydraulic analysis through modern technology
  <br>
  Built with ❤️ for the civil engineering community
  <br><br>
  © 2024 eFlood2 Team. Built with Tauri + React + Python.
</div>
