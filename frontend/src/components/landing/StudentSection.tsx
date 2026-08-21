import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: 'lock',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Private Signaling',
    description: 'Signal confusion discreetly — only you and your instructor see your signals. Zero judgment.',
  },
  {
    icon: 'psychology',
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    title: 'AI Tutor',
    description: 'Get instant explanations tailored to your learning style and current knowledge level.',
  },
  {
    icon: 'insights',
    iconBg: 'bg-tertiary/10',
    iconColor: 'text-tertiary',
    title: 'Track Progress',
    description: 'Visualize your understanding with concept maps and mastery scores that evolve with you.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function StudentSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="students" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-container-low/30 to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
              <span className="section-badge text-primary mb-6 inline-flex">
                <span className="material-symbols-outlined text-[14px]">school</span>
                For Students
              </span>
            </motion.div>
            <motion.h2 
              variants={fadeUp} custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="section-title mt-5"
            >
              Never Fall{' '}
              <span className="text-gradient-gold">Behind</span> Again
            </motion.h2>
            <motion.p 
              variants={fadeUp} custom={2} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="section-subtitle mt-5 mb-10"
            >
              Get instant help when you need it, without the fear of judgment
            </motion.p>
            
            <div className="space-y-5">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp} custom={i + 3} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
                  className="flex gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors group"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined ${feature.iconColor}`}>{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-on-surface font-headline-md">{feature.title}</h3>
                    <p className="text-[#8a9ab0] text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Visual mockup */}
          <motion.div 
            variants={fadeUp} custom={2} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container-low" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-6">
                {/* Mini UI mockup */}
                <div className="w-full max-w-xs space-y-4">
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[18px]">school</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-[#6a7a8d]">Current Lecture</div>
                      <div className="text-sm text-on-surface font-medium">CS101 — Algorithm Complexity</div>
                    </div>
                  </div>
                  <button className="w-full py-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-[20px]">help</span>
                    I'm Confused
                  </button>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-xs text-[#6a7a8d] mb-2">Cogniva Score</div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-gradient-gold font-headline-xl">72</span>
                      <span className="text-xs text-green-400 mb-1">+5 ↑ today</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-r from-primary to-[#ffba20] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 border border-outline-variant/15 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
