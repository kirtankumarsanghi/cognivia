import Navbar from './Navbar';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import HowItWorks from './HowItWorks';
import StudentSection from './StudentSection';
import EducatorSection from './EducatorSection';
import FinalCTA from './FinalCTA';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <HowItWorks />
      <StudentSection />
      <EducatorSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
