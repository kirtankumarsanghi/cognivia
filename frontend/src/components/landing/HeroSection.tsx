import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import WebGLBackground from './WebGLBackground';
import LiveSignalCard from './LiveSignalCard';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-36 pb-28 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 z-0 bg-[#030a14]">
        <div className="absolute inset-0 z-0">
          <WebGLBackground />
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFFBXM3H-_SwT4ouu_0n2nU4hbc95s5C-6b7U_HrSLTsLtz_1bgOwqn4yCbDrA7jSBNTdlunopOqMay-V9CU1QVfcgySOKjeruyjPS0ODHw0A9rpl6ujvIzEaYIpNDi_1l5jyxkammgF15hYTd-Gb0TeDQpn5HP3rM34C1GAPWSzbjyVkD1fetoAkFzkA9HY4iHfr4XY6GVp2_XTznq6q_CViPyF9uG_BCiIzdpQaH5y0K7NqJwk6X')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030a14]/60 via-[#030a14]/30 to-[#051424]" />
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
        
        {/* Left Content */}
        <div className="w-full lg:w-3/5 flex flex-col items-start gap-6">
          <motion.div 
            variants={fadeUp} custom={0} initial="hidden" animate="visible"
            className="section-badge"
          >
            <span className="w-2 h-2 rounded-full bg-primary pulse-glow" />
            <span className="text-primary font-label-sm tracking-[0.15em]">Live Alpha v2.4</span>
          </motion.div>
          
          <motion.h1 
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            className="font-headline-xl text-[44px] leading-[1.08] sm:text-[56px] md:text-[68px] lg:text-[80px] text-white tracking-[-0.03em] font-bold"
          >
            Fix the{' '}
            <span className="text-gradient-gold">lecture gap</span>
            <br className="hidden sm:block" />
            before it happens.
          </motion.h1>
          
          <motion.p 
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            className="font-body-lg text-lg md:text-xl text-[#9aabbf] max-w-xl leading-relaxed"
          >
            Cogniva gives students a discreet way to signal confusion, turning silent struggle into same-day revision priorities.
          </motion.p>
          
          <motion.div 
            variants={fadeUp} custom={3} initial="hidden" animate="visible"
            className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full sm:w-auto"
          >
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-on-primary font-headline-md text-base font-semibold hover:shadow-[0_0_40px_rgba(255,186,32,0.3)] hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 text-white/90 font-headline-md text-base hover:bg-white/5 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
              Watch Demo
              <PlayCircle className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            variants={fadeUp} custom={4} initial="hidden" animate="visible"
            className="flex items-center gap-6 mt-4 text-sm text-[#6a7a8d]"
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary/60">check_circle</span>
              No credit card needed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary/60">check_circle</span>
              Free for students
            </span>
          </motion.div>
        </div>

        {/* Right Content */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full lg:w-2/5 flex justify-center lg:justify-end"
        >
          <LiveSignalCard />
        </motion.div>
      </div>
    </section>
  );
}
