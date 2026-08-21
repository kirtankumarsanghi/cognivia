export default function EducatorSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 md:order-1">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-secondary/20 to-tertiary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[120px] text-secondary/40">analytics</span>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full mb-6">
              <span className="text-secondary font-semibold">For Educators</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6">
              See Every Student's Journey
            </h2>
            <p className="text-xl text-on-surface-variant mb-8">
              Data-driven insights to improve your teaching and reach every learner
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">heat_pump</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">Confusion Heatmaps</h3>
                  <p className="text-on-surface-variant">
                    See exactly which concepts are causing the most confusion, in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-warning">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">AI Recommendations</h3>
                  <p className="text-on-surface-variant">
                    Get actionable suggestions on what to review and how to adjust your teaching.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-success">monitoring</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-on-surface">Class Analytics</h3>
                  <p className="text-on-surface-variant">
                    Track class-wide progress and identify students who need extra support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
