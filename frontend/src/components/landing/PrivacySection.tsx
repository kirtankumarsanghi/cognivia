import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

const points = [
  { icon: 'shield', title: 'Anonymous by default', desc: 'Confusion signals are never tied to individual identities in public views.' },
  { icon: 'encrypted', title: 'End-to-end encrypted', desc: 'All student data is encrypted at rest and in transit. Your data stays yours.' },
  { icon: 'visibility_off', title: 'No surveillance', desc: 'Cogniva tracks understanding, not behavior. We never monitor screens or activity.' },
];

export default function PrivacySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="land-section relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#050508] to-background" />
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="land-container relative z-10 max-w-3xl">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-14"
        >
          <h2 className="section-title">
            Your confusion is <span className="text-gradient-gold">private.</span>
          </h2>
          <p className="section-subtitle mt-4 max-w-lg mx-auto">
            We built Cogniva on a simple principle: students should feel safe to be honest about what they don't understand.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p, i) => (
            <motion.div key={p.title} variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="text-center py-6 px-4"
            >
              <span className="material-symbols-outlined text-[28px] mb-4 block" style={{ color: 'var(--text-dimmer)' }}>{p.icon}</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{p.title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-dimmer)' }}>{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
