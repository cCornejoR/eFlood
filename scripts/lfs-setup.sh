#!/bin/bash
# 🗂️ Git LFS Setup Script para eFlood²
# Configura Git LFS para manejar archivos grandes

echo "🚀 Configurando Git LFS para eFlood²..."

# Verificar si Git LFS está instalado
if command -v git-lfs >/dev/null 2>&1; then
    LFS_VERSION=$(git lfs version)
    echo "✅ Git LFS encontrado: $LFS_VERSION"
else
    echo "❌ Git LFS no está instalado. Por favor instálalo desde: https://git-lfs.github.io/"
    exit 1
fi

# Verificar si ya está inicializado
if git config --get filter.lfs.process >/dev/null 2>&1; then
    echo "✅ Git LFS ya está configurado en este repositorio"
else
    echo "🔧 Inicializando Git LFS..."
    git lfs install
    echo "✅ Git LFS inicializado"
fi

# Verificar archivos LFS existentes
echo "🔍 Verificando archivos LFS existentes..."
LFS_FILES=$(git lfs ls-files)
if [ -n "$LFS_FILES" ]; then
    echo "📁 Archivos LFS encontrados:"
    echo "$LFS_FILES" | sed 's/^/  - /'
else
    echo "📁 No hay archivos LFS todavía"
fi

# Mostrar configuración actual
echo ""
echo "📋 Configuración actual de Git LFS:"
git lfs track

echo ""
echo "🎯 Tipos de archivos configurados para LFS:"
echo "  🌍 GDAL: *.whl, *.tif, *.tiff, *.shp, *.dem"
echo "  📊 HDF: *.hdf, *.hdf5, *.h5, *.nc"
echo "  🖼️ Imágenes: *.png, *.jpg, *.jpeg, *.webp"
echo "  📦 Comprimidos: *.zip, *.rar, *.7z"
echo "  🔬 Científicos: *.vtk, *.vtu, *.obj"
echo "  📈 Datos: *.xlsx, *.pdf, *.db"

echo ""
echo "💡 Comandos útiles:"
echo "  git lfs track '*.extension'  - Agregar nuevo tipo de archivo"
echo "  git lfs ls-files             - Ver archivos LFS"
echo "  git lfs status               - Estado de archivos LFS"
echo "  git lfs pull                 - Descargar archivos LFS"
echo "  git lfs push origin main     - Subir archivos LFS"

echo ""
echo "✅ Git LFS configurado correctamente!"
echo "🚀 Ahora puedes subir archivos grandes sin problemas"
