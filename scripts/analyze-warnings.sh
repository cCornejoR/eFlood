#!/bin/bash

# 🔍 eFlood² Warning Analyzer - Bash Version
# Analiza todo el código del proyecto buscando warnings y los clasifica por criticidad

set -e

# Configuración
OUTPUT_FILE="warnings-report.md"
VERBOSE=false
ONLY_CRITICAL=false
PROJECT_ROOT=$(pwd)
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Contadores
TOTAL_WARNINGS=0
CRITICAL_COUNT=0
HIGH_COUNT=0
MEDIUM_COUNT=0
LOW_COUNT=0

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Función de ayuda
show_help() {
    echo "🔍 eFlood² Warning Analyzer"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -o, --output FILE     Archivo de salida (default: warnings-report.md)"
    echo "  -v, --verbose         Mostrar warnings en tiempo real"
    echo "  -c, --critical-only   Solo mostrar warnings críticos"
    echo "  -h, --help           Mostrar esta ayuda"
    echo ""
}

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--critical-only)
            ONLY_CRITICAL=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Función para clasificar warnings
classify_warning() {
    local message="$1"

    # Patrones críticos
    if echo "$message" | grep -qiE "(error TS[0-9]+|Cannot find module|Module .* not found|Property .* does not exist|Type .* is not assignable|Object is possibly 'null'|Object is possibly 'undefined')"; then
        echo "CRITICAL"
    # Patrones altos
    elif echo "$message" | grep -qiE "(Unexpected any|no-explicit-any|React Hook .* has missing dependencies|exhaustive-deps|no-unused-vars|declared but its value is never read|Fast refresh only works when)"; then
        echo "HIGH"
    # Patrones medios
    elif echo "$message" | grep -qiE "(Missing return type|no-console|prefer-const|no-var|eqeqeq)"; then
        echo "MEDIUM"
    # Patrones bajos
    elif echo "$message" | grep -qiE "(prettier/prettier|Delete.*prettier|Insert.*prettier|trailing-whitespace)"; then
        echo "LOW"
    else
        echo "UNKNOWN"
    fi
}

# Función para agregar warning al reporte
add_warning() {
    local severity="$1"
    local file="$2"
    local line="$3"
    local message="$4"
    local source="$5"

    ((TOTAL_WARNINGS++))

    case "$severity" in
        "CRITICAL") ((CRITICAL_COUNT++)); icon="🔥"; color=$RED ;;
        "HIGH") ((HIGH_COUNT++)); icon="⚠️"; color=$YELLOW ;;
        "MEDIUM") ((MEDIUM_COUNT++)); icon="📝"; color=$CYAN ;;
        "LOW") ((LOW_COUNT++)); icon="💡"; color=$GRAY ;;
        *) icon="❓"; color=$NC ;;
    esac

    if [[ "$ONLY_CRITICAL" == true && "$severity" != "CRITICAL" ]]; then
        return
    fi

    # Agregar al reporte
    cat >> "$OUTPUT_FILE" << EOF

