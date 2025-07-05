import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BounceCardsProps {
  className?: string;
  images: string[];
  containerWidth: number;
  containerHeight: number;
  animationDelay: number;
  animationStagger: number;
  easeType: string;
  transformStyles: string[];
  enableHover?: boolean;
}

const BounceCards: React.FC<BounceCardsProps> = ({
  className = '',
  images,
  containerWidth,
  containerHeight,
  animationDelay,
  animationStagger,
  easeType,
  transformStyles,
  enableHover = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = useState<boolean[]>(
    new Array(images.length).fill(false)
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  // Función para parsear el easeType string para framer-motion
  const parseEase = (easeString: string) => {
    if (easeString.includes('elastic.out')) {
      // Para elastic.out usamos 'backOut' que es similar
      return 'backOut';
    }
    return 'easeOut';
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {images.map((image, index) => {
        const isHovered = hoveredIndex === index;
        const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;

        return (
          <motion.div
            key={index}
            className='absolute cursor-pointer'
            style={{
              width: '120px',
              height: '120px',
            }}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              opacity: isOtherHovered ? 0.3 : 1,
              scale: isHovered ? 1.4 : isOtherHovered ? 0.8 : 1,
              x: 0,
              y: 0,
              transform: transformStyles[index] || '',
              zIndex: isHovered ? 20 : isOtherHovered ? 1 : 10,
            }}
            transition={{
              delay: animationDelay + index * animationStagger,
              duration: isHovered || isOtherHovered ? 0.3 : 0.6,
              ease: parseEase(easeType),
            }}
            onHoverStart={() => enableHover && setHoveredIndex(index)}
            onHoverEnd={() => enableHover && setHoveredIndex(null)}
            whileHover={
              enableHover
                ? {
                    transition: { duration: 0.3 },
                  }
                : {}
            }
          >
            <div className='w-full h-full rounded-xl overflow-hidden shadow-lg border-2 border-white/20 backdrop-blur-sm relative'>
              {/* Loading placeholder */}
              <AnimatePresence>
                {!loadedImages[index] && (
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm flex items-center justify-center'
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full'
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Image with load animation */}
              <motion.img
                src={image}
                alt={`Imagen hidráulica ${index + 1}`}
                className='w-full h-full object-cover'
                loading='lazy'
                onLoad={() => handleImageLoad(index)}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{
                  opacity: loadedImages[index] ? 1 : 0,
                  scale: loadedImages[index] ? 1 : 1.1,
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: loadedImages[index] ? 0.1 : 0,
                }}
              />

              {/* Overlay effect on load */}
              <AnimatePresence>
                {loadedImages[index] && (
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-transparent pointer-events-none'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BounceCards;
