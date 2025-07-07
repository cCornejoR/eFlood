# 🗂️ Guía de Git LFS para eFlood²

## ¿Qué es Git LFS?

**Git Large File Storage (LFS)** es una extensión de Git que permite manejar archivos grandes de manera eficiente. En lugar de almacenar los archivos grandes directamente en el repositorio Git, LFS los almacena en un servidor separado y mantiene solo punteros en el repositorio.

## ¿Por qué usar Git LFS en eFlood²?

eFlood² maneja varios tipos de archivos grandes:
- 🌍 **Archivos GDAL**: Wheels de Python, archivos GeoTIFF, shapefiles
- 📊 **Datos HDF5**: Resultados de HEC-RAS, datasets científicos
- 🖼️ **Imágenes**: Screenshots, diagramas, texturas de alta resolución
- 📦 **Paquetes**: Instaladores, archivos comprimidos
- 🔬 **Modelos 3D**: Archivos VTK, meshes, visualizaciones

## 🚀 Configuración Inicial

### 1. Verificar instalación
```bash
git lfs version
```

### 2. Configurar automáticamente
```bash
# Windows
npm run lfs:setup

# Linux/Mac
npm run lfs:setup:bash
```

### 3. Configuración manual
```bash
git lfs install
```

## 📁 Archivos Configurados para LFS

El archivo `.gitattributes` ya está configurado para estos tipos:

### 🌍 Archivos GDAL y GIS
- `*.whl` - Python wheels de GDAL
- `*.tif, *.tiff` - Archivos GeoTIFF
- `*.shp, *.shx, *.dbf` - Shapefiles
- `*.dem, *.asc` - Modelos digitales de elevación

### 📊 Archivos HDF y Científicos
- `*.hdf, *.hdf5, *.h5` - Archivos HDF5
- `*.nc, *.netcdf` - NetCDF
- `*.dat, *.bin, *.raw` - Datos binarios

### 🖼️ Imágenes y Multimedia
- `*.png, *.jpg, *.jpeg, *.webp` - Imágenes
- `*.mp4, *.avi, *.mov` - Videos

### 📦 Archivos Comprimidos
- `*.zip, *.rar, *.7z` - Archivos comprimidos
- `*.exe, *.msi, *.dmg` - Instaladores

### 🔬 Archivos Científicos
- `*.vtk, *.vtu, *.vtp` - Archivos VTK
- `*.obj, *.fbx, *.blend` - Modelos 3D

## 💻 Comandos Útiles

### Comandos básicos
```bash
# Ver archivos LFS
npm run lfs:files
# o
git lfs ls-files

# Estado de LFS
npm run lfs:status
# o
git lfs status

# Descargar archivos LFS
npm run lfs:pull
# o
git lfs pull

# Subir archivos LFS
npm run lfs:push
# o
git lfs push origin main
```

### Agregar nuevos tipos de archivo
```bash
# Agregar un nuevo patrón
git lfs track "*.nueva_extension"

# Ver patrones configurados
git lfs track
```

### Migrar archivos existentes
```bash
# Migrar archivos ya committeados
git lfs migrate import --include="*.extension"
```

## 🔄 Workflow con LFS

### 1. Agregar archivos grandes
```bash
# Los archivos se agregan normalmente
git add archivo_grande.hdf
git commit -m "Agregar dataset HDF5"
```

### 2. Push con LFS
```bash
# Push normal - LFS se encarga automáticamente
git push origin main
```

### 3. Clone con LFS
```bash
# Clone normal descarga punteros
git clone https://github.com/usuario/repo.git

# Descargar archivos LFS
cd repo
git lfs pull
```

## 🚨 Solución de Problemas

### Error: "git-lfs not found"
```bash
# Instalar Git LFS
# Windows: Descargar desde https://git-lfs.github.io/
# Mac: brew install git-lfs
# Ubuntu: sudo apt install git-lfs

# Luego configurar
git lfs install
```

### Archivos no se suben a LFS
```bash
# Verificar que el patrón esté en .gitattributes
git lfs track

# Forzar re-track si es necesario
git add .gitattributes
git add archivo_grande.ext --force
```

### Descargar archivos LFS faltantes
```bash
# Descargar todos los archivos LFS
git lfs pull

# Descargar archivos específicos
git lfs pull --include="*.hdf"
```

## 📊 Límites y Consideraciones

### GitHub LFS
- **Gratis**: 1 GB de almacenamiento, 1 GB de ancho de banda/mes
- **Pro**: 50 GB de almacenamiento, 50 GB de ancho de banda/mes
- **Packs adicionales**: Disponibles por suscripción

### Mejores Prácticas
1. **No versionar archivos temporales grandes**
2. **Usar .gitignore para archivos generados**
3. **Comprimir archivos cuando sea posible**
4. **Documentar archivos LFS en README**

## 🔗 Enlaces Útiles

- [Git LFS Official](https://git-lfs.github.io/)
- [GitHub LFS Documentation](https://docs.github.com/en/repositories/working-with-files/managing-large-files)
- [Git LFS Tutorial](https://github.com/git-lfs/git-lfs/wiki/Tutorial)

## 📞 Soporte

Si tienes problemas con Git LFS:
1. Revisa esta guía
2. Ejecuta `npm run lfs:setup` para reconfigurar
3. Consulta los logs: `git lfs logs last`
4. Abre un issue en el repositorio
