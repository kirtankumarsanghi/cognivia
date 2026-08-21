import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full font-body-md overflow-x-hidden">
      <Navbar />
      <main className="w-full pt-14 bg-background">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
