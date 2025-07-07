<p align="center">
  <img src="src/assets/Logo.png" alt="eFlood² logo" width="120">
</p>
<p align="center">Análisis hidráulico avanzado para modelos HEC-RAS 2D</p>
<p align="center">
  <a href="https://github.com/cCornejoR/eFlood/releases"><img alt="Version" src="https://img.shields.io/github/v/release/cCornejoR/eFlood?style=flat-square&label=version" /></a>
  <a href="https://github.com/cCornejoR/eFlood/actions/workflows/quality-analysis.yml"><img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/cCornejoR/eFlood/quality-analysis.yml?style=flat-square&branch=main" /></a>
  <a href="https://github.com/cCornejoR/eFlood/actions/workflows/quality-analysis.yml"><img alt="Tests" src="https://img.shields.io/github/actions/workflow/status/cCornejoR/eFlood/quality-analysis.yml?style=flat-square&label=tests&branch=main" /></a>
  <a href="https://github.com/cCornejoR/eFlood/issues"><img alt="Issues" src="https://img.shields.io/github/issues/cCornejoR/eFlood?style=flat-square" /></a>
  <a href="https://github.com/cCornejoR/eFlood/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/cCornejoR/eFlood?style=flat-square" /></a>
</p>

[![eFlood² Screenshot](src/assets/Program.png)](https://github.com/cCornejoR/eFlood)

---

## 🌊 **eFlood²**

**eFlood²** es una aplicación de escritorio moderna para el análisis avanzado de modelos hidráulicos HEC-RAS 2D. Desarrollada con **Tauri**, **React** y **Python**, ofrece una interfaz intuitiva para procesar archivos HDF5, visualizar datos hidráulicos y exportar resultados a VTK.

### ✨ **Características Principales**

- 📊 **Análisis HDF5**: Procesamiento completo de archivos HEC-RAS con pyHMT2D
- 🎯 **Visualización Avanzada**: Hidrogramas, condiciones de contorno y valores de Manning
- 📈 **Exportación VTK**: Compatible con ParaView y otros visualizadores científicos
- ⚡ **Interfaz Moderna**: Diseño minimalista con animaciones GSAP
- 🔧 **Multiplataforma**: Windows, macOS y Linux

### 🚀 **Instalación**

#### Desde Releases (Recomendado)
```bash
# Descargar la última versión desde GitHub Releases
# https://github.com/cCornejoR/eFlood/releases
```

#### Desarrollo Local
```bash
# Clonar repositorio
git clone https://github.com/cCornejoR/eFlood.git
cd eFlood

# Instalar dependencias
npm install

# Configurar entorno Python
cd src-python
uv sync
cd ..

# Ejecutar en modo desarrollo
npm run tauri:dev
```

### 📋 **Requisitos del Sistema**

- **Node.js** 18+ y npm
- **Python** 3.11+ con UV package manager
- **Rust** (para compilación Tauri)
- **Archivos HEC-RAS**: Modelos .hdf y archivos de terreno

### 🛠️ **Scripts Disponibles**

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run tauri:dev        # Aplicación Tauri en desarrollo
npm run tauri:build      # Compilar aplicación

# Calidad de Código
npm run validate         # Validación completa (lint, format, tests)
npm run lint             # ESLint
npm run format           # Prettier
npm run test             # Vitest

# Análisis de Warnings
npm run analyze:warnings # Análisis detallado de warnings
```

### 📊 **Estado del Proyecto**

| Componente | Estado | Cobertura |
|------------|--------|-----------|
| Frontend (React) | ✅ Estable | ![Frontend](https://img.shields.io/badge/coverage-85%25-green?style=flat-square) |
| Backend (Python) | ✅ Estable | ![Backend](https://img.shields.io/badge/coverage-78%25-yellow?style=flat-square) |
| Tauri Integration | ✅ Estable | ![Integration](https://img.shields.io/badge/tests-passing-green?style=flat-square) |
| VTK Export | 🚧 Beta | ![VTK](https://img.shields.io/badge/status-beta-orange?style=flat-square) |

### 🗺️ **Roadmap**

#### v0.2.0 - Próxima Release
- [ ] Cálculos hidráulicos avanzados
- [ ] Visualizador VTK integrado
- [ ] Exportación de reportes PDF
- [ ] Soporte para múltiples modelos

#### v0.3.0 - Futuro
- [ ] Análisis de sensibilidad
- [ ] Comparación de escenarios
- [ ] API REST para integración
- [ ] Plugin system

### 🤝 **Contribuir**

Las contribuciones son bienvenidas. Para nuevas características, por favor abre un issue primero para discutir los cambios propuestos.

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

### 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

### 👨‍💻 **Autor**

**Crhistian Cornejo** - [GitHub](https://github.com/cCornejoR) | [LinkedIn](https://linkedin.com/in/crhistian-cornejo)

---

**Conecta con nosotros** [GitHub](https://github.com/cCornejoR/eFlood) | [Issues](https://github.com/cCornejoR/eFlood/issues) | [Releases](https://github.com/cCornejoR/eFlood/releases)