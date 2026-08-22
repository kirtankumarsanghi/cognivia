import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

interface ProgressTrackerProps {
  weeklySessionCount?: number;
  practiceAccuracy?: number;
  masteredCount?: number;
  streak?: number;
  weeklyChange?: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function ProgressTracker({ 
  weeklySessionCount = 0, 
  practiceAccuracy = 0, 
  masteredCount = 0,
  streak = 0,
  weeklyChange = 0
}: ProgressTrackerProps) {

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-[#3DD68C]';
    if (accuracy >= 60) return 'text-[#E8A634]';
    return 'text-[#E84040]';
  };
  
  const getAccuracyBgColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-[#3DD68C]';
    if (accuracy >= 60) return 'bg-[#E8A634]';
    return 'bg-[#E84040]';
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Legendary! 🔥';
    if (streak >= 14) return 'On fire! 🔥';
    if (streak >= 7) return 'Great streak!';
    if (streak > 0) return 'Keep going!';
    return 'Start your streak!';
  };

  const isImproving = weeklyChange >= 0;
  const changeColor = isImproving ? 'text-[#3DD68C]' : 'text-[#E84040]';
  const changeBg = isImproving ? 'bg-[#3DD68C]/10' : 'bg-[#E84040]/10';
  const changeIcon = isImproving ? 'arrow_upward' : 'arrow_downward';
  const changeText = isImproving ? 'Improving' : 'Declining';

  return (
    <div className="bg-surface-container rounded-2xl p-6 shadow-md border border-outline-variant/10 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-label-md text-label-md text-outline uppercase tracking-widest">
            Weekly Progress
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Sessions */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col p-4 bg-surface rounded-xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline uppercase">Sessions</span>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="font-headline-lg text-headline-lg text-on-surface leading-none">
                    <AnimatedNumber value={weeklySessionCount} />
                  </span>
                  <span className="font-body-sm text-on-surface-variant mb-1">/ wk</span>
                </div>
                <div className="mt-3 h-1.5 bg-surface-bright rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((weeklySessionCount / 10) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Accuracy */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col p-4 bg-surface rounded-xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-16 h-16 ${getAccuracyBgColor(practiceAccuracy)}/5 rounded-full blur-xl group-hover:${getAccuracyBgColor(practiceAccuracy)}/10 transition-colors`} />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-full ${getAccuracyBgColor(practiceAccuracy)}/10 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${getAccuracyColor(practiceAccuracy)} text-[18px]`}>target</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline uppercase">Accuracy</span>
              </div>
              <div>
                <span className={`font-headline-lg text-headline-lg leading-none ${getAccuracyColor(practiceAccuracy)}`}>
                  <AnimatedNumber value={practiceAccuracy} />%
                </span>
                <div className="mt-3 h-1.5 bg-surface-bright rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${getAccuracyBgColor(practiceAccuracy)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${practiceAccuracy}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mastered Concepts */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col p-4 bg-surface rounded-xl border border-outline-variant/5 hover:border-outline-variant/20 transition-colors group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#E8A634]/5 rounded-full blur-xl group-hover:bg-[#E8A634]/10 transition-colors" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#E8A634]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#E8A634] text-[18px]">workspace_premium</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline uppercase">Mastered</span>
              </div>
              <div>
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none">
                  <AnimatedNumber value={masteredCount} />
                </span>
                <div className="mt-3 flex items-center gap-1">
                  <span className="font-body-xs text-on-surface-variant">Concepts completed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-orange-400 text-[20px]">local_fire_department</span>
                <span className="font-label-sm text-label-sm text-orange-300 uppercase">Streak</span>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <span className="font-headline-lg text-headline-lg text-orange-300 leading-none">
                    <AnimatedNumber value={streak} />
                  </span>
                  <span className="font-body-sm text-orange-400/80 mb-1">days</span>
                </div>
                <p className="font-body-xs text-orange-400/80 mt-2">
                  {getStreakMessage(streak)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Summary Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-6 border-t border-outline-variant/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">insights</span>
          <span className="font-body-sm">vs. last week</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className={`material-symbols-outlined ${changeColor} text-[16px]`}>{changeIcon}</span>
            <span className={`font-label-sm ${changeColor}`}>{weeklyChange > 0 ? '+' : ''}{weeklyChange}%</span>
          </div>
          <div className={`px-3 py-1 ${changeBg} rounded-full`}>
            <span className={`font-label-sm ${changeColor} uppercase tracking-wider`}>{changeText}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
