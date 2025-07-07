#!/bin/bash
# Script para probar pre-commit localmente
# Solo detecta errores críticos que rompen la compilación

echo "🔍 Probando configuración de pre-commit (solo errores críticos)..."
echo ""

ERROR_COUNT=0

# Test Frontend TypeScript
echo "🎨 Verificando TypeScript..."
if npm run type-check >/dev/null 2>&1; then
    echo "✅ TypeScript: Sin errores críticos"
else
    echo "❌ TypeScript: Errores de compilación encontrados"
    ((ERROR_COUNT++))
fi

# Test Python Syntax
echo "🐍 Verificando sintaxis Python..."
if [ -d "src-python" ]; then
    cd src-python
    PYTHON_FILES=$(find . -name "*.py" | head -20)
    if [ -n "$PYTHON_FILES" ]; then
        if python -m py_compile $PYTHON_FILES >/dev/null 2>&1; then
            echo "✅ Python: Sin errores de sintaxis"
        else
            echo "❌ Python: Errores de sintaxis encontrados"
            ((ERROR_COUNT++))
        fi
    else
        echo "⚠️ Python: No se encontraron archivos .py"
    fi
    cd ..
else
    echo "⚠️ Python: Directorio src-python no encontrado"
fi

# Test Rust Compilation
echo "🦀 Verificando compilación Rust..."
if [ -d "src-tauri" ]; then
    cd src-tauri
    if cargo check --quiet --message-format=short >/dev/null 2>&1; then
        echo "✅ Rust: Sin errores de compilación"
    else
        echo "❌ Rust: Errores de compilación encontrados"
        ((ERROR_COUNT++))
    fi
    cd ..
else
    echo "⚠️ Rust: Directorio src-tauri no encontrado"
fi

echo ""
echo "📊 Resumen:"

if [ $ERROR_COUNT -eq 0 ]; then
    echo "🎉 ¡Todas las verificaciones críticas pasaron!"
    echo "✅ El commit puede proceder sin problemas"
    echo ""
    echo "💡 Para análisis completo de warnings: npm run analyze:warnings"
    exit 0
else
    echo "❌ Se encontraron $ERROR_COUNT errores críticos"
    echo "🚫 El commit será bloqueado hasta que se corrijan"
    echo ""
    echo "💡 Solo se verifican errores que rompen la compilación"
    echo "💡 Los warnings no bloquean el commit"
    exit 1
fi
