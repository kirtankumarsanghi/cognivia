export default function HowItWorks() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6">
            How Cogniva Works
          </h2>
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
            Three simple steps to transform confusion into clarity
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">Signal Confusion</h3>
              <p className="text-on-surface-variant">
                Students discreetly signal when they're confused using a simple button - no public embarrassment, just honest feedback.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">AI Analysis</h3>
              <p className="text-on-surface-variant">
                Our AI analyzes confusion patterns across the class, identifying exactly which concepts need reinforcement.
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-on-surface">Personalized Support</h3>
              <p className="text-on-surface-variant">
                Students get instant AI tutoring, while educators receive actionable insights to adjust their teaching in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
