import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const cards = [
  {
    icon: 'sentiment_dissatisfied',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    title: 'Students Feel Lost',
    description: 'Fear of judgment prevents students from admitting confusion in real-time, leading to compounding knowledge gaps.',
    stat: '73%',
    statLabel: 'stay silent',
  },
  {
    icon: 'visibility_off',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    title: "Educators Can't See",
    description: 'Without real-time feedback, instructors miss critical moments when students disengage from the material.',
    stat: '4.2x',
    statLabel: 'more dropout',
  },
  {
    icon: 'trending_down',
    iconBg: 'bg-blue-400/10',
    iconColor: 'text-blue-300',
    title: 'Learning Suffers',
    description: 'Unaddressed confusion cascades into poor performance, reduced confidence, and disengagement from learning.',
    stat: '38%',
    statLabel: 'grade drop',
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

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="product" className="py-28 md:py-36 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-surface-container-low/50 to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <motion.div 
          variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16 md:mb-20"
        >
          <span className="section-badge text-primary mb-6 inline-flex">
            <span className="material-symbols-outlined text-[14px]">error</span>
            The Problem
          </span>
          <h2 className="section-title mt-5">
            The Silent Struggle in{' '}
            <span className="text-gradient-gold">Every Classroom</span>
          </h2>
          <p className="section-subtitle mt-5 max-w-2xl mx-auto">
            Students hesitate to raise hands. Educators can't see who's lost. The gap widens every lecture.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="feature-card card-glow group"
            >
              <div className={`feature-icon ${card.iconBg}`}>
                <span className={`material-symbols-outlined text-[28px] ${card.iconColor}`}>{card.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface font-headline-md">{card.title}</h3>
              <p className="text-[#8a9ab0] text-sm leading-relaxed mb-6">{card.description}</p>
              <div className="pt-5 border-t border-outline-variant/15">
                <span className="text-3xl font-bold text-gradient-gold font-headline-xl">{card.stat}</span>
                <span className="text-xs text-[#6a7a8d] ml-2 uppercase tracking-wider">{card.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
