# 📋 pyHMT2D - Python Hydraulic Modeling Tools 2D

## 🚀 ¿Qué es pyHMT2D?

**pyHMT2D** es una biblioteca de Python especializada en el procesamiento y análisis de datos de modelos hidráulicos 2D, especialmente diseñada para trabajar con **HEC-RAS** y **SRH-2D**. Su objetivo principal es servir como puente entre los modelos hidráulicos y el ecosistema científico de Python.

### 🎯 Características Principales

- **Lectura de archivos HDF** de HEC-RAS 2D
- **Exportación a formato VTK** para visualización en ParaView
- **Conversión entre formatos** (HEC-RAS ↔ SRH-2D)
- **Interpolación y muestreo** de resultados
- **Automatización** de simulaciones
- **Análisis y calibración** de modelos

---

## 📦 Instalación

```bash
# Instalación desde PyPI
pip install pyHMT2D

# Instalación desde GitHub
pip install git+https://github.com/psu-efd/pyHMT2D.git

# Instalación para desarrollo
git clone https://github.com/psu-efd/pyHMT2D.git
cd pyHMT2D
pip install -e .
```

### 📋 Dependencias Requeridas

```txt
h5py          # Lectura de archivos HDF5
vtk           # Visualización y exportación VTK
pywin32       # Interfaz con Windows (para HEC-RAS)
gdal          # Procesamiento geoespacial
affine        # Transformaciones geométricas
numpy         # Computación numérica
```

---

## 🔍 Lectura de Archivos HDF de HEC-RAS

### Clase Principal: `RAS_2D_Data`

```python
import pyHMT2D

# Inicializar el lector de datos HEC-RAS
ras_data = pyHMT2D.RAS_2D.RAS_2D_Data(
    hdf_filename="modelo_hidraulico.p01.hdf",
    terrain_filename="terreno.tif"  # Opcional
)

# Cargar soluciones de área 2D
ras_data.load2DAreaSolutions()

# Acceder a los datos cargados
print(f"Número de celdas: {ras_data.num_cells}")
print(f"Pasos de tiempo: {ras_data.num_time_steps}")
print(f"Áreas 2D: {ras_data.area_names}")
```

### Extracción de Variables Hidráulicas

```python
# Cargar profundidades
depths = ras_data.get_cell_depths()

# Cargar elevaciones de superficie de agua
wse = ras_data.get_water_surface_elevations()

# Cargar velocidades (magnitud y componentes)
velocities = ras_data.get_cell_velocities()
vel_x = ras_data.get_velocity_x()
vel_y = ras_data.get_velocity_y()

# Acceder a datos de tiempo específico
depth_t0 = ras_data.get_cell_depths(time_step=0)
```

### Información de Malla

```python
# Coordenadas de centros de celda
cell_centers = ras_data.get_cell_centers()

# Coordenadas de caras de celda
face_coords = ras_data.get_face_coordinates()

# Información topográfica
elevation = ras_data.get_cell_elevations()
```

---

## 📤 Exportación a VTK

### Exportación Básica

```python
# Exportar todos los pasos de tiempo a VTK
ras_data.saveHEC_RAS2D_results_to_VTK(
    output_directory="./vtk_results/",
    lastTimeStep=False  # True para solo el último paso
)

# Archivos generados:
# RAS2D_AreaName_0001.vtk
# RAS2D_AreaName_0002.vtk
# ...
```

### Exportación Avanzada

```python
# Exportar solo pasos de tiempo específicos
ras_data.saveHEC_RAS2D_results_to_VTK(
    output_directory="./vtk_results/",
    time_steps=[0, 10, 20, -1],  # Primero, cada 10, y último
    variables=["depth", "velocity", "wse"]  # Variables específicas
)

# Exportar con configuración personalizada
ras_data.export_to_vtk_custom(
    filename_prefix="simulation",
    include_mesh=True,
    include_boundaries=True,
    coordinate_system="UTM"
)
```

### Exportación de Geometría

```python
# Exportar límites a VTK
ras_data.export_boundaries_to_VTK("boundaries.vtk")

# Exportar perfiles de cara
ras_data.export_face_profiles_to_VTK("profiles.vtk")

# Exportar malla 3D (extruida)
ras_data.export_3D_mesh_to_VTK(
    "mesh_3d.vtk",
    num_layers=5,
    layer_thickness=1.0
)
```

