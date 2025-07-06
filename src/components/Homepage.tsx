import { motion } from 'framer-motion';
import Threads from './ui/Threads';
import BounceCards from './ui/BounceCards';
import { HighlightMultiline } from './ui/highlight-multiline';
import AnimatedSocialLinks from './ui/socials';
import { FlowButton } from './ui/FlowButton';
// import { Play } from 'lucide-react';
import logoImage from '@/assets/logo.svg';
// import footerBackground from '@/assets/footer-background.webp';

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
    <div className='relative w-full h-full bg-[#131414] flex flex-col'>
      {/* FONDO THREADS - Posición absoluta para cubrir toda la pantalla */}
      <div className='absolute inset-0 w-full h-full'>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
          color={[0.3, 0.6, 1.0]} // Color azul suave para las líneas
        />
      </div>

      {/* CONTENIDO PRINCIPAL - Flex-1 para ocupar espacio disponible */}
      <div className='relative z-10 flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8 py-8 overflow-y-auto overflow-x-hidden scrollbar-custom'>
        {/* CONTENIDO PRINCIPAL - Centrado perfecto */}
        <div className='flex flex-col items-center justify-center space-y-8 sm:space-y-12 md:space-y-16'>
          <div className='text-center w-full max-w-6xl mx-auto'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* LOGO Y TÍTULO - Perfectamente alineados */}
              <div className='flex items-center justify-center mb-4 sm:mb-6 md:mb-8'>
                <img
                  src={logoImage}
                  alt='eFlood² Logo'
                  className='h-8 sm:h-12 md:h-16 lg:h-20 w-8 sm:w-12 md:w-16 lg:w-20 object-contain flex-shrink-0'
                />
                <h1 className='text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white eflow-brand ml-1 sm:ml-2 leading-none'>
                  eFlood²
                </h1>
              </div>

              {/* SUBTÍTULO - Responsive y centrado */}
              <div className='text-sm sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-4 sm:mb-6 md:mb-8 max-w-4xl mx-auto leading-relaxed'>
                <div className='text-center'>
                  <HighlightMultiline
                    text='Explora , Analiza y Comprende'
                    inView={true}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                    className='text-white font-medium'
                    words={['Explora', 'Analiza', 'Comprende']}
                  />
                </div>
                <div className='text-center mt-1 sm:mt-2'>
                  <HighlightMultiline
                    text='tus modelos hidráulicos 2D a detalle.'
                    inView={true}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 1.0 }}
                    className='text-white font-medium'
                    words={['hidráulicos']}
                  />
                </div>
              </div>

              {/* BOUNCE CARDS - Responsive y centrado */}
              <div className='flex justify-center mb-4 sm:mb-6 md:mb-8 w-full'>
                <div className='w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl'>
                  <BounceCards
                    className='custom-bounceCards w-full'
                    images={images}
                    containerWidth={Math.min(
                      500,
                      typeof window !== 'undefined'
                        ? window.innerWidth - 80
                        : 500
                    )}
                    containerHeight={150}
                    animationDelay={0.3}
                    animationStagger={0.3}
                    easeType='elastic.out(1, 0.5)'
                    transformStyles={transformStyles}
                    enableHover={false}
                  />
                </div>
              </div>

              {/* BOTÓN PRINCIPAL - Centrado */}
              <div className='flex justify-center'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <FlowButton
                    text='Analizar'
                    onClick={() => onNavigate?.('hecras')}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FOOTER - Siempre al final de la página */}
      <footer className='relative z-20 mt-auto'>
        <div className='text-center text-white/60 space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6'>
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
            className='text-xs sm:text-sm text-white/50'
          >
            &copy; 2025 <span className='eflow-brand'>eFlood²</span> -
            Herramienta de Análisis Hidráulico.
          </motion.p>
        </div>
      </footer>
    </div>
  );
}
