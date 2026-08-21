import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="pricing" className="py-28 md:py-36 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      </div>
      <div className="absolute top-0 left-0 right-0 glow-line" />

      <div ref={ref} className="max-w-3xl mx-auto px-6 md:px-12 text-center relative z-10">
        <motion.div variants={fadeUp} custom={0} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <span className="section-badge text-primary mb-6 inline-flex">
            <span className="material-symbols-outlined text-[14px]">rocket_launch</span>
            Get Started
          </span>
        </motion.div>

        <motion.h2 
          variants={fadeUp} custom={1} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="section-title mt-5"
        >
          Ready to Transform{' '}
          <span className="text-gradient-gold">Your Learning?</span>
        </motion.h2>

        <motion.p 
          variants={fadeUp} custom={2} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="section-subtitle mt-5 max-w-xl mx-auto"
        >
          Join thousands of students and educators using Cogniva to close the lecture gap.
        </motion.p>
        
        <motion.div 
          variants={fadeUp} custom={3} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-on-primary font-headline-md text-base font-semibold hover:shadow-[0_0_40px_rgba(255,186,32,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 text-on-surface font-headline-md text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300">
            Schedule a Demo
          </Link>
        </motion.div>
        
        <motion.p 
          variants={fadeUp} custom={4} initial="hidden" animate={isInView ? 'visible' : 'hidden'}
          className="text-sm text-[#6a7a8d] mt-8 flex items-center justify-center gap-4 flex-wrap"
        >
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary/60">check_circle</span>
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary/60">check_circle</span>
            Free 30-day trial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-primary/60">check_circle</span>
            Cancel anytime
          </span>
        </motion.p>
      </div>
    </section>
  );
}