### $icon $severity - $source
**Archivo**: \`$file\`
**Línea**: $line
**Mensaje**: \`$message\`

EOF

    # Mostrar en consola si verbose
    if [[ "$VERBOSE" == true ]]; then
        echo -e "${color}$icon [$severity] $file:$line - $message${NC}"
    fi
}

# Inicializar reporte
echo "🚀 Iniciando análisis de warnings para eFlood²..."
echo ""

cat > "$OUTPUT_FILE" << EOF
# 🔍 Reporte de Warnings - eFlood²

**Generado**: $TIMESTAMP
**Directorio**: $PROJECT_ROOT

## 📊 Resumen Ejecutivo

EOF

# Análisis de TypeScript
echo -e "${YELLOW}🔍 Analizando TypeScript...${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript: Sin errores${NC}"
else
    npm run type-check 2>&1 | while IFS= read -r line; do
        if echo "$line" | grep -qE "^.+\([0-9]+,[0-9]+\):.*"; then
            file=$(echo "$line" | sed -E 's/^(.+)\([0-9]+,[0-9]+\):.*$/\1/')
            line_num=$(echo "$line" | sed -E 's/^.+\(([0-9]+),[0-9]+\):.*$/\1/')
            message=$(echo "$line" | sed -E 's/^.+\([0-9]+,[0-9]+\):\s*(.+)$/\1/')
            severity=$(classify_warning "$message")
            add_warning "$severity" "$file" "$line_num" "$message" "TypeScript"
        fi
    done
    echo -e "${GREEN}✅ TypeScript análisis completado${NC}"
fi

# Análisis de ESLint
echo -e "${YELLOW}🔍 Analizando ESLint...${NC}"
if npm run lint -- --format=compact 2>&1 | while IFS= read -r line; do
    if echo "$line" | grep -qE "^.+:\s*line\s*[0-9]+,\s*col\s*[0-9]+,\s*(error|warning)\s*-\s*.+$"; then
        file=$(echo "$line" | sed -E 's/^(.+):\s*line\s*[0-9]+.*$/\1/')
        line_num=$(echo "$line" | sed -E 's/^.+:\s*line\s*([0-9]+).*$/\1/')
        type=$(echo "$line" | sed -E 's/^.+:\s*line\s*[0-9]+,\s*col\s*[0-9]+,\s*(error|warning)\s*-.*$/\1/')
        message=$(echo "$line" | sed -E 's/^.+:\s*line\s*[0-9]+,\s*col\s*[0-9]+,\s*(error|warning)\s*-\s*(.+)$/\2/')

        if [[ "$type" == "error" ]]; then
            severity="HIGH"
        else
            severity=$(classify_warning "$message")
        fi
        add_warning "$severity" "$file" "$line_num" "$message" "ESLint"
    fi
done; then
    echo -e "${GREEN}✅ ESLint análisis completado${NC}"
fi

# Análisis de Prettier
echo -e "${YELLOW}🔍 Analizando Prettier...${NC}"
if npm run format:check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prettier: Sin problemas de formato${NC}"
else
    npm run format:check 2>&1 | grep "\[warn\]" | while IFS= read -r line; do
        file=$(echo "$line" | sed 's/\[warn\]//' | xargs)
        add_warning "LOW" "$file" "N/A" "Formatting issues" "Prettier"
    done
    echo -e "${GREEN}✅ Prettier análisis completado${NC}"
fi

# Análisis de Python (si está disponible)
if [[ -d "src-python" ]]; then
    echo -e "${YELLOW}🔍 Analizando Python...${NC}"
    if command -v python >/dev/null 2>&1; then
        for file in src-python/*.py; do
            if [[ -f "$file" ]]; then
                if ! python -m py_compile "$file" 2>/dev/null; then
                    add_warning "CRITICAL" "$(basename "$file")" "N/A" "Python syntax error" "Python"
                fi
            fi
        done
        echo -e "${GREEN}✅ Python análisis completado${NC}"
    else
        echo -e "${YELLOW}⚠️ Python no disponible${NC}"
    fi
fi

# Análisis de Rust (si está disponible)
if [[ -d "src-tauri" ]]; then
    echo -e "${YELLOW}🔍 Analizando Rust...${NC}"
    if command -v cargo >/dev/null 2>&1; then
        cd src-tauri
        cargo check 2>&1 | grep -E "(warning|error):" | while IFS= read -r line; do
            if echo "$line" | grep -q "error:"; then
                severity="CRITICAL"
            else
                severity="MEDIUM"
            fi
            add_warning "$severity" "src-tauri" "N/A" "$line" "Rust"
        done
        cd ..
        echo -e "${GREEN}✅ Rust análisis completado${NC}"
    else
        echo -e "${YELLOW}⚠️ Rust no disponible${NC}"
    fi
fi

# Completar reporte con resumen
cat >> "$OUTPUT_FILE" << EOF

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔥 Critical | $CRITICAL_COUNT | Errores que impiden compilación |
| ⚠️ High | $HIGH_COUNT | Problemas importantes de código |
| 📝 Medium | $MEDIUM_COUNT | Mejoras recomendadas |
| 💡 Low | $LOW_COUNT | Problemas menores de formato |

**Total de warnings**: $TOTAL_WARNINGS

## 🎯 Recomendaciones

EOF

if [[ $CRITICAL_COUNT -gt 0 ]]; then
    cat >> "$OUTPUT_FILE" << EOF

### 🔥 ACCIÓN INMEDIATA REQUERIDA
- $CRITICAL_COUNT errores críticos encontrados
- Estos errores impiden la compilación del proyecto
- **Prioridad MÁXIMA**: Resolver antes de cualquier commit

EOF
fi

if [[ $HIGH_COUNT -gt 0 ]]; then
    cat >> "$OUTPUT_FILE" << EOF

### ⚠️ RESOLVER PRONTO
- $HIGH_COUNT problemas importantes encontrados
- Pueden causar bugs o problemas de rendimiento
- **Prioridad ALTA**: Resolver en los próximos commits

EOF
fi

# Mostrar resumen final
echo ""
echo -e "${GREEN}✅ Análisis completado!${NC}"
echo -e "${CYAN}📄 Reporte generado: $OUTPUT_FILE${NC}"
echo -e "📊 Total warnings: $TOTAL_WARNINGS"

if [[ $CRITICAL_COUNT -gt 0 ]]; then
    echo -e "${RED}🔥 ATENCIÓN: $CRITICAL_COUNT errores críticos encontrados!${NC}"
fi

echo ""
echo -e "${YELLOW}Para ver el reporte completo:${NC}"
echo -e "${GRAY}  cat $OUTPUT_FILE${NC}"
