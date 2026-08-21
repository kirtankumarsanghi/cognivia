import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease } }),
};

const quotes = [
  { text: '"I thought everyone understood."', role: 'Student, CS101' },
  { text: '"I\'ll figure it out later."', role: 'Student, Math 201' },
  { text: '"I didn\'t want to interrupt."', role: 'Student, Physics 301' },
];

export default function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="product" className="land-section relative overflow-hidden" style={{ background: '#030303' }}>
      {/* Background Glows & Orbital Elements */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 30% 0%, rgba(120, 20, 20, 0.1) 0%, transparent 50%)'
      }} />
      
      {/* Small floating red orbital ring & dot */}
      <motion.div 
        className="absolute top-12 left-[15%] rounded-full pointer-events-none"
        style={{
          width: 40, height: 40,
          border: '1px solid rgba(232, 64, 64, 0.4)',
          boxShadow: '0 0 15px rgba(232, 64, 64, 0.2)'
        }}
        animate={{ rotate: 360, y: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute top-4 left-[12%] rounded-full pointer-events-none bg-[#e84040]"
        style={{ width: 6, height: 6, boxShadow: '0 0 10px 2px rgba(232, 64, 64, 0.8)' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div ref={ref} className="land-container relative z-10 pt-16">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="section-title">
            Most confusion<br/>never gets <span className="text-gradient-gold">reported.</span>
          </h2>
        </motion.div>

        {/* Student Quotes */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-24">
          {quotes.map((q, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              className="text-center py-10 px-8 rounded-xl flex flex-col justify-center" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
              }}
            >
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontStyle: 'italic', color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 20 }}>
                {q.text}
              </p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }}>
                — {q.role}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Transition statement */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center max-w-2xl mx-auto"
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(16px, 1.2vw, 20px)', lineHeight: 1.7, color: 'var(--text-dim)' }}>
            Cogniva turns those silent signals into <span style={{ color: 'var(--accent)' }}>actionable learning intelligence.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
