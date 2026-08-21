import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    num: '01',
    icon: 'touch_app',
    title: 'Signal Confusion',
    description: "Students discreetly signal when they're confused using a simple button — no public embarrassment, just honest feedback.",
    color: 'from-primary to-[#ffba20]',
  },
  {
    num: '02',
    icon: 'psychology',
    title: 'AI Analysis',
    description: 'Our AI analyzes confusion patterns across the class, identifying exactly which concepts need reinforcement.',
    color: 'from-secondary to-tertiary',
  },
  {
    num: '03',
    icon: 'auto_awesome',
    title: 'Personalized Support',
    description: 'Students get instant AI tutoring, while educators receive actionable insights to adjust their teaching in real-time.',
    color: 'from-tertiary to-secondary',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="methodology" className="py-28 md:py-36 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-container-low/30 to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <motion.div 
          variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16 md:mb-20"
        >
          <span className="section-badge text-primary mb-6 inline-flex">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            How It Works
          </span>
          <h2 className="section-title mt-5">
            Three steps to{' '}
            <span className="text-gradient-gold">clarity</span>
          </h2>
          <p className="section-subtitle mt-5 max-w-2xl mx-auto">
            From confusion to understanding in under a minute
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-outline-variant/20 to-transparent z-0" />
          
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="step-card group relative z-10"
            >
              <div className={`step-number bg-gradient-to-br ${step.color}`}>
                <span className="text-lg font-bold">{step.num}</span>
              </div>
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px] text-primary/70">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface font-headline-md">{step.title}</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
