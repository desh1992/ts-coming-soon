'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
  triggerOnMount?: boolean;
  valueKey?: string | number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
  triggerOnMount = false,
  valueKey,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(triggerOnMount);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (triggerOnMount) {
      setInView(true);
      return;
    }

    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnMount]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -20 }
        : { filter: 'blur(10px)', opacity: 0, y: 20 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(4px)',
        opacity: 0.6,
        y: direction === 'top' ? 8 : -8,
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <motion.p
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap' }}
      initial={{ filter: 'blur(10px)', opacity: 0, y: direction === 'top' ? -20 : 20 }}
      animate={
        inView
          ? {
              filter: ['blur(10px)', 'blur(4px)', 'blur(0px)'],
              opacity: [0, 0.6, 1],
              y: [direction === 'top' ? -20 : 20, direction === 'top' ? 5 : -5, 0],
            }
          : { filter: 'blur(10px)', opacity: 0, y: direction === 'top' ? -20 : 20 }
      }
      transition={{
        duration: stepDuration * 2,
        ease: easing,
      }}
      key={valueKey}
      onAnimationComplete={onAnimationComplete}
    >
      {text}
    </motion.p>
  );
};

export default BlurText;

