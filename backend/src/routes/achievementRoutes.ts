/**
 * Achievement Routes - Gamification system
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * GET /api/achievements
 * Get all available achievements with student's unlock status
 */
router.get('/api/achievements', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .order('points', { ascending: false });

    if (achievementsError) throw achievementsError;

    // Get student's unlocked achievements
    const { data: unlocked, error: unlockedError } = await supabaseAdmin
      .from('student_achievements')
      .select('achievement_id, unlocked_at')
      .eq('student_id', userId);

    if (unlockedError) throw unlockedError;

    const unlockedIds = new Set(unlocked?.map(u => u.achievement_id) || []);
    const unlockedMap = new Map(unlocked?.map(u => [u.achievement_id, u.unlocked_at]) || []);

    // Combine data
    const achievements = allAchievements?.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlocked_at: unlockedMap.get(achievement.id) || null,
      progress: null // TODO: Calculate progress for partially completed achievements
    })) || [];

    // Calculate total points
    const totalPoints = unlocked?.length || 0;
    const earnedPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    res.json({
      achievements,
      stats: {
        total: allAchievements?.length || 0,
        unlocked: unlocked?.length || 0,
        earnedPoints,
        rank: calculateRank(earnedPoints)
      }
    });
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/achievements/unlocked
 * Get only student's unlocked achievements
 */
router.get('/api/achievements/unlocked', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const { data, error } = await supabaseAdmin
      .from('student_achievements')
      .select('*, achievement:achievements(*)')
      .eq('student_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching unlocked achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/achievements/check
 * Check if student has unlocked any new achievements
 * This is called after significant actions (completing lessons, practice, etc.)
 */
router.post('/api/achievements/check', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const newlyUnlocked: any[] = [];

    // Check various achievement criteria
    
    // 1. First Steps - Complete first lesson
    const { count: lessonCount } = await supabaseAdmin
      .from('learning_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('session_type', 'lesson');

    if (lessonCount && lessonCount >= 1) {
      const unlocked = await tryUnlockAchievement(userId, 'first_lesson');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 2. Confusion Clearer - Use AI Tutor once
    const { count: tutorCount } = await supabaseAdmin
      .from('ai_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId);

    if (tutorCount && tutorCount >= 1) {
      const unlocked = await tryUnlockAchievement(userId, 'confusion_clearer');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 3. 7-Day Streak
    const streak = await calculateStreak(userId);
    if (streak >= 7) {
      const unlocked = await tryUnlockAchievement(userId, 'streak_7');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 4. Master of Algorithms - 100% mastery
    const { data: perfectMastery } = await supabaseAdmin
      .from('mastery_scores')
      .select('score')
      .eq('student_id', userId)
      .eq('score', 100)
      .limit(1)
      .single();

    if (perfectMastery) {
      const unlocked = await tryUnlockAchievement(userId, 'mastery_100');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 5. Practice Champion - 50 practice questions
    const { count: practiceCount } = await supabaseAdmin
      .from('practice_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId);

    if (practiceCount && practiceCount >= 50) {
      const unlocked = await tryUnlockAchievement(userId, 'practice_champion');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 6. Perfect Practice - 100% on 10 sessions
    // (Simplified - would need session grouping logic)
    
    // 7. Revision Master - Complete 20 revisions
    const { count: revisionCount } = await supabaseAdmin
      .from('revision_plans')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('completed', true);

    if (revisionCount && revisionCount >= 20) {
      const unlocked = await tryUnlockAchievement(userId, 'revision_master');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 8. Confusion Conquered - Resolve 10 confusion signals
    const { count: clearCount } = await supabaseAdmin
      .from('confusion_signals')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)
      .eq('signal', 'Clear');

    if (clearCount && clearCount >= 10) {
      const unlocked = await tryUnlockAchievement(userId, 'confusion_conquered');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 9. Knowledge Seeker - 25 tutor questions
    if (tutorCount && tutorCount >= 25) {
      const unlocked = await tryUnlockAchievement(userId, 'knowledge_seeker');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    // 10. Proficient Scholar - 80%+ mastery on 10 concepts
    const { count: highMasteryCount } = await supabaseAdmin
      .from('mastery_scores')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', userId)
      .gte('score', 80);

    if (highMasteryCount && highMasteryCount >= 10) {
      const unlocked = await tryUnlockAchievement(userId, 'mastery_80_plus');
      if (unlocked) newlyUnlocked.push(unlocked);
    }

    res.json({
      success: true,
      newlyUnlocked,
      count: newlyUnlocked.length
    });
  } catch (error: any) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/achievements/leaderboard
 * Get achievement leaderboard (top students by points)
 */
router.get('/api/achievements/leaderboard', requireAuth, async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    // Get all student achievements with points
    const { data: achievements, error } = await supabaseAdmin
      .from('student_achievements')
      .select(`
        student_id,
        profiles:student_id(name, avatar),
        achievements:achievement_id(points)
      `);

    if (error) throw error;

    // Aggregate points per student
    const pointsMap = new Map<string, { student_id: string; name: string; avatar: string; points: number; count: number }>();
    
    achievements?.forEach((item: any) => {
      const studentId = item.student_id;
      const points = item.achievements?.points || 0;
      const name = item.profiles?.name || 'Unknown';
      const avatar = item.profiles?.avatar;

      if (pointsMap.has(studentId)) {
        const current = pointsMap.get(studentId)!;
        current.points += points;
        current.count += 1;
      } else {
        pointsMap.set(studentId, {
          student_id: studentId,
          name,
          avatar,
          points,
          count: 1
        });
      }
    });

    // Sort by points and get top N
    const leaderboard = Array.from(pointsMap.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, Number(limit))
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        rankLabel: calculateRank(entry.points)
      }));

    res.json(leaderboard);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Try to unlock an achievement
 */
async function tryUnlockAchievement(userId: string, achievementCode: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_and_unlock_achievement', {
      p_student_id: userId,
      p_achievement_code: achievementCode
    });

    if (error) throw error;

    if (data === true) {
      // Get achievement details
      const { data: achievement } = await supabaseAdmin
        .from('achievements')
        .select('*')
        .eq('code', achievementCode)
        .single();

      return achievement;
    }

    return null;
  } catch (error) {
    console.error(`Error unlocking achievement ${achievementCode}:`, error);
    return null;
  }
}

/**
 * Helper: Calculate learning streak
 */
async function calculateStreak(userId: string): Promise<number> {
  const { data: sessions } = await supabaseAdmin
    .from('learning_sessions')
    .select('created_at')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  if (!sessions || sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentDate = new Date(today);
  const sessionDates = new Set(
    sessions.map(s => {
      const d = new Date(s.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  while (sessionDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * Helper: Calculate rank based on points
 */
function calculateRank(points: number): string {
  if (points >= 500) return 'Legendary Scholar';
  if (points >= 300) return 'Master';
  if (points >= 150) return 'Expert';
  if (points >= 75) return 'Advanced';
  if (points >= 30) return 'Intermediate';
  return 'Beginner';
}

export default router;
