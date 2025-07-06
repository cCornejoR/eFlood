<<<<<<< Updated upstream
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
>>>>>>> 3167d3e32374596856758f993b04ff9787de5fbb
=======
<div align="center">
  <img src="src/assets/logo.svg" alt="eFlood² Logo" width="120" height="120">

  # eFlood²

  **Herramienta Avanzada de Análisis Hidráulico para Modelos HEC-RAS 2D**

  [![Version](https://img.shields.io/badge/version-0.1.0--alpha-orange?style=for-the-badge)](package.json)
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/cCornejoR/eFlow/actions)
  [![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  [![Tauri](https://img.shields.io/badge/Tauri-2.6-24C8DB?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

  [![Documentation](https://img.shields.io/badge/docs-available-brightgreen?style=for-the-badge&logo=gitbook&logoColor=white)](docs/)
  [![Issues](https://img.shields.io/github/issues/cCornejoR/eFlow?style=for-the-badge)](https://github.com/cCornejoR/eFlow/issues)
  [![Stars](https://img.shields.io/github/stars/cCornejoR/eFlow?style=for-the-badge)](https://github.com/cCornejoR/eFlow/stargazers)
  [![Forks](https://img.shields.io/github/forks/cCornejoR/eFlow?style=for-the-badge)](https://github.com/cCornejoR/eFlow/network/members)

  ---

  **Una aplicación de escritorio moderna construida con Tauri + React + TypeScript + Python para análisis hidráulico profesional**

</div>

## 📸 Vista Previa

<div align="center">
  <img src="src/assets/Program.png" alt="eFlood² Interface" width="100%" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
  <p><em>Pagina de incio principal de eFlood² </em></p>
</div>

## 🎯 ¿Qué es eFlood²?

eFlood² es una herramienta avanzada de análisis hidráulico desarrollada para apoyar el diseño, evaluación y toma de decisiones en proyectos de infraestructura hidráulica. Permite procesar, interpretar y visualizar resultados de modelos bidimensionales (2D) con alta precisión, facilitando el análisis detallado de:

- Manchas de inundación, velocidades y tirantes en eventos extremos.

- Dinámicas de flujo en superficie libre sobre mallas irregulares.

- Evaluación de riesgos hidráulicos, socavaciones potenciales y zonas críticas de erosión.

- Curvas de remanso, resaltos hidráulicos y caudales máximos a partir de los resultados simulados.

- Análisis comparativo entre múltiples escenarios de modelamiento, incluyendo propuestas de mitigación y obras de control.

Todo esto se realiza a partir de archivos de salida de modelos hidrodinámicos como HEC-RAS 2D, permitiendo una lectura estructurada de sus datos internos y transformándolos en información accionable y visualmente clara para los usuarios. eFlood² facilita la generación de informes técnicos, la validación de hipótesis hidráulicas y el diseño eficiente de soluciones basadas en evidencia simulada.

### ✨ Características Principales
#### 📊 **Análisis de Archivos HDF5**
- **Procesamiento Avanzado**: Análisis completo de archivos de salida HEC-RAS 2D
- **Explorador de Estructura**: Navegación detallada del contenido y metadatos HDF
- **Detección Automática**: Identificación inteligente de datasets hidráulicos (profundidad, velocidad, superficie de agua)
- **Información Completa**: Visualización de tamaño, fecha de modificación y detalles del archivo

#### 🔧 **Calculadora Hidráulica**
- **Cálculo de Profundidad Normal**: Análisis de flujo en canales abiertos
- **Profundidad Crítica**: Determinación de condiciones críticas de flujo
- **Análisis Integral**: Cálculos completos incluyendo:
  - Área mojada y perímetro
  - Radio hidráulico
  - Número de Froude
  - Determinación de régimen (subcrítico/supercrítico)
  - Cálculos de velocidad y caudal

#### 📈 **Visualización y Exportación**
- **Gráficos Interactivos**: Charts SVG y scatter plots responsivos
- **Tablas de Datos**: Visualización tabular con paginación inteligente
- **Múltiples Formatos de Exportación**:
  - Exportación CSV
  - Exportación JSON
  - Exportación Excel
  - Exportación VTK para visualización 3D
- **Selección de Datasets**: Elección flexible de datasets HDF disponibles

#### 📐 **Herramientas de Geometría**
- **Canvas Interactivo**: Interfaz de dibujo click-to-draw para elementos geométricos
- **Creación de Splines**: Interpolación avanzada desde puntos dibujados por el usuario
- **Generación de Ejes**: Creación de ejes hidráulicos desde splines geométricos
- **Secciones Transversales**: Generación automatizada de secciones a lo largo de ejes
- **Capacidades de Exportación**: Exportación como GeoJSON y Shapefile

## 🗺️ Roadmap hacia el Release Oficial

### 🚀 **Versión Alpha 0.1.0** (Actual)
- [x] Interfaz base con React + Tauri
- [x] Procesamiento básico de archivos HDF5
- [x] Visualización de estructura de archivos
- [x] Calculadora hidráulica básica
- [x] Exportación CSV/JSON
- [x] Interfaz de usuario moderna

### 🎯 **Versión Beta 0.5.0** (Q2 2025)
- [ ] **Visualización 3D Completa**
  - [ ] Integración VTK.js avanzada
  - [ ] Renderizado de mallas 2D
  - [ ] Visualización de resultados temporales
- [ ] **Análisis Avanzado**
  - [ ] Cálculos de Manning
  - [ ] Análisis de hidrogramas
  - [ ] Condiciones de frontera
- [ ] **Mejoras de Performance**
  - [ ] Procesamiento en background
  - [ ] Cache inteligente de datos
  - [ ] Optimización de memoria

### 🏆 **Versión 1.0.0 - Release Oficial** (Q4 2025)
- [ ] **Compatibilidad Completa HEC-RAS**
  - [ ] Soporte HEC-RAS 6.0 - 6.7
  - [ ] Importación de geometrías
  - [ ] Análisis de calibración
- [ ] **Herramientas Profesionales**
  - [ ] Generación de reportes automáticos
  - [ ] Comparación de escenarios
  - [ ] Análisis estadístico avanzado
- [ ] **Integración y Distribución**
  - [ ] Instaladores para Windows/macOS/Linux
  - [ ] Documentación completa
  - [ ] Tutoriales y ejemplos

### 🔮 **Futuras Versiones** (2026+)
- [ ] **Integración Cloud**
  - [ ] Procesamiento distribuido
  - [ ] Colaboración en tiempo real
  - [ ] Almacenamiento en la nube
- [ ] **Machine Learning**
  - [ ] Predicción de inundaciones
  - [ ] Optimización automática de parámetros
  - [ ] Detección de anomalías

## 🛠️ Stack Tecnológico

<div align="center">

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=flat-square&logo=tailwindcss) |
| **Desktop** | ![Tauri](https://img.shields.io/badge/Tauri-2.6-24C8DB?style=flat-square&logo=tauri) ![Rust](https://img.shields.io/badge/Rust-1.70+-000000?style=flat-square&logo=rust) |
| **Backend** | ![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python) ![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy) ![Pandas](https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas) |
| **Visualización** | ![VTK](https://img.shields.io/badge/VTK.js-34.3-FF6B6B?style=flat-square) ![Plotly](https://img.shields.io/badge/Plotly-3.0-3F4F75?style=flat-square&logo=plotly) ![Recharts](https://img.shields.io/badge/Recharts-3.0-8884D8?style=flat-square) |
| **Animaciones** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.23-0055FF?style=flat-square&logo=framer) ![GSAP](https://img.shields.io/badge/GSAP-3.13-88CE02?style=flat-square) |
| **Herramientas** | ![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat-square&logo=vite) ![ESLint](https://img.shields.io/badge/ESLint-9.30-4B32C3?style=flat-square&logo=eslint) ![Prettier](https://img.shields.io/badge/Prettier-3.6-F7B93E?style=flat-square&logo=prettier) |

</div>

### 🔧 **Componentes Clave**
- **pyHMT2D**: Librería especializada para procesamiento de modelos HEC-RAS 2D
- **H5py + NumPy + Pandas**: Stack completo para manipulación de datos científicos
- **VTK.js**: Visualización 3D de alta performance en el navegador
- **Tauri**: Framework para aplicaciones de escritorio con Rust + Web technologies

## ⚡ Inicio Rápido

### 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión Mínima | Instalación |
|-------------|----------------|-------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **Rust** | 1.70+ | [rustup.rs](https://rustup.rs/) |
| **Python** | 3.11+ | [python.org](https://python.org/) |
| **UV** | Latest | `pip install uv` |

### 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/cCornejoR/eFlow.git
cd eFlow

# 2. Instalar dependencias del frontend
npm install

# 3. Configurar entorno Python
cd src-python
uv sync
cd ..

# 4. Ejecutar en modo desarrollo
npm run tauri:dev
```

### 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | 🌐 Servidor de desarrollo frontend |
| `npm run tauri:dev` | 🖥️ Aplicación completa con Tauri |
| `npm run tauri:build` | 📦 Construir para producción |
| `npm run lint` | 🔍 Análisis de código con ESLint |
| `npm run format` | ✨ Formatear código con Prettier |
| `npm run test` | 🧪 Ejecutar tests |
| `npm run validate` | ✅ Validación completa (lint + format + test) |

### 🎮 Uso Básico

1. **Cargar Archivo HDF5**: Arrastra y suelta tu archivo `.hdf` de HEC-RAS
2. **Explorar Estructura**: Navega por los datasets disponibles
3. **Visualizar Datos**: Selecciona datasets para generar gráficos
4. **Exportar Resultados**: Guarda en formato CSV, JSON o VTK

## 🏗️ Arquitectura del Proyecto

```
eFlow/
├── 🎨 src/                          # Frontend React + TypeScript
│   ├── components/                  # Componentes React
│   │   ├── Homepage.tsx            # Página principal con cards animadas
│   │   ├── HecRas/                 # Suite completa de análisis HEC-RAS
│   │   │   ├── HecRasAnalysis.tsx  # Página principal de análisis
│   │   │   ├── HdfViewer.tsx       # Visualizador de estructura HDF
│   │   │   ├── VtkViewer.tsx       # Visualizador 3D con VTK.js
│   │   │   └── HydraulicCalc.tsx   # Calculadora hidráulica
│   │   └── ui/                     # Componentes UI reutilizables
│   │       ├── Button.tsx          # Botones con efectos neon
│   │       ├── FileUpload.tsx      # Componente de carga de archivos
│   │       └── LoaderDot.tsx       # Animaciones de carga
│   ├── assets/                     # Recursos estáticos
│   │   ├── Program.png             # Screenshot de la aplicación
│   │   ├── logo.svg                # Logo de eFlood²
│   │   └── images/                 # Imágenes para cards
│   └── styles/                     # Estilos Tailwind CSS
├── 🦀 src-tauri/                   # Backend Rust + Tauri
│   ├── src/                        # Código fuente Rust
│   │   ├── main.rs                 # Punto de entrada principal
│   │   ├── commands.rs             # Comandos Tauri para Python bridge
│   │   └── lib.rs                  # Configuración de la librería
│   └── tauri.conf.json             # Configuración de Tauri
├── 🐍 src-python/                  # Backend Python + pyHMT2D
│   ├── HECRAS-HDF/                 # Procesamiento de archivos HDF5
│   │   ├── hdf_processor.py        # Procesador principal de HDF
│   │   ├── vtk_exporter.py         # Exportador VTK
│   │   └── hydraulic_calc.py       # Cálculos hidráulicos
│   ├── pyproject.toml              # Configuración UV/Python
│   └── .venv/                      # Entorno virtual Python
├── 📚 docs/                        # Documentación
│   ├── api/                        # Documentación de API
│   ├── user-guide/                 # Guía de usuario
│   └── development/                # Guía de desarrollo
└── 🔧 Configuración
    ├── package.json                # Dependencias Node.js
    ├── tailwind.config.js          # Configuración Tailwind
    ├── vite.config.ts              # Configuración Vite
    └── tsconfig.json               # Configuración TypeScript
```

## 🎯 Casos de Uso

### 👷 **Para Ingenieros Civiles**
- Análisis post-procesamiento de modelos HEC-RAS 2D
- Visualización de resultados de inundación
- Generación de reportes técnicos
- Validación de resultados de calibración

### 💧 **Para Profesionales de Recursos Hídricos**
- Análisis de escenarios de inundación
- Evaluación de medidas de mitigación
- Estudios de impacto hidrológico
- Planificación de infraestructura hidráulica

### 🔬 **Para Investigadores**
- Exploración detallada de datasets HDF5
- Análisis comparativo de modelos
- Desarrollo de metodologías de análisis
- Validación de nuevos algoritmos

### 🎓 **Para Estudiantes**
- Aprendizaje de principios hidráulicos
- Práctica con datos reales de HEC-RAS
- Comprensión de modelado 2D
- Desarrollo de habilidades de análisis

## 🤝 Contribuir al Proyecto

¡Las contribuciones son bienvenidas! Sigue estos pasos:

### 🔄 Proceso de Contribución

1. **Fork** del repositorio
2. **Clonar** tu fork: `git clone https://github.com/tu-usuario/eFlow.git`
3. **Crear rama** de feature: `git checkout -b feature/nueva-caracteristica`
4. **Desarrollar** tu característica
5. **Commit** de cambios: `git commit -m 'feat: agregar nueva característica'`
6. **Push** a la rama: `git push origin feature/nueva-caracteristica`
7. **Abrir** Pull Request

### 📝 Convenciones de Commit

Usamos [Conventional Commits](https://conventionalcommits.org/):

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

### 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:ui
```

## 📊 Estado del Proyecto

<div align="center">

![GitHub last commit](https://img.shields.io/github/last-commit/cCornejoR/eFlow?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/cCornejoR/eFlow?style=for-the-badge)
![GitHub code size](https://img.shields.io/github/languages/code-size/cCornejoR/eFlow?style=for-the-badge)
![GitHub repo size](https://img.shields.io/github/repo-size/cCornejoR/eFlow?style=for-the-badge)

</div>

## 🆘 Soporte y Comunidad

### 💬 **¿Necesitas Ayuda?**

- 📖 **Documentación**: Revisa la [documentación completa](docs/)
- 🐛 **Reportar Bugs**: [Crear issue](https://github.com/cCornejoR/eFlow/issues/new?template=bug_report.md)
- 💡 **Solicitar Features**: [Crear issue](https://github.com/cCornejoR/eFlow/issues/new?template=feature_request.md)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/cCornejoR/eFlow/discussions)

### 🌐 **Conecta con Nosotros**

- 📧 **Email**: [crhistian.cornejo03@gmail.com](mailto:crhistian.cornejo03@gmail.com)
- 💼 **LinkedIn**: [Crhistian Cornejo](https://www.linkedin.com/in/crhistian-cornejo/)
- 🐙 **GitHub**: [@cCornejoR](https://github.com/cCornejoR)

## 📄 Licencia

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para detalles completos.

```
MIT License

Copyright (c) 2025 eFlood² Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Agradecimientos

- **HEC-RAS Team** por el excelente software de modelado hidráulico
- **pyHMT2D** por la librería de procesamiento de archivos HDF5 que sirvió de base para adaptar a los requierimientos del software
- **Tauri Team** por el framework desktop
- **React Team** por la librería de UI más popular del mundo
- **Comunidad Open Source** por las increíbles herramientas y librerías

---

<div align="center">

  <img src="src/assets/logo.svg" alt="eFlood² Logo" width="60" height="60">

  ### **eFlood²**

  **Potenciando el análisis hidráulico con tecnología moderna**

  [![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)](https://github.com/cCornejoR/eFlow)
  [![For Engineers](https://img.shields.io/badge/For-Engineers-blue?style=for-the-badge)](https://github.com/cCornejoR/eFlow)
  [![Open Source](https://img.shields.io/badge/Open-Source-green?style=for-the-badge)](https://github.com/cCornejoR/eFlow)

  **Construido con Tauri 🦀 + React ⚛️ + Python 🐍**

  `Versión Alpha 0.1.0` • `© 2025 eFlood² Team`

  ---

  ⭐ **¡Si te gusta el proyecto, dale una estrella!** ⭐

</div>
>>>>>>> Stashed changes
