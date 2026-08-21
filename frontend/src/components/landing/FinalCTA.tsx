import { ArrowRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10">
      <div className="max-w-4xl mx-auto px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-on-surface mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl md:text-2xl text-on-surface-variant mb-12 max-w-2xl mx-auto">
          Join thousands of students and educators using Cogniva to close the lecture gap.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-8 py-5 rounded-full bg-primary text-on-primary font-headline-md text-lg hover:bg-primary-fixed-dim transition-colors flex items-center justify-center gap-2 group">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-8 py-5 rounded-full border border-outline text-on-surface font-headline-md text-lg hover:bg-surface-container transition-colors">
            Schedule a Demo
          </button>
        </div>
        
        <p className="text-sm text-on-surface-variant mt-8">
          No credit card required • Free 30-day trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
