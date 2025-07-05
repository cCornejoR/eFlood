---
type: "always_apply"
---

# 📐 Arquitectura General - Proyecto eFlow

## Objetivo del proyecto

Aplicación de escritorio hidráulico-GIS con:

- Lectura y análisis de modelos HEC-RAS (.hdf).
- Visualización de terreno, mallas, profundidad y velocidad.
- Generación de ejes y secciones transversales.
- Cálculo hidráulico (tirante, socavación, Froude, etc.).
- Exportación a PDF, Excel y GeoTIFF.
- UI moderna e interactiva.
- Backend científico con Python y procesamiento eficiente con Rust.

---

## Stack Tecnológico

| Capa         | Tecnología                |
|--------------|---------------------------|
| UI/UX        | React + Vite + Tailwind   |
| Desktop App  | Tauri (Rust)              |
| Bridge       | Rust                      |
| Backend      | Python 3.11+              |
| Paquetes     | `uv`                      |

---

## Estructura del Proyecto

eflow-app/
├── frontend/ # React + Tailwind (UI)
├── src-tauri/ # Tauri (Rust bridge)
│ └── src/main.rs
├── backend-python/
│ ├── pyproject.toml # uv + editable install
│ ├── scripts/ # CLI invocados desde Rust
│ └── src/eflow/ # Lógica hidráulica y GIS
│ ├── hdf_reader.py
│ ├── section_tools.py
│ ├── hydraulic_calc.py
│ ├── raster_converter.py
│ └── ai_agent.py # (para futura IA)
