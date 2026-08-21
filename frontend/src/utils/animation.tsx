import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

// ── Shared easing ──
export const premiumEase = [0.16, 1, 0.3, 1] as const;

// ── Page transition wrapper ──
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: premiumEase } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

// ── Staggered container ──
export const staggerContainer = (staggerDelay = 0.05) => ({
  hidden: {},
  visible: { transition: { staggerChildren: staggerDelay } },
});

// ── Fade up variant ──
export const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: premiumEase },
  },
});

// ── Fade up child (for stagger containers) ──
export const fadeUpChild = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: premiumEase } },
};

// ── Scale in ──
export const scaleIn = (delay = 0) => ({
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: premiumEase },
  },
});

// ── Animated counter hook ──
export function useAnimatedCounter(target: number, duration = 1.2) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, v => Math.round(v));

  useEffect(() => {
    const controls = animate(motionVal, target, {
      duration,
      ease: premiumEase as unknown as [number, number, number, number],
    });
    return controls.stop;
  }, [target, duration, motionVal]);

  return rounded;
}

// ── Animated counter component ──
export function AnimatedNumber({
  value,
  duration = 1.2,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: premiumEase as unknown as [number, number, number, number],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return controls.stop;
  }, [value, duration, motionVal]);

  return <span ref={ref} className={className}>0</span>;
}

// ── Skeleton shimmer ──
export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={{
        background: 'linear-gradient(90deg, var(--fill-ghost) 25%, var(--fill-solid) 50%, var(--fill-ghost) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: 8,
        ...style,
      }}
      animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
    />
  );
}

// ── Loading skeleton layouts ──
export function DashboardSkeleton() {
  return (
    <div className="page-shell">
      <div className="flex flex-col gap-2 mb-8">
        <Skeleton style={{ width: 120, height: 14 }} />
        <Skeleton style={{ width: 280, height: 36 }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Skeleton style={{ height: 360 }} />
          <Skeleton style={{ height: 200 }} />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Skeleton style={{ height: 300 }} />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton style={{ height: 200 }} />
            <Skeleton style={{ height: 200 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4, style }: { rows?: number; style?: React.CSSProperties }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} style={{ height: 72, ...style }} />
      ))}
    </div>
  );
}

// Re-export motion for convenience
export { motion, AnimatePresence } from 'framer-motion';
