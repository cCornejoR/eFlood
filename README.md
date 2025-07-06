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

## 🛠️ Tecnologías

### Frontend
- **React 19** con TypeScript
- **Tailwind CSS v4** para estilos
- **Framer Motion** para animaciones
- **Lucide React** para iconos
- **Vite** como build tool

### Backend
- **Tauri 2.6** para aplicación de escritorio
- **Rust** para operaciones del sistema
- **Python** con pyHMT2D para análisis hidráulico
- **H5py** para procesamiento de archivos HDF5

### Librerías Python
- **pyHMT2D**: Procesamiento de modelos HEC-RAS 2D
- **h5py, numpy, pandas**: Manipulación de datos
- **VTK**: Exportación para visualización 3D

## � Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Rust 1.70+
- Python 3.11+
- UV package manager

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/cCornejoR/eFlow.git
cd eFlow

# Instalar dependencias
npm install
cd src-python && uv sync && cd ..

# Ejecutar en desarrollo
npm run tauri:dev
```

### Scripts Disponibles
```bash
npm run dev           # Servidor de desarrollo frontend
npm run tauri:dev     # Aplicación completa con Tauri
npm run tauri:build   # Construir aplicación para producción
npm run lint          # Linter ESLint
npm run format        # Formatear código con Prettier
```

## 🏗️ Estructura del Proyecto

```
eFlow/
├── src/                      # Frontend React
│   ├── components/           # Componentes React
│   │   ├── Homepage.tsx      # Página principal
│   │   ├── HecRas/          # Suite de análisis HEC-RAS
│   │   └── ui/              # Componentes UI reutilizables
│   └── assets/              # Recursos estáticos
├── src-tauri/               # Backend Rust
├── src-python/              # Backend Python
│   └── HECRAS-HDF/         # Procesamiento pyHMT2D
└── docs/                    # Documentación
```

## 🎯 Casos de Uso

- **Ingenieros Civiles**: Análisis de salidas de modelos HEC-RAS 2D
- **Profesionales de Recursos Hídricos**: Visualización de resultados de simulación
- **Investigadores**: Exploración de estructuras de archivos HDF y datasets
- **Estudiantes**: Aprendizaje de principios de cálculo hidráulico

## 🔧 Desarrollo

### Contribuir
1. Fork del repositorio
2. Crear rama de feature: `git checkout -b feature/nueva-caracteristica`
3. Commit de cambios: `git commit -m 'Agregar nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abrir Pull Request

## � Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

<div align="center">
  <strong>eFlood²</strong> - Potenciando el análisis hidráulico con tecnología moderna
  <br>
  Construido con ❤️ para la comunidad de ingeniería civil
  <br><br>
  © 2025 eFlood² Team. Construido con Tauri + React + Python.
</div>
