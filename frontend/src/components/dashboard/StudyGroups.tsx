import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';

const mockPeers = [
  { id: 1, name: 'Alex Johnson', strength: 'Binary Search Trees', match: 95 },
  { id: 2, name: 'Sarah Smith', strength: 'Big O Notation', match: 88 },
  { id: 3, name: 'Michael Chen', strength: 'Dynamic Programming', match: 82 },
];

export default function StudyGroups() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Peer Study Hub</h1>
        <p className="text-outline">Connect with peers who have mastered concepts you are currently learning.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeUpChild} className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">handshake</span>
            <h2 className="text-xl font-bold">Suggested Matches</h2>
          </div>
          
          <div className="space-y-4">
            {mockPeers.map((peer) => (
              <div key={peer.id} className="p-4 rounded-xl border border-outline-variant/20 bg-surface flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {peer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold">{peer.name}</h3>
                    <p className="text-sm text-outline">Mastered: {peer.strength}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-400">{peer.match}% Match</div>
                  <button className="text-sm text-primary hover:underline mt-1">Connect</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUpChild} className="card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">group_add</span>
            <h2 className="text-xl font-bold">Active Sessions</h2>
          </div>
          <p className="text-sm text-outline mb-6">Join live study groups happening right now.</p>
          
          <div className="p-5 rounded-xl border border-primary/20 bg-surface">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">Algorithms Prep</h3>
              <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-sm text-outline mb-4">Focusing on Graph Traversal and BFS/DFS implementation details.</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface z-20"></div>
                <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface z-10"></div>
                <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface z-0 flex items-center justify-center text-xs">+3</div>
              </div>
              <button className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(232,64,64,0.3)]">
                Join Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
