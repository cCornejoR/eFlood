import { motion } from 'framer-motion';
import Threads from './ui/Threads';
import BounceCards from './ui/BounceCards';
import { HighlightMultiline } from './ui/highlight-multiline';
import AnimatedSocialLinks from './ui/socials';
import { Button } from './ui/Button';
import { Play } from 'lucide-react';
import logoImage from '@/assets/logo.svg';

// 🖼️ Importar sistema de gestión de imágenes
import getImages from '@/assets/images';

interface HomepageProps {
  onNavigate?: (tab: string) => void;
}

// 🎯 Obtener 6 imágenes (tus assets + fallbacks si es necesario)
const images = getImages(6);

// 🌐 Configuración de redes sociales
const socialLinks = [
  {
    name: 'GitHub',
    image: 'https://cdn-icons-png.flaticon.com/512/25/25231.png',
  },
  {
    name: 'LinkedIn',
    image: 'https://cdn-icons-png.flaticon.com/512/1384/1384014.png',
  },
  {
    name: 'Docs',
    image: 'https://cdn-icons-png.flaticon.com/512/2991/2991112.png',
  },
  {
    name: 'Contact',
    image: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
  },
];

// Estilos de transformación para las 6 imágenes
const transformStyles = [
  'rotate(8deg) translate(-180px)',
  'rotate(3deg) translate(-90px)',
  'rotate(-2deg) translate(-30px)',
  'rotate(2deg) translate(30px)',
  'rotate(-3deg) translate(90px)',
  'rotate(-8deg) translate(180px)',
];

export default function Homepage({ onNavigate }: HomepageProps) {
  return (
    <div className='homepage-container relative bg-[#131414] w-full h-full'>
      {/* CAPA DE FONDO - Ancho completo SIN márgenes */}
      <div className='background-layer'>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
          color={[0.3, 0.6, 1.0]} // Color azul suave para las líneas
        />
      </div>

      {/* CAPA DE CONTENIDO - CON márgenes apropiados */}
      <div className='content-layer homepage-content'>
        {/* Hero Section - Centrado automático */}
        <div className='homepage-hero'>
          <div className='text-center w-full max-w-6xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className='flex items-center justify-center mb-6 sm:mb-8 lg:mb-10'>
                <img
                  src={logoImage}
                  alt='eFlood² Logo'
                  className='h-12 sm:h-16 md:h-20 lg:h-24 w-12 sm:w-16 md:w-20 lg:w-24 object-contain'
                />
                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white eflow-brand'>
                  eFlood²
                </h1>
              </div>
              <div className='text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-6 sm:mb-8 lg:mb-10 max-w-4xl mx-auto leading-relaxed'>
                <div className='text-center'>
                  <HighlightMultiline
                    text='Explora , Analiza y Comprende'
                    inView={true}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    className='text-white font-medium'
                    words={['Explora', 'Analiza', 'Comprende']}
                  />
                </div>
                <div className='text-center mt-2'>
                  <HighlightMultiline
                    text='tus modelos hidráulicos 2D a detalle.'
                    inView={true}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 1.0 }}
                    className='text-white font-medium'
                    words={['hidráulicos']}
                  />
                </div>
              </div>

              {/* BounceCards - Responsive */}
              <div className='flex justify-center mb-8 sm:mb-10 lg:mb-12 w-full'>
                <div className='w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl'>
                  <BounceCards
                    className='custom-bounceCards w-full'
                    images={images}
                    containerWidth={Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 64 : 600)}
                    containerHeight={200}
                    animationDelay={0.3}
                    animationStagger={0.3}
                    easeType='elastic.out(1, 0.5)'
                    transformStyles={transformStyles}
                    enableHover={false}
                  />
                </div>
              </div>

              <div className='flex justify-center'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Button
                    onClick={() => onNavigate?.('hecras')}
                    variant='default'
                    size='lg'
                    className='text-lg font-semibold'
                  >
                    <Play className='w-5 h-5' />
                    Analizar
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer - Con espaciado correcto y márgenes apropiados */}
        <footer className='homepage-footer mt-12 py-8 bg-[#131414]/90 backdrop-blur-sm border-t border-white/10'>
          <div className='text-center text-white/60 space-y-6 max-w-6xl mx-auto'>
            {/* Redes Sociales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
              className='flex justify-center'
            >
              <AnimatedSocialLinks socials={socialLinks} />
            </motion.div>

            {/* Copyright */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className='text-sm text-white/50 pb-4'
            >
              &copy; 2025 <span className='eflow-brand'>eFlood²</span> -
              Herramienta de Análisis Hidráulico.
            </motion.p>
          </div>
        </footer>
      </div>
    </div>
  );
}
