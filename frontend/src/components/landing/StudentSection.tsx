export default function StudentSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-primary font-semibold">For Students</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6">
              Never Fall Behind Again
            </h2>
            <p className="text-xl text-on-surface-variant mb-8">
              Get instant help when you need it, without the fear of judgment
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">lock</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">Private Signaling</h3>
                  <p className="text-on-surface-variant">
                    Signal confusion discreetly - only you and your instructor see your signals.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">psychology</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">AI Tutor</h3>
                  <p className="text-on-surface-variant">
                    Get instant explanations tailored to your learning style and knowledge level.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">insights</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">Track Progress</h3>
                  <p className="text-on-surface-variant">
                    Visualize your understanding with concept maps and mastery scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[120px] text-primary/40">school</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
