# 🔧 Build Pipeline Documentation

## Overview

Este documento describe el pipeline de build de eFlood², diseñado para garantizar que solo código que puede compilarse correctamente llegue al repositorio y se distribuya como ejecutable.

## 🎯 Filosofía del Pipeline

**Principio fundamental**: Si el pre-commit pasa, las GitHub Actions también deben pasar.

### Verificaciones Críticas vs No Críticas

#### ✅ Verificaciones CRÍTICAS (que rompen el build)
- **Frontend Build**: `npm run build` debe completarse sin errores
- **TypeScript Compilation Errors**: Errores de compilación (no warnings)
- **Rust Build**: `cargo check` debe pasar sin errores
- **Python Syntax**: Sintaxis básica de Python debe ser válida

#### ⚠️ Verificaciones NO CRÍTICAS (permitidas como warnings)
- Warnings de TypeScript
- Problemas de linting (ESLint)
- Formato de código (Prettier)
- Warnings de Rust que no impiden compilación

## 🔒 Pre-commit Configuration

### Archivo: `.pre-commit-config.yaml`

```yaml
# Solo verificaciones críticas que impiden el build
repos:
  - repo: local
    hooks:
      # Build del frontend - CRÍTICO
      - id: frontend-build-check
        name: "🔥 CRITICAL: Frontend Build Test"
        entry: npm run build

      # Errores de TypeScript - CRÍTICO
      - id: typescript-errors-only
        name: "🔥 CRITICAL: TypeScript Compilation Errors"
        entry: # Detecta solo errores, no warnings

      # Build de Rust - CRÍTICO
      - id: rust-build-check
        name: "🔥 CRITICAL: Rust Build Check"
        entry: cargo check

      # Sintaxis de Python - CRÍTICO
      - id: python-syntax-check
        name: "🔥 CRITICAL: Python Syntax Check"
        entry: python -m py_compile
```

### Características del Pre-commit

- **Rápido**: Solo verificaciones esenciales (~30-60 segundos)
- **Preciso**: Solo falla por errores que impiden el build
- **Consistente**: Mismas verificaciones que GitHub Actions
- **Opcional para herramientas**: Python/Rust solo si están disponibles

## 🚀 GitHub Actions Workflows

### 1. Build Verification (`.github/workflows/ci.yml`)

**Trigger**: Push/PR a `main` o `develop`

**Propósito**: Verificar que el código puede compilarse

```yaml
jobs:
  critical-build-check:
    # Ejecuta exactamente las mismas verificaciones que pre-commit
    - Frontend Build Test
    - TypeScript Compilation Errors
    - Rust Build Check
    - Python Syntax Check
```

### 2. PR Validation (`.github/workflows/pr-validation.yml`)

**Trigger**: Pull Requests

**Propósito**: Validar PRs y generar reporte detallado

- Ejecuta verificaciones críticas
- Genera reporte en markdown
- Comenta en el PR con resultados
- Solo falla por errores críticos

### 3. Release Build (`.github/workflows/release.yml`)

**Trigger**: Tags `v*` o manual

**Propósito**: Construir y distribuir ejecutables

```yaml
jobs:
  pre-build-validation:
    # Mismas verificaciones críticas

  build-tauri:
    # Build para Windows, macOS, Linux
    # Genera ejecutables .msi, .dmg, .AppImage

  release-complete:
    # Publica release en GitHub
```

## 🔄 Flujo de Trabajo Completo

### 1. Desarrollo Local

```bash
# Desarrollar código
git add .

# Pre-commit ejecuta automáticamente verificaciones críticas
git commit -m "feat: nueva funcionalidad"

# Si pre-commit pasa, el código está listo para push
git push origin feature-branch
```

### 2. Pull Request

```bash
# Crear PR
gh pr create --title "Nueva funcionalidad"

# GitHub Actions ejecuta:
# - Build Verification (mismas verificaciones que pre-commit)
# - PR Validation (genera reporte detallado)
```

### 3. Merge a Main

```bash
# Después del merge, GitHub Actions ejecuta:
# - Build Verification en main
```

### 4. Release

```bash
# Crear tag de release
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions ejecuta:
# - Pre-build validation
# - Build para múltiples plataformas
# - Publicación de executables
```

## 🛠️ Comandos Útiles

### Ejecutar verificaciones localmente

```bash
# Ejecutar pre-commit manualmente
pre-commit run --all-files

# Solo build del frontend
npm run build

# Solo verificación de TypeScript
npm run type-check

# Solo verificación de Rust
cd src-tauri && cargo check

# Solo verificación de Python
cd src-python && python -m py_compile *.py
```

### Solucionar problemas comunes

```bash
# Errores de TypeScript
npm run type-check  # Ver errores específicos

# Errores de build
npm run build       # Ver errores de compilación

# Errores de Rust
cd src-tauri && cargo check --verbose

# Errores de Python
cd src-python && python -m py_compile *.py
```

## 📊 Métricas y Rendimiento

### Tiempos Esperados

- **Pre-commit**: 30-60 segundos
- **Build Verification**: 2-3 minutos
- **PR Validation**: 3-4 minutos
- **Release Build**: 15-20 minutos (múltiples plataformas)

### Tasa de Éxito Esperada

- Si pre-commit pasa → GitHub Actions debe pasar (>95%)
- Fallos solo por diferencias de entorno o dependencias

## 🔧 Mantenimiento

### Actualizar verificaciones

1. Modificar `.pre-commit-config.yaml`
2. Actualizar workflows de GitHub Actions correspondientes
3. Mantener consistencia entre ambos
4. Probar localmente antes de hacer commit

### Agregar nueva verificación crítica

1. Identificar si realmente impide el build
2. Agregar a pre-commit primero
3. Agregar a GitHub Actions
4. Documentar en este archivo

---

**Recuerda**: El objetivo es tener un pipeline eficiente donde el pre-commit sea un filtro confiable que garantice que el código siempre pueda buildear correctamente.