---

## 📊 Plotting y Visualización

### Gráficos de Series Temporales

```python
import matplotlib.pyplot as plt
import numpy as np

# Extraer serie temporal en un punto específico
cell_id = 1000
depth_series = ras_data.get_depth_time_series(cell_id)
time_array = ras_data.get_time_array()

# Crear hidrograma
plt.figure(figsize=(10, 6))
plt.plot(time_array, depth_series)
plt.xlabel('Tiempo (horas)')
plt.ylabel('Profundidad (m)')
plt.title(f'Hidrograma - Celda {cell_id}')
plt.grid(True)
plt.show()
```

### Mapas de Inundación

```python
# Crear mapa de profundidades máximas
max_depths = ras_data.get_max_depths()
x_coords = ras_data.cell_centers[:, 0]
y_coords = ras_data.cell_centers[:, 1]

# Plot con matplotlib
plt.figure(figsize=(12, 8))
scatter = plt.scatter(x_coords, y_coords, c=max_depths, cmap='Blues')
plt.colorbar(scatter, label='Profundidad Máxima (m)')
plt.xlabel('X (m)')
plt.ylabel('Y (m)')
plt.title('Mapa de Profundidades Máximas')
plt.axis('equal')
plt.show()
```

### Perfiles Longitudinales

```python
# Definir línea de perfil
profile_points = [(x1, y1), (x2, y2), (x3, y3)]

# Interpolar datos a lo largo del perfil
profile_data = ras_data.interpolate_along_profile(
    points=profile_points,
    variables=["elevation", "wse", "depth"],
    time_step=-1  # Último paso de tiempo
)

# Graficar perfil
distance = profile_data['distance']
elevation = profile_data['elevation']
wse = profile_data['wse']

plt.figure(figsize=(12, 6))
plt.fill_between(distance, elevation, alpha=0.3, label='Terreno')
plt.plot(distance, wse, 'b-', linewidth=2, label='Superficie de Agua')
plt.xlabel('Distancia (m)')
plt.ylabel('Elevación (m)')
plt.legend()
plt.grid(True)
plt.show()
```

---

## 🔧 Control de Simulaciones HEC-RAS

### Automatización de Modelos

```python
# Inicializar controlador HEC-RAS
ras_model = pyHMT2D.RAS_2D.HEC_RAS_Model(version="6.0.0")

# Configurar y ejecutar simulación
ras_model.init_model()
ras_model.open_project("mi_proyecto.prj")

# Modificar parámetros antes de ejecutar
ras_model.modify_flow_boundary(
    boundary_name="Inlet",
    flow_data=[100, 150, 200, 150, 100]  # Hidrograma
)

# Ejecutar simulación
ras_model.run_model()

# Leer resultados automáticamente
results = ras_model.get_results()
```

### Calibración Automática

```python
# Función objetivo para calibración
def objective_function(manning_n_values):
    # Modificar coeficientes de Manning
    ras_data.modify_ManningsN(manning_n_values)

    # Ejecutar simulación
    ras_model.run_model()

    # Calcular error vs observaciones
    simulated = ras_data.get_wse_at_gages()
    observed = load_observed_data()
    rmse = np.sqrt(np.mean((simulated - observed)**2))

    return rmse

# Optimización con scipy
from scipy.optimize import minimize

result = minimize(
    objective_function,
    x0=[0.035, 0.040, 0.030],  # Valores iniciales de Manning
    method='Nelder-Mead'
)

print(f"Manning optimizado: {result.x}")
```

---

## 🔄 Conversión entre Formatos

### HEC-RAS a SRH-2D

```python
# Convertir malla HEC-RAS a formato SRH-2D
converter = pyHMT2D.RAS_2D.RAS_to_SRH_Converter()

converter.convert_mesh(
    ras_hdf_file="modelo.p01.hdf",
    output_directory="./srh_files/",
    include_boundaries=True,
    include_manning=True
)

# Archivos generados:
# - Hydraulic.dat (malla)
# - Boundary.dat (condiciones de frontera)
# - Manning.dat (rugosidad)
```

### Interpolación y Remallado

