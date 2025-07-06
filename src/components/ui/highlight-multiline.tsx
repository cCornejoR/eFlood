import * as React from 'react';
import {
  motion,
  useInView,
  type HTMLMotionProps,
  type Transition,
  type UseInViewOptions,
} from 'framer-motion';

import { cn } from '@/utils/cn';

type HighlightMultilineProps = HTMLMotionProps<'span'> & {
  text: string;
  inView?: boolean;
  inViewMargin?: UseInViewOptions['margin'];
  inViewOnce?: boolean;
  transition?: Transition;
  words?: string[];
};

function HighlightMultiline({
  ref,
  text,
  className,
  inView = false,
  inViewMargin = '0px',
  transition: _transition = { duration: 2, ease: 'easeInOut' },
  words = [],
  ...props
}: HighlightMultilineProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => localRef.current as HTMLSpanElement);

  const inViewResult = useInView(localRef, {
    once: true,
    margin: inViewMargin,
  });
  const isInView = !inView || inViewResult;

  // Split text into words and highlight specified ones
  const textWords = text.split(' ');
  const wordsToHighlight = words.length > 0 ? words : textWords;

  return (
    <span ref={localRef} className='inline-block'>
      {textWords.map((word, index) => {
        const shouldHighlight = wordsToHighlight.includes(word);

        return (
          <motion.span
            key={index}
            data-slot={shouldHighlight ? 'highlight-text' : 'normal-text'}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.8,
              ...(shouldHighlight && {
                backgroundSize: '0% 100%',
              }),
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    ...(shouldHighlight && {
                      backgroundSize: '100% 100%',
                    }),
                  }
                : undefined
            }
            transition={{
              duration: 0.6,
              ease: 'easeOut',
              delay: index * 0.15, // Carga progresiva palabra por palabra
              ...(shouldHighlight && {
                backgroundSize: {
                  delay: index * 0.15 + 0.3, // El highlight aparece después de la palabra
                  duration: 0.8,
                  ease: 'easeInOut',
                },
              }),
            }}
            style={{
              ...(shouldHighlight && {
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left center',
                lineHeight: '1.4',
              }),
              display: 'inline-block',
            }}
            className={cn(
              shouldHighlight
                ? `relative inline-block px-2 py-1 mx-0.5 my-0.5 rounded-md bg-gradient-to-r from-blue-500/30 to-cyan-400/30 backdrop-blur-sm border border-blue-400/20`
                : `inline-block mx-0.5`,
              className
            )}
            {...props}
          >
            {word}
          </motion.span>
        );
      })}
    </span>
  );
}

export { HighlightMultiline, type HighlightMultilineProps };
