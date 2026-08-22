import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';

const badges = [
  { id: 1, title: 'First Steps', description: 'Complete your first lesson.', icon: 'star', unlocked: true },
  { id: 2, title: 'Confusion Clearer', description: 'Resolve a confusion signal using the AI Tutor.', icon: 'psychology', unlocked: true },
  { id: 3, title: '7-Day Streak', description: 'Log in and study for 7 days in a row.', icon: 'local_fire_department', unlocked: false },
  { id: 4, title: 'Master of Algorithms', description: 'Score 100% mastery in the Algorithms module.', icon: 'workspace_premium', unlocked: false },
];

export default function Achievements() {
  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp()} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Achievements</h1>
        <p className="text-outline">Track your progress and unlock badges as you learn.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={fadeUpChild}
            className={`card p-6 flex items-start gap-4 ${badge.unlocked ? 'border-primary/30 bg-primary/5' : 'opacity-60 grayscale'}`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${badge.unlocked ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(232,64,64,0.4)]' : 'bg-surface-variant text-outline'}`}>
              <span className="material-symbols-outlined">{badge.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{badge.title}</h3>
              <p className="text-sm text-outline mt-1">{badge.description}</p>
              {!badge.unlocked && (
                <div className="mt-3 text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Locked
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
