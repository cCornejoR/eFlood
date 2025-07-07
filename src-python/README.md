# 🌊 eFlood2 Backend

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![UV](https://img.shields.io/badge/UV-Package%20Manager-green.svg)
![HEC-RAS](https://img.shields.io/badge/HEC--RAS-2D%20Compatible-orange.svg)
![RAS Commander](https://img.shields.io/badge/RAS%20Commander-Integrated-purple.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Backend Python avanzado para análisis hidráulico con eFlood2**

*Procesamiento de modelos HEC-RAS 2D, integración con RAS Commander y exportación VTK*

</div>

---

## 🚀 **Características Principales**

### 📊 **Análisis de Datos HDF**
- ✅ Lectura y análisis de archivos HDF de HEC-RAS 2D
- ✅ Extracción de metadatos y estructura de modelos
- ✅ Procesamiento de series temporales hidráulicas
- ✅ Análisis de condiciones de contorno

### 🗺️ **Integración GIS y Raster**
- ✅ Conversión a formatos GeoTIFF y raster
- ✅ Procesamiento de datos de terreno
- ✅ Integración con sistemas de coordenadas
- ✅ Exportación a formatos estándar GIS

### 🔧 **RAS Commander Integration**
- ✅ Automatización de HEC-RAS mediante RAS Commander
- ✅ Procesamiento avanzado de mallas 2D
- ✅ Extracción de valores de Manning mejorada
- ✅ Exportación VTK optimizada para visualización

### 📈 **Herramientas de Análisis**
- ✅ Cálculos hidráulicos avanzados
- ✅ Generación de hidrogramas
- ✅ Análisis de perfiles longitudinales
- ✅ Mapas de profundidad y velocidad

### 📤 **Exportación de Datos**
- ✅ Formatos múltiples: CSV, Excel, JSON, PDF
- ✅ Exportación VTK para ParaView/VTK.js
- ✅ Reportes automatizados
- ✅ Visualizaciones interactivas

---

## 🏗️ **Arquitectura del Proyecto**

```
src-python/
├── eflood2_backend/           # Paquete principal
│   ├── readers/               # Lectores de datos
│   │   ├── hdf_reader.py     # Lector HDF principal
│   │   ├── data_extractor.py # Extractor de datasets
│   │   ├── boundary_reader.py # Condiciones de contorno
│   │   └── manning_reader.py # Valores de rugosidad
│   ├── processors/           # Procesadores de datos
│   │   ├── hydraulic_calculator.py # Cálculos hidráulicos
│   │   ├── hydraulic_plotter.py    # Visualizaciones
│   │   ├── geometry_processor.py   # Geometría
│   │   └── section_processor.py    # Secciones transversales
│   ├── exporters/            # Exportadores
│   │   ├── data_exporter.py  # Exportación general
│   │   ├── raster_exporter.py # Exportación raster
│   │   └── hydrograph_exporter.py # Hidrogramas
│   ├── integrations/         # Integraciones externas
│   │   ├── hecras_hdf/      # Integración HEC-RAS HDF
│   │   └── ras_commander/   # Integración RAS Commander
│   │       ├── commander_project.py    # Gestión de proyectos
│   │       ├── commander_results.py    # Procesamiento de resultados
│   │       ├── commander_infrastructure.py # Infraestructura
│   │       └── commander_utils.py      # Utilidades
│   └── utils/               # Utilidades comunes
│       └── common.py        # Funciones compartidas
├── test/                    # Tests unitarios
│   ├── test_commander_isolated.py # Tests RAS Commander
│   └── test_eflood2_backend.py   # Tests generales
├── pyproject.toml          # Configuración del proyecto
├── uv.lock                 # Lock file de dependencias
└── .flake8                 # Configuración de linting
```

---

## ⚙️ **Instalación y Configuración**

### **Requisitos Previos**
- 🐍 **Python 3.11+**
- 📦 **UV Package Manager**
- 🏗️ **HEC-RAS** (para funcionalidades completas)
- 📊 **RAS Commander** (para integración avanzada)

### **Instalación con UV**

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/eFlood.git
cd eFlood/src-python

# Instalar dependencias con UV
uv sync

# Activar el entorno virtual
uv shell

# Verificar instalación
uv run python -c "import eflood2_backend; print('✅ Backend instalado correctamente')"
```

### **Configuración de Desarrollo**

```bash
# Instalar dependencias de desarrollo
uv sync --group dev

# Configurar pre-commit hooks
uv run pre-commit install

# Ejecutar tests
uv run pytest test/ -v

# Verificar calidad de código
uv run black .
uv run isort .
uv run flake8 eflood2_backend/
```

---

## 🎯 **Uso del Backend**

### **1. Análisis de Archivos HDF**

```python
from eflood2_backend.readers.hdf_reader import HDFReader

# Leer archivo HDF de HEC-RAS
reader = HDFReader("modelo_hecras.hdf")

# Obtener estructura del archivo
estructura = reader.get_file_structure()
print(f"Datasets encontrados: {len(estructura)}")

# Obtener metadatos detallados
metadatos = reader.get_detailed_metadata()
print(f"Información del modelo: {metadatos}")
```

### **2. Integración con RAS Commander**

```python
from eflood2_backend.integrations.ras_commander_integration import RASCommanderProcessor

# Inicializar procesador
processor = RASCommanderProcessor()

# Obtener información completa de malla
mesh_info = processor.get_comprehensive_mesh_info(
    hdf_file="modelo.hdf",
    terrain_file="terreno.tif"
)

# Exportar a VTK para visualización
processor.export_to_vtk_enhanced(
    hdf_file="modelo.hdf",
    output_dir="./vtk_output/",
    terrain_file="terreno.tif"
)
```

### **3. Procesamiento de Datos Hidráulicos**

```python
from eflood2_backend.processors.hydraulic_calculator import HydraulicCalculator

# Inicializar calculadora
calc = HydraulicCalculator()

# Calcular profundidad normal
resultado = calc.calculate_normal_depth(
    flow_rate=100.0,      # m³/s
    slope=0.001,          # m/m
    manning_n=0.03,       # Coeficiente de Manning
    width=10.0            # m
)

print(f"Profundidad normal: {resultado['depth']:.2f} m")
```

### **4. Exportación de Datos**

```python
from eflood2_backend.exporters.data_exporter import DataExporter

# Inicializar exportador
exporter = DataExporter()

# Exportar a CSV
exporter.export_to_csv(
    data=datos_hidraulicos,
    output_path="resultados.csv"
)

# Generar reporte PDF
exporter.create_summary_report(
    data=datos_analisis,
    output_path="reporte_hidraulico.pdf"
)
```

---

## 🧪 **Testing y Calidad de Código**

### **Ejecutar Tests**

```bash
# Tests completos
uv run pytest test/ -v

# Tests específicos de RAS Commander
uv run pytest test/test_commander_isolated.py -v

# Tests con cobertura
uv run pytest test/ --cov=eflood2_backend --cov-report=html
```

### **Verificación de Calidad**

```bash
# Formateo automático
uv run black eflood2_backend/
uv run isort eflood2_backend/

# Linting
uv run flake8 eflood2_backend/

# Type checking
uv run mypy eflood2_backend/integrations/ras_commander/
```

### **Pre-commit Hooks**

```bash
# Instalar hooks
uv run pre-commit install

# Ejecutar manualmente
uv run pre-commit run --all-files

# Los hooks se ejecutan automáticamente en cada commit
git commit -m "feat: nueva funcionalidad"
```

---

## 📚 **Módulos Principales**

| Módulo | Descripción | Funcionalidades |
|--------|-------------|-----------------|
| **readers/** | Lectores de datos | HDF, condiciones de contorno, Manning |
| **processors/** | Procesamiento | Cálculos hidráulicos, geometría, visualización |
| **exporters/** | Exportación | CSV, Excel, PDF, VTK, raster |
| **integrations/** | Integraciones | HEC-RAS HDF, RAS Commander |
| **utils/** | Utilidades | Funciones comunes, logging, validación |

---

## 🔧 **Configuración Avanzada**

### **Variables de Entorno**

```bash
# Configurar rutas de HEC-RAS
export HECRAS_PATH="/path/to/hecras"
export HECRAS_VERSION="6.3"

# Configurar logging
export EFLOOD_LOG_LEVEL="INFO"
export EFLOOD_LOG_FILE="eflood2.log"
```

### **Configuración de pyproject.toml**

El archivo `pyproject.toml` incluye configuraciones optimizadas para:
- ✅ **Black**: Formateo de código
- ✅ **isort**: Ordenamiento de imports
- ✅ **flake8**: Linting
- ✅ **mypy**: Type checking
- ✅ **pytest**: Testing

---

## 🤝 **Contribución**

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Crear** un Pull Request

### **Estándares de Código**
- ✅ Seguir PEP 8
- ✅ Usar type hints
- ✅ Documentar funciones con docstrings
- ✅ Escribir tests para nuevas funcionalidades
- ✅ Mantener cobertura de tests > 80%

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🆘 **Soporte**

- 📧 **Email**: soporte@eflood2.com
- 📖 **Documentación**: [docs.eflood2.com](https://docs.eflood2.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/eFlood/issues)
- 💬 **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/eFlood/discussions)

---

<div align="center">

**🌊 eFlood2 Backend - Potenciando el análisis hidráulico con tecnología moderna**

*Desarrollado con ❤️ para la comunidad de ingeniería hidráulica*

</div>
