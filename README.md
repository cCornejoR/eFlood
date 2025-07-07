<!-- Custom fonts for GitHub README -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
@font-face {
  font-family: 'Allenoire';
  src: url('https://raw.githubusercontent.com/cCornejoR/eFlood/main/src/assets/ttf/allenoire-allenoire-regular-400.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
</style>

<div align="center">

<img src="https://raw.githubusercontent.com/cCornejoR/eFlood/main/src/assets/logo.svg" alt="eFlood² Logo" width="120" style="border-radius: 20px;">

<h1 style="font-family: 'Allenoire', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 400; letter-spacing: -0.02em; margin: 0.5rem 0;">eFlood²</h1>

**Análisis hidráulico avanzado para modelos HEC-RAS 2D**

[![Version](https://img.shields.io/github/v/release/cCornejoR/eFlood?style=for-the-badge&logo=github&logoColor=white&label=VERSION)](https://github.com/cCornejoR/eFlood/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/cCornejoR/eFlood/ci.yml?style=for-the-badge&logo=github-actions&logoColor=white&label=BUILD)](https://github.com/cCornejoR/eFlood/actions/workflows/ci.yml)
[![Quality](https://img.shields.io/github/actions/workflow/status/cCornejoR/eFlood/quality-analysis.yml?style=for-the-badge&logo=codeclimate&logoColor=white&label=QUALITY)](https://github.com/cCornejoR/eFlood/actions/workflows/quality-analysis.yml)
[![Issues](https://img.shields.io/github/issues/cCornejoR/eFlood?style=for-the-badge&logo=github&logoColor=white&label=ISSUES)](https://github.com/cCornejoR/eFlood/issues)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](https://github.com/cCornejoR/eFlood/blob/main/LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge&logo=tauri)](https://tauri.app)

</div>

<div align="center">
  <img src="https://raw.githubusercontent.com/cCornejoR/eFlood/main/src/assets/Program.png" alt="eFlood² Interface" width="100%" style="max-width: 900px; border-radius: 12px;">
</div>

---

## 🌊 Acerca de eFlood²

**eFlood²** es una aplicación de escritorio moderna para el análisis avanzado de modelos hidráulicos HEC-RAS 2D. Desarrollada con **Tauri**, **React** y **Python**, ofrece una interfaz intuitiva para procesar archivos HDF5, visualizar datos hidráulicos y exportar resultados a VTK.

## ✨ Características Principales

- 📊 **Análisis HDF5**: Procesamiento completo de archivos HEC-RAS con pyHMT2D
- 🎯 **Visualización Avanzada**: Hidrogramas, condiciones de contorno y valores de Manning
- 📈 **Exportación VTK**: Compatible con ParaView y otros visualizadores científicos
- ⚡ **Interfaz Moderna**: Diseño minimalista con animaciones fluidas
- 🔧 **Multiplataforma**: Windows, macOS y Linux
- 🚀 **Alto Rendimiento**: Arquitectura Rust + Python optimizada

## 🏗️ Arquitectura

eFlood² utiliza una arquitectura moderna de tres capas con backends especializados:

### **🎨 Frontend**
- **React + TypeScript**: Interfaz de usuario moderna y reactiva
- **Vite**: Build tool optimizado para desarrollo rápido
- **TailwindCSS**: Diseño responsive y componentes reutilizables

### **🦀 Backend Nativo (Tauri/Rust)**
- **Alto rendimiento**: Operaciones del sistema y gestión de archivos
- **Seguridad**: Comunicación segura entre frontend y backend Python
- **Multiplataforma**: Compilación nativa para Windows, macOS y Linux
- **Gestión de recursos**: Monitoreo de CPU, memoria y procesos

### **🐍 Backend Científico (Python)**
- **pyHMT2D**: Procesamiento avanzado de archivos HDF5 de HEC-RAS
- **RAS Commander**: Integración con automatización de HEC-RAS
- **Análisis hidráulico**: Cálculos especializados y procesamiento de datos
- **Exportación VTK**: Generación de archivos para visualización científica

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React + TS    │◄──►│   Tauri (Rust)  │◄──►│ Python Backend  │
│   (Frontend)    │    │   (Sistema)     │    │  (Hidráulico)   │
│                 │    │                 │    │                 │
│ • UI/UX         │    │ • File System   │    │ • HDF Analysis  │
│ • Visualización │    │ • Process Mgmt  │    │ • RAS Commander │
│ • Interacción   │    │ • System Info   │    │ • VTK Export    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **🔄 Flujo de Datos**

1. **Usuario** interactúa con la interfaz React
2. **Frontend** envía comandos al backend Tauri
3. **Tauri** ejecuta scripts Python con UV
4. **Python** procesa datos HDF y genera resultados
5. **Resultados** se devuelven a través de Tauri al frontend
6. **Visualización** se actualiza en tiempo real

## 🚀 Instalación

### Desde Releases (Recomendado)
Descarga la última versión desde [GitHub Releases](https://github.com/cCornejoR/eFlood/releases)

### Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/cCornejoR/eFlood.git
cd eFlood

# Instalar dependencias
npm install

# Configurar entorno Python
cd src-python && uv sync && cd ..

# Ejecutar en modo desarrollo
npm run tauri dev
```

## 📋 Requisitos del Sistema

| Componente | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Python** | 3.11+ | Backend de procesamiento |
| **UV** | Latest | Gestor de paquetes Python |
| **Rust** | Latest | Compilación Tauri |

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run tauri dev        # Aplicación Tauri en desarrollo
npm run tauri build      # Compilar aplicación

# Calidad de Código
npm run validate         # Validación completa
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Vitest
```

## 📊 Estado del Proyecto

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Frontend (React) | ✅ Estable | Interfaz de usuario completa |
| Backend (Python) | ✅ Estable | Procesamiento HDF5 funcional |
| Tauri Integration | ✅ Estable | Comunicación Rust-Python |
| VTK Export | 🚧 Beta | Exportación a ParaView |

## 🗺️ Roadmap

### v0.2.0 - Próxima Release
- [ ] Cálculos hidráulicos avanzados
- [ ] Visualizador VTK integrado
- [ ] Exportación de reportes PDF
- [ ] Soporte para múltiples modelos

### v0.3.0 - Futuro
- [ ] Análisis de sensibilidad
- [ ] Comparación de escenarios
- [ ] API REST para integración

## 🛠️ Desarrollo y Calidad de Código

### **Pre-commit Hooks**

eFlood² utiliza pre-commit hooks para mantener la calidad del código automáticamente:

```bash
# Instalar pre-commit hooks
uv run --directory src-python pre-commit install

# Ejecutar manualmente todos los hooks
uv run --directory src-python pre-commit run --all-files
```

### **Hooks Configurados**

| Hook | Descripción | Tecnología |
|------|-------------|------------|
| 🎨 **TypeScript Check** | Verificación de tipos TypeScript | Frontend |
| 🔧 **Black Formatting** | Formateo automático Python | Backend Python |
| 📦 **Import Sorting** | Ordenamiento de imports Python | Backend Python |
| 🐍 **Syntax Check** | Verificación de sintaxis Python | Backend Python |
| 🦀 **Cargo Format** | Formateo automático Rust | Backend Rust |
| 🔍 **Clippy Linting** | Linting avanzado Rust | Backend Rust |
| ⚙️ **Cargo Check** | Verificación de compilación Rust | Backend Rust |
| 🧪 **Unit Tests** | Tests unitarios automáticos | Ambos backends |
| 🔒 **Security Checks** | Verificaciones de seguridad | General |

### **Comandos de Desarrollo**

```bash
# Python Backend
cd src-python
uv run black .                    # Formatear código Python
uv run isort .                    # Ordenar imports
uv run flake8 eflood2_backend/    # Linting Python
uv run pytest test/ -v           # Tests Python

# Rust Backend
cd src-tauri
cargo fmt                        # Formatear código Rust
cargo clippy -- -D warnings      # Linting Rust
cargo check                      # Verificar compilación
cargo test                       # Tests Rust

# Frontend
npm run lint                     # ESLint
npm run format                   # Prettier
npm run type-check               # TypeScript
npm run test                     # Vitest
```

### **Configuración de Calidad**

- **Python**: Black, isort, flake8, mypy, pytest
- **Rust**: rustfmt, clippy, cargo check/test
- **TypeScript**: ESLint, Prettier, TypeScript compiler
- **Pre-commit**: Hooks automáticos en cada commit

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para nuevas características, abre un issue primero para discutir los cambios propuestos.

### **Proceso de Contribución**

1. **Fork** del proyecto
2. **Crear** rama feature (`git checkout -b feature/nueva-caracteristica`)
3. **Desarrollar** siguiendo los estándares de calidad
4. **Verificar** que todos los pre-commit hooks pasan
5. **Commit** cambios (`git commit -m 'feat: agregar nueva característica'`)
6. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
7. **Abrir** Pull Request

### **Estándares de Código**

- ✅ **Python**: PEP 8, type hints, docstrings
- ✅ **Rust**: Rustfmt, Clippy warnings como errores
- ✅ **TypeScript**: Strict mode, ESLint rules
- ✅ **Tests**: Cobertura mínima del 80%
- ✅ **Commits**: Conventional Commits format

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Crhistian Cornejo** - [GitHub](https://github.com/cCornejoR)

---

<div align="center">

**eFlood² - Análisis hidráulico de nueva generación**

[GitHub](https://github.com/cCornejoR/eFlood) • [Issues](https://github.com/cCornejoR/eFlood/issues) • [Releases](https://github.com/cCornejoR/eFlood/releases)

</div>