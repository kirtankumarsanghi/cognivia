import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

const steps = [
  { num: '01', title: 'SIGNAL', icon: 'touch_app', desc: 'Student privately signals confusion during a lecture — no public embarrassment.' },
  { num: '02', title: 'DETECT', icon: 'query_stats', desc: 'Cogniva identifies where confusion is concentrated across the class.' },
  { num: '03', title: 'DIAGNOSE', icon: 'psychology', desc: 'The system identifies likely prerequisite gaps causing the confusion.' },
  { num: '04', title: 'CLARIFY', icon: 'auto_awesome', desc: 'AI provides a personalized explanation tailored to each student.' },
  { num: '05', title: 'VERIFY', icon: 'check_circle', desc: 'A quick check confirms the student now understands the concept.' },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="methodology" className="land-section relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#050508] to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="land-container relative z-10">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <span className="section-badge mb-5 inline-flex">
            <span className="material-symbols-outlined text-[13px]">bolt</span>
            How It Works
          </span>
          <h2 className="section-title mt-4">
            Five steps to <span className="text-gradient-gold">clarity</span>
          </h2>
          <p className="section-subtitle mt-4 max-w-xl mx-auto">
            From confusion to understanding in under a minute
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[10%] right-[10%] h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--line-strong), transparent)' }} />

          {steps.map((step, i) => (
            <motion.div key={step.num} variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="step-card relative z-10 flex flex-col items-center"
            >
              <div className="step-number bg-[var(--accent)]">
                <span style={{ fontSize: 12 }}>{step.num}</span>
              </div>
              <div className="w-10 h-10 flex items-center justify-center mb-3" style={{ background: 'var(--fill-ghost)' }}>
                <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--text-dim)' }}>{step.icon}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dimmer)', textAlign: 'center' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
