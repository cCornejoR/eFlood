# 🗂️ Git LFS Setup Script para eFlood²
# Configura Git LFS para manejar archivos grandes

Write-Host "🚀 Configurando Git LFS para eFlood²..." -ForegroundColor Cyan

# Verificar si Git LFS está instalado
try {
    $lfsVersion = git lfs version
    Write-Host "✅ Git LFS encontrado: $lfsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git LFS no está instalado. Por favor instálalo desde: https://git-lfs.github.io/" -ForegroundColor Red
    exit 1
}

# Verificar si ya está inicializado
$lfsConfig = git config --get filter.lfs.process 2>$null
if ($lfsConfig) {
    Write-Host "✅ Git LFS ya está configurado en este repositorio" -ForegroundColor Green
} else {
    Write-Host "🔧 Inicializando Git LFS..." -ForegroundColor Yellow
    git lfs install
    Write-Host "✅ Git LFS inicializado" -ForegroundColor Green
}

# Verificar archivos LFS existentes
Write-Host "🔍 Verificando archivos LFS existentes..." -ForegroundColor Yellow
$lfsFiles = git lfs ls-files
if ($lfsFiles) {
    Write-Host "📁 Archivos LFS encontrados:" -ForegroundColor Green
    $lfsFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
} else {
    Write-Host "📁 No hay archivos LFS todavía" -ForegroundColor Gray
}

# Mostrar configuración actual
Write-Host "`n📋 Configuración actual de Git LFS:" -ForegroundColor Cyan
git lfs track

Write-Host "`n🎯 Tipos de archivos configurados para LFS:" -ForegroundColor Cyan
Write-Host "  🌍 GDAL: *.whl, *.tif, *.tiff, *.shp, *.dem" -ForegroundColor Green
Write-Host "  📊 HDF: *.hdf, *.hdf5, *.h5, *.nc" -ForegroundColor Green
Write-Host "  🖼️ Imágenes: *.png, *.jpg, *.jpeg, *.webp" -ForegroundColor Green
Write-Host "  📦 Comprimidos: *.zip, *.rar, *.7z" -ForegroundColor Green
Write-Host "  🔬 Científicos: *.vtk, *.vtu, *.obj" -ForegroundColor Green
Write-Host "  📈 Datos: *.xlsx, *.pdf, *.db" -ForegroundColor Green

Write-Host "`n💡 Comandos útiles:" -ForegroundColor Cyan
Write-Host "  git lfs track '*.extension'  - Agregar nuevo tipo de archivo" -ForegroundColor Gray
Write-Host "  git lfs ls-files             - Ver archivos LFS" -ForegroundColor Gray
Write-Host "  git lfs status               - Estado de archivos LFS" -ForegroundColor Gray
Write-Host "  git lfs pull                 - Descargar archivos LFS" -ForegroundColor Gray
Write-Host "  git lfs push origin main     - Subir archivos LFS" -ForegroundColor Gray

Write-Host "`n✅ Git LFS configurado correctamente!" -ForegroundColor Green
Write-Host "🚀 Ahora puedes subir archivos grandes sin problemas" -ForegroundColor Cyan
