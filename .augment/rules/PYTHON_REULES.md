---
type: "always_apply"
---

# 🐍 Reglas de Desarrollo para Backend Python - eFlow

## 🛠️ Estructura

- Toda la lógica hidráulica, GIS y lectura va en `src/eflow/`.
- Scripts en `scripts/` solo ejecutan funciones de `eflow`.

## 📦 Manejo de Paquetes

- Usa `uv` para entornos virtuales y dependencias.
- doc: https://docs.astral.sh/uv/guides/projects/#next-steps
- Instala módulo editable:
  ```bash
  uv venv && source .venv/bin/activate
  uv pip install -e ./src
🧪 Buenas prácticas
Tipado obligatorio: def cortar_seccion(path: str) -> dict

Módulos organizados por dominio: hdf_reader, hydraulic_calc, etc.

Manejo de errores con try/except, y devuelve errores en JSON:

json
Copiar
Editar
{"status": "error", "message": "Archivo no encontrado"}
📤 Comunicación con Rust
Los scripts deben:

Leer sys.argv como entrada.

Llamar funciones del módulo.

Imprimir salida como json.dumps(...).

rust
Copiar
Editar

---

## ⚙️ `RUST_BRIDGE_RULES.md`

```markdown
# 🦀 Reglas para el bridge Rust (Tauri)

## Estructura

- Toda la lógica está en Python, Rust solo actúa como puente.
- Usa `std::process::Command` para ejecutar scripts CLI de Python.

## Comando base sugerido

```rust
#[command]
fn ejecutar_script(script: String, args: Vec<String>) -> String {
    let output = std::process::Command::new("python")
        .arg(format!("backend-python/scripts/{}", script))
        .args(&args)
        .output()
        .expect("Error al ejecutar script");
    String::from_utf8_lossy(&output.stdout).to_string()
}
Seguridad
Nunca incluir lógica de procesamiento en Rust.

Sanitizar entradas si provienen de UI.

yaml
Copiar
Editar

---

## 🎨 `FRONTEND_RULES.md`

```markdown
# 🎨 Reglas de Desarrollo para Frontend - React UI

## 📦 Stack

- React + Vite
- TailwindCSS
- Plotly.js o Recharts
- Konva.js (para secciones estilo AutoCAD)
- Modo dark/light + diseño visual tipo ingeniería

## 🧱 Componentes esperados

- `<Sidebar />` — Navegación modular
- `<SectionViewer />` — Visualización de secciones
- `<Malla3DViewer />` — Visualización VTK.js (futuro)
- `<ResultsPlot />` — Plot hidráulico (tirante, Froude)
- `<FileExplorer />` — Selector de archivos `.hdf`, `.tif`, `.shp`

## 🎯 Buenas prácticas

- Componentes desacoplados y reutilizables.
- Toda interacción UI ↔ backend usa `@tauri-apps/api/tauri.invoke`.
- Canvas para dibujo libre y edición de ejes/secciones.
