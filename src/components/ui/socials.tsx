// component.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Social = {
  name: string;
  image: string;
};

interface AnimatedSocialLinksProps
  extends React.HTMLAttributes<HTMLDivElement> {
  socials: Social[];
}

const AnimatedSocialLinks = React.forwardRef<
  HTMLDivElement,
  AnimatedSocialLinksProps
>(({ socials, className: _className, ...props }, ref) => {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [cliked, setCliked] = useState<boolean>(false);

  const animation = {
    scale: cliked ? [1, 1.3, 1] : 1,
    transition: { duration: 0.3 },
  };

  useEffect(() => {
    const handleClick = () => {
      setCliked(true);
      setTimeout(() => {
        setCliked(false);
      }, 200);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [cliked]);

  return (
    <div
      ref={ref}
      className='flex items-center justify-center gap-0'
      {...props}
    >
      {socials.map((social, index) => (
        <div
          className={`relative cursor-pointer px-5 py-2 transition-opacity duration-200 ${
            hoveredSocial && hoveredSocial !== social.name
              ? 'opacity-50'
              : 'opacity-100'
          }`}
          key={index}
          onMouseEnter={() => {
            setHoveredSocial(social.name);
            setRotation(Math.random() * 20 - 10);
          }}
          onMouseLeave={() => setHoveredSocial(null)}
          onClick={() => {
            setCliked(true);
          }}
        >
          <span className='block text-sm text-white/70 hover:text-white transition-colors duration-200'>
            {social.name}
          </span>
          <AnimatePresence>
            {hoveredSocial === social.name && (
              <motion.div
                className='absolute bottom-0 left-0 right-0 flex h-full w-full items-center justify-center'
                animate={animation}
              >
                <motion.img
                  key={social.name}
                  src={social.image}
                  alt={social.name}
                  className='size-12 rounded-lg shadow-lg border border-white/20 bg-white/10 backdrop-blur-sm p-1'
                  initial={{
                    y: -30,
                    rotate: rotation,
                    opacity: 0,
                    filter: 'blur(2px)',
                    scale: 0.8,
                  }}
                  animate={{
                    y: -40,
                    opacity: 1,
                    filter: 'blur(0px)',
                    scale: 1,
                  }}
                  exit={{
                    y: -30,
                    opacity: 0,
                    filter: 'blur(2px)',
                    scale: 0.8,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
});

AnimatedSocialLinks.displayName = 'AnimatedSocialLinks';

export default AnimatedSocialLinks;
