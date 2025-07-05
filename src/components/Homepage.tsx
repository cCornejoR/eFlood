import { motion } from 'framer-motion';
import Threads from './ui/Threads';
import BounceCards from './ui/BounceCards';
import { StarBorder } from './ui/star-border';
import { HighlightMultiline } from './ui/highlight-multiline';
import AnimatedSocialLinks from './ui/socials';
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
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original-wordmark.svg',
  },
  {
    name: 'LinkedIn',
    image:
      'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linkedin/linkedin-original.svg',
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
    <div className='min-h-screen relative bg-dark'>
      {/* Fondo con Threads */}
      <div className='fixed inset-0 z-0'>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
          color={[0.3, 0.6, 1.0]} // Color azul suave para las líneas
        />
      </div>

      {/* Contenido principal */}
      <div className='relative z-10'>
        {/* Hero Section - Centrado */}
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-center px-4 sm:px-6 lg:px-8'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className='flex items-center justify-center mb-6'>
                <img
                  src={logoImage}
                  alt='eFlow Logo'
                  className='h-16 md:h-20 w-16 md:w-20 object-contain'
                />
                <h1 className='text-6xl md:text-8xl font-bold text-white eflow-brand ml-4'>
                  eFlow
                </h1>
              </div>
              <div className='text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed'>
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

              {/* BounceCards */}
              <div className='flex justify-center mb-12'>
                <BounceCards
                  className='custom-bounceCards'
                  images={images}
                  containerWidth={600}
                  containerHeight={250}
                  animationDelay={0.3}
                  animationStagger={0.05}
                  easeType='elastic.out(1, 0.5)'
                  transformStyles={transformStyles}
                  enableHover={false}
                />
              </div>

              <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <StarBorder
                    onClick={() => onNavigate?.('hdf')}
                    color='rgba(59, 130, 246, 1)'
                    speed='3s'
                    className='cursor-pointer'
                  >
                    <span className='text-white font-semibold text-lg px-6 py-2'>
                      Análisis HDF
                    </span>
                  </StarBorder>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <StarBorder
                    onClick={() => onNavigate?.('postprocessing')}
                    color='rgba(168, 85, 247, 1)'
                    speed='4s'
                    className='cursor-pointer'
                  >
                    <span className='text-white font-semibold text-lg px-6 py-2'>
                      Postprocesamiento
                    </span>
                  </StarBorder>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <footer className='absolute bottom-0 left-0 right-0 py-6'>
          <div className='text-center text-white/60 space-y-4'>
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
            >
              &copy; 2025 <span className='eflow-brand'>eFlow</span> -
              Herramienta de Análisis Hidráulico.
            </motion.p>
          </div>
        </footer>
      </div>
    </div>
  );
}
