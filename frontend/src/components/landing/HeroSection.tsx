import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import WebGLBackground from './WebGLBackground';
import LiveSignalCard from './LiveSignalCard';

export default function HeroSection() {
  return (
    <section className="relative min-h-[921px] flex items-center pt-24 pb-32 overflow-hidden -mt-14">
      {/* Background Video / Image / Shader */}
      <div className="absolute inset-0 z-0 bg-[#060D1A]">
        <div className="absolute inset-0 z-0">
          <WebGLBackground />
        </div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFFBXM3H-_SwT4ouu_0n2nU4hbc95s5C-6b7U_HrSLTsLtz_1bgOwqn4yCbDrA7jSBNTdlunopOqMay-V9CU1QVfcgySOKjeruyjPS0ODHw0A9rpl6ujvIzEaYIpNDi_1l5jyxkammgF15hYTd-Gb0TeDQpn5HP3rM34C1GAPWSzbjyVkD1fetoAkFzkA9HY4iHfr4XY6GVp2_XTznq6q_CViPyF9uG_BCiIzdpQaH5y0K7NqJwk6X')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060D1A]/80 via-[#060D1A]/40 to-[#060D1A]"></div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto apogee-padding relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
        
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card"
          >
            <span className="w-2 h-2 rounded-full bg-tertiary pulse-glow"></span>
            <span className="font-label-sm text-tertiary tracking-widest uppercase">Live Alpha v2.4</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="font-display-lg text-[56px] leading-[1.1] md:text-[80px] md:leading-[1.05] lg:text-[96px] text-white tracking-[-0.03em]"
          >
            Fix the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">lecture gap</span><br />
            before it happens.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-body-lg text-xl md:text-2xl text-on-surface-variant max-w-2xl"
          >
            Cogniva gives students a discreet way to signal confusion, turning silent struggle into same-day revision priorities.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
          >
            <button className="w-full sm:w-auto px-8 py-5 rounded-full bg-primary text-on-primary font-headline-md text-lg hover:bg-white transition-colors flex items-center justify-center gap-2 group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-5 rounded-full border border-outline/30 text-white font-headline-md text-lg hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
              Watch Demo
              <PlayCircle className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Right Content */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <LiveSignalCard />
        </div>
      </div>
    </section>
  );
}
