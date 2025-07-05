// 🖼️ Configuración centralizada de imágenes
// Este archivo facilita la gestión de todas las imágenes de assets

// Importar todas las imágenes disponibles
import demImage from './dem.png';
import flood2Image from './flood2.png';
import hidrographImage from './hidrograph.png';
import meandroImage from './meandro.png';
import meshImage from './mesh.png';
import workingImage from './working.png';

// Array de todas las imágenes disponibles (6 imágenes perfectas!)
export const assetImages = [
  demImage,
  flood2Image,
  hidrographImage,
  meandroImage,
  meshImage,
  workingImage,
];

// Metadatos de las imágenes (opcional, para futuras funcionalidades)
export const imageMetadata = {
  dem: {
    src: demImage,
    alt: 'Modelo Digital de Elevación',
    description:
      'Representación topográfica del terreno para análisis hidráulico',
  },
  flood2: {
    src: flood2Image,
    alt: 'Análisis de inundaciones',
    description: 'Modelado hidráulico de inundaciones y zonas de riesgo',
  },
  hidrograph: {
    src: hidrographImage,
    alt: 'Hidrograma de caudales',
    description: 'Análisis temporal de caudales y flujos hidráulicos',
  },
  meandro: {
    src: meandroImage,
    alt: 'Meandros fluviales',
    description: 'Estudio de la morfología y dinámica de meandros',
  },
  mesh: {
    src: meshImage,
    alt: 'Malla computacional',
    description: 'Discretización espacial para modelado numérico',
  },
  working: {
    src: workingImage,
    alt: 'Trabajo en progreso',
    description: 'Desarrollo y calibración de modelos hidráulicos',
  },
};

// Función helper para obtener imágenes (ya no necesita fallbacks!)
export const getImages = (count: number = 6) => {
  // ¡Ahora tienes exactamente 6 imágenes perfectas! 🎉
  return assetImages.slice(0, count);
};

// Exportar imágenes individuales para uso directo
export {
  demImage,
  flood2Image,
  hidrographImage,
  meandroImage,
  meshImage,
  workingImage,
};

// Exportar por defecto la función getImages
export default getImages;
