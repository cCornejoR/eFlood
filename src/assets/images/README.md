# 🖼️ Gestión de Imágenes - eFlow

Este directorio contiene todas las imágenes utilizadas en la aplicación eFlow, especialmente en la página de inicio (Homepage).

## 📁 Estructura Actual

```
src/assets/images/
├── dem.png            # Modelo Digital de Elevación
├── flood2.png         # Análisis de inundaciones
├── hidrograph.png     # Hidrograma de caudales
├── meandro.png        # Meandros fluviales
├── mesh.png           # Malla computacional
├── working.png        # Trabajo en progreso
├── index.ts           # Configuración centralizada de imágenes
└── README.md          # Este archivo
```

## ✅ **¡CONFIGURACIÓN COMPLETA!**

**Tienes exactamente 6 imágenes perfectas configuradas:**

- ✅ Todas las imágenes están importadas y configuradas
- ✅ Metadatos descriptivos para cada imagen
- ✅ Animaciones de carga individuales
- ✅ Ya no se necesitan imágenes de respaldo

## 🚀 Cómo Agregar Nuevas Imágenes

### Paso 1: Agregar la imagen al directorio

Coloca tu nueva imagen en `src/assets/images/` con un nombre descriptivo:

```
src/assets/images/nueva-imagen.png
```

### Paso 2: Actualizar el archivo index.ts

Abre `src/assets/images/index.ts` y:

1. **Importa la nueva imagen:**

```typescript
import nuevaImagen from './nueva-imagen.png';
```

2. **Agrégala al array assetImages:**

```typescript
export const assetImages = [
  floodImage,
  workingImage,
  nuevaImagen, // ← Agregar aquí
];
```

3. **Opcionalmente, agrega metadatos:**

```typescript
export const imageMetadata = {
  // ... imágenes existentes
  nueva: {
    src: nuevaImagen,
    alt: 'Descripción de la nueva imagen',
    description: 'Descripción detallada de la imagen',
  },
};
```

### Paso 3: Exportar la imagen (opcional)

Si quieres usar la imagen en otros componentes:

```typescript
export { floodImage, workingImage, nuevaImagen };
```

## 🎯 Uso en Componentes

### Homepage (Automático)

Las imágenes se cargan automáticamente en Homepage.tsx usando:

```typescript
import getImages from '@/assets/images';
const images = getImages(6); // Obtiene 6 imágenes
```

### Otros Componentes

Para usar imágenes específicas en otros componentes:

```typescript
import { floodImage, workingImage } from '@/assets/images';
// o
import { imageMetadata } from '@/assets/images';
```

## 📝 Formatos Recomendados

- **Formato:** PNG, JPG, WebP
- **Tamaño:** Optimizado para web (< 1MB)
- **Dimensiones:** Preferiblemente cuadradas o 16:9
- **Nombres:** kebab-case (ej: `analisis-hidraulico.png`)

## 🔄 Sistema de Fallback

Si no tienes suficientes imágenes propias, el sistema automáticamente usa imágenes de Picsum como respaldo. Cuando agregues más imágenes propias, estas reemplazarán automáticamente las imágenes de respaldo.

## 🎨 Optimización

Para mejores resultados:

1. Optimiza las imágenes antes de agregarlas
2. Usa herramientas como TinyPNG o ImageOptim
3. Considera usar WebP para mejor compresión
4. Mantén un estilo visual consistente

## 🚨 Notas Importantes

- Las imágenes se importan estáticamente para mejor rendimiento
- Vite optimiza automáticamente las imágenes durante el build
- Los cambios en `index.ts` requieren reiniciar el servidor de desarrollo
- Las imágenes se muestran en el orden del array `assetImages`
