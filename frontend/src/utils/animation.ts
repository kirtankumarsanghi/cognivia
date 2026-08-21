import { animate, stagger } from 'framer-motion';

export const animateHeroText = (selector: string) => {
  return animate(
    selector,
    { opacity: [0, 1], y: [40, 0] },
    { 
      duration: 1.4, 
      delay: stagger(0.1, { startDelay: 0.3 }),
      ease: [0.16, 1, 0.3, 1] 
    }
  );
};
