import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

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
        background: 'radial-gradient(circle at 50% 20%, rgba(232, 64, 64, 0.05) 0%, transparent 60%)'
      }} />
      
      {/* Ambient floating elements */}
      <motion.div 
        className="absolute top-[20%] left-[10%] rounded-full pointer-events-none opacity-50"
        style={{
          width: 80, height: 80,
          border: '1px solid rgba(232, 64, 64, 0.15)',
        }}
        animate={{ rotate: -180, scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      <motion.div 
        className="absolute bottom-[20%] right-[10%] rounded-full pointer-events-none opacity-50"
        style={{
          width: 120, height: 120,
          border: '1px dashed rgba(232, 64, 64, 0.2)',
        }}
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div ref={ref} className="land-container relative z-10 pt-20">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center max-w-3xl mx-auto mb-24 relative"
        >
          {/* Subtle glowing ring behind title */}
          <div className="absolute left-1/2 -top-10 -translate-x-1/2 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <h2 className="section-title relative z-10" style={{ fontSize: 'clamp(32px, 4vw, 56px)', lineHeight: 1.1 }}>
            Most confusion<br/>never gets <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(232,64,64,0.3)]">reported.</span>
          </h2>
        </motion.div>

        {/* Student Quotes */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-28 relative">
          {/* Connecting line behind cards on desktop */}
          <div className="hidden md:block absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[rgba(232,64,64,0.2)] to-transparent -translate-y-1/2 z-0" />
          
          {quotes.map((q, i) => (
            <motion.div key={i} variants={fadeUp} custom={i + 1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative z-10 text-center p-8 rounded-2xl flex flex-col justify-center group overflow-hidden transition-all duration-300 cursor-default" 
              style={{ 
                background: 'rgba(255, 255, 255, 0.015)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 20px 40px -20px rgba(0,0,0,0.7)'
              }}
            >
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(232,64,64,0.06)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Highlight border on top */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(232,64,64,0.3)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <Quote className="w-8 h-8 text-[rgba(232,64,64,0.3)] mx-auto mb-6 group-hover:text-[rgba(232,64,64,0.7)] group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_10px_rgba(232,64,64,0)] group-hover:drop-shadow-[0_0_10px_rgba(232,64,64,0.4)]" />
              
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 24 }} className="relative z-10 font-light">
                {q.text}
              </p>
              
              <div className="relative z-10 flex items-center justify-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-px bg-gradient-to-r from-transparent to-[rgba(232,64,64,0.6)]" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dimmer)' }} className="font-semibold text-[rgba(255,255,255,0.6)] group-hover:text-[rgba(255,255,255,0.9)] transition-colors">
                  {q.role}
                </span>
                <div className="w-8 h-px bg-gradient-to-l from-transparent to-[rgba(232,64,64,0.6)]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transition statement */}
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-block p-px rounded-full bg-gradient-to-r from-[rgba(232,64,64,0.1)] via-[rgba(232,64,64,0.4)] to-[rgba(232,64,64,0.1)] mb-8">
            <div className="px-6 py-2 rounded-full bg-[#030303]">
              <span className="text-[10px] uppercase tracking-widest text-[rgba(232,64,64,0.9)] font-mono font-bold">The Solution</span>
            </div>
          </div>
          
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(18px, 1.5vw, 24px)', lineHeight: 1.7, color: 'var(--text-dim)' }} className="font-light">
            Cogniva turns those silent signals into <span className="font-medium text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">actionable learning intelligence.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
