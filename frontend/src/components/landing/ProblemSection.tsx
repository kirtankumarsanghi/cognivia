export default function ProblemSection() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-6">
            The Silent Struggle in Every Classroom
          </h2>
          <p className="text-xl text-on-surface-variant max-w-3xl mx-auto">
            Students hesitate to raise hands. Educators can't see who's lost. The gap widens every lecture.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-surface-container">
            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-error">sentiment_dissatisfied</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-on-surface">Students Feel Lost</h3>
            <p className="text-on-surface-variant">
              Fear of judgment prevents students from admitting confusion in real-time, leading to compounding knowledge gaps.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-surface-container">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-warning">visibility_off</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-on-surface">Educators Can't See</h3>
            <p className="text-on-surface-variant">
              Without real-time feedback, instructors miss critical moments when students disengage from the material.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-surface-container">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-tertiary">trending_down</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-on-surface">Learning Suffers</h3>
            <p className="text-on-surface-variant">
              Unaddressed confusion cascades into poor performance, reduced confidence, and disengagement from learning.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