```python
# Interpolar resultados a nueva malla
new_mesh_coords = load_new_mesh_coordinates()

interpolated_data = ras_data.interpolate_to_mesh(
    target_coordinates=new_mesh_coords,
    variables=["depth", "velocity"],
    method="linear"  # 'nearest', 'linear', 'cubic'
)

# Guardar datos interpolados
save_interpolated_vtk(interpolated_data, "remapped_results.vtk")
```

---

## ⚙️ Configuración Avanzada

### Limitaciones Conocidas

- ✅ **Soportado**: Una sola área de flujo 2D por modelo
- ❌ **No soportado**: Canales 1D, estructuras, sedimentos
- 🔄 **Versiones probadas**: HEC-RAS 5.0.7 y 6.0.0

### Optimización de Performance

```python
# Configurar para archivos grandes
ras_data.configure_memory_usage(
    chunk_size=1000,      # Procesar en chunks
    use_parallel=True,    # Procesamiento paralelo
    max_workers=4         # Número de hilos
)

# Cargar solo variables necesarias
ras_data.load_selective(
    variables=["depth", "velocity"],
    time_range=(0, 100),  # Solo primeros 100 pasos
    spatial_extent=(xmin, ymin, xmax, ymax)  # Región de interés
)
```

---

## 🛠️ Ejemplos Prácticos Completos

### Análisis de Riesgo de Inundación

```python
import pyHMT2D
import numpy as np
import matplotlib.pyplot as plt

# 1. Cargar modelo HEC-RAS
ras_data = pyHMT2D.RAS_2D.RAS_2D_Data("flood_model.p01.hdf")
ras_data.load2DAreaSolutions()

# 2. Calcular estadísticas de inundación
max_depths = ras_data.get_max_depths()
flood_duration = ras_data.calculate_flood_duration(threshold=0.1)  # >10cm
flood_extent = max_depths > 0.1

# 3. Clasificar por nivel de riesgo
risk_levels = np.zeros_like(max_depths)
risk_levels[max_depths > 2.0] = 3  # Alto
risk_levels[(max_depths > 0.5) & (max_depths <= 2.0)] = 2  # Medio
risk_levels[(max_depths > 0.1) & (max_depths <= 0.5)] = 1  # Bajo

# 4. Exportar a VTK para visualización
ras_data.export_risk_analysis_vtk(
    "flood_risk.vtk",
    risk_levels=risk_levels,
    max_depths=max_depths,
    flood_duration=flood_duration
)

print(f"Área total inundada: {np.sum(flood_extent) * cell_area:.2f} m²")
```

### Análisis de Velocidades y Fuerzas

```python
# Calcular fuerzas hidrodinámicas
velocities = ras_data.get_cell_velocities()
depths = ras_data.get_cell_depths()

# Fuerza específica (momentum flux)
rho = 1000  # kg/m³
specific_force = rho * velocities**2 * depths

# Número de Froude
g = 9.81
froude_number = velocities / np.sqrt(g * depths)

# Identificar zonas críticas
supercritical_zones = froude_number > 1.0
high_velocity_zones = velocities > 2.0

# Exportar análisis
analysis_data = {
    'velocity': velocities,
    'froude': froude_number,
    'specific_force': specific_force,
    'supercritical': supercritical_zones.astype(int)
}

ras_data.export_custom_vtk("hydraulic_analysis.vtk", analysis_data)
```

---

## 🔗 Enlaces Útiles

- **Repositorio GitHub**: https://github.com/psu-efd/pyHMT2D
- **Documentación API**: https://psu-efd.github.io/pyHMT2D_API_Web/
- **PyPI Package**: https://pypi.org/project/pyHMT2D/

---

## 📝 Notas para Integración con eFlow

Este documento sirve como referencia para implementar funcionalidades similares en eFlow:

1. **Inspiración para estructura de datos**: La clase `RAS_2D_Data` puede servir como modelo
2. **Exportación VTK**: Implementar funcionalidad similar en nuestro backend Python
3. **Visualización**: Adaptar los métodos de plotting para nuestros componentes React
4. **Automatización**: Considerar implementar control programático de HEC-RAS

---

*Generado automáticamente para el proyecto eFlow - Herramienta de Análisis Hidráulico*
