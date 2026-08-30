import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, fadeUpChild } from '../../utils/animation';
import { useApi } from '../../hooks/useApi';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface AchievementStats {
  total: number;
  unlocked: number;
  earnedPoints: number;
  rank: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400'
};

const RARITY_BG: Record<string, string> = {
  common: 'bg-gray-500/20 border-gray-500/30',
  rare: 'bg-blue-500/20 border-blue-500/30',
  epic: 'bg-purple-500/20 border-purple-500/30',
  legendary: 'bg-amber-500/20 border-amber-500/30'
};

export default function Achievements() {
  const api = useApi();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/achievements');
      if (response) {
        setAchievements(response.achievements || []);
        setStats(response.stats || null);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : filter === 'unlocked'
    ? achievements.filter(a => a.unlocked)
    : achievements.filter(a => a.category === filter);

  const categories = ['all', 'unlocked', 'learning', 'practice', 'ml_insights', 'mastery', 'engagement'];
  const categoryLabels: Record<string, string> = {
    all: 'All',
    unlocked: 'Unlocked',
    learning: 'Learning',
    practice: 'Practice',
    ml_insights: 'ML Insights',
    mastery: 'Mastery',
    engagement: 'Engagement'
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-outline">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
    >
      {/* Header with Stats */}
      <motion.div variants={fadeUp()} className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Achievements</h1>
            <p className="text-outline">Track your progress and unlock badges as you learn.</p>
          </div>
          {stats && (
            <div className="flex gap-4">
              <div className="card p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-primary">{stats.unlocked}</div>
                <div className="text-xs text-outline uppercase tracking-wide">Unlocked</div>
              </div>
              <div className="card p-4 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-primary">{stats.earnedPoints}</div>
                <div className="text-xs text-outline uppercase tracking-wide">Points</div>
              </div>
              <div className="card p-4 text-center min-w-[120px]">
                <div className="text-lg font-bold text-primary">{stats.rank}</div>
                <div className="text-xs text-outline uppercase tracking-wide">Rank</div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {stats && (
          <div className="card p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold">Overall Progress</span>
              <span className="text-sm text-outline">{stats.unlocked} / {stats.total}</span>
            </div>
            <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={fadeUp(0.1)} className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                filter === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-variant text-outline hover:bg-surface-variant/80'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Achievement Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            variants={fadeUpChild}
            custom={index}
            className={`card p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] ${
              achievement.unlocked 
                ? `border-primary/30 ${RARITY_BG[achievement.rarity]}` 
                : 'opacity-60 grayscale'
            }`}
          >
            {/* Icon and Rarity */}
            <div className="flex items-start justify-between">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                achievement.unlocked 
                  ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(232,64,64,0.5)]' 
                  : 'bg-surface-variant text-outline'
              }`}>
                <span className="material-symbols-outlined">{achievement.icon}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${RARITY_COLORS[achievement.rarity]}`}>
                {achievement.rarity}
              </div>
            </div>

            {/* Title and Description */}
            <div>
              <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
              <p className="text-sm text-outline leading-relaxed">{achievement.description}</p>
            </div>

            {/* Points and Status */}
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
                <span className="text-sm font-bold text-amber-400">{achievement.points} pts</span>
              </div>
              {achievement.unlocked ? (
                <div className="flex items-center gap-1 text-xs text-primary font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Unlocked
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-outline font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Locked
                </div>
              )}
            </div>

            {/* Unlock Date */}
            {achievement.unlocked && achievement.unlocked_at && (
              <div className="text-[10px] text-outline/60 text-center">
                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-outline">
          <span className="material-symbols-outlined text-5xl mb-3 opacity-30">workspace_premium</span>
          <p>No achievements in this category yet.</p>
        </div>
      )}
    </motion.div>
  );
}
