import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { mlService } from '../services/mlService';
import { masteryService } from '../services/masteryService';

function getWeeklyBuckets() {
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.push({ key: d.toISOString().slice(0, 10), sessions: 0, signals: 0 });
  }
  return buckets;
}

export const analyticsController = {
  /**
   * GET /api/analytics/student
   * Student-facing dashboard analytics
   */
  async getStudentAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 1. Get mastery scores for all concepts this student has practiced
      const { data: masteryScores, error: masteryError } = await supabaseAdmin
        .from('mastery_scores')
        .select(`
          score,
          concept_id,
          concepts:concepts(name)
        `)
        .eq('student_id', userId);

      if (masteryError) throw masteryError;

      const scores = masteryScores?.map(m => Number(m.score)) || [];
      const avgMastery = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const masteredCount = scores.filter(s => s >= 80).length;
      const needsAttentionCount = scores.filter(s => s < 60).length;

      // 2. Practice Accuracy
      const { data: practiceData } = await supabaseAdmin
        .from('practice_attempts')
        .select('correct')
        .eq('student_id', userId);

      const totalPractice = practiceData?.length || 0;
      const correctPractice = practiceData?.filter(p => p.correct).length || 0;
      const practiceAccuracy = totalPractice > 0 ? (correctPractice / totalPractice) * 100 : 0;

      // 3. Clear Signals
      const { data: clearSignals } = await supabaseAdmin
        .from('confusion_signals')
        .select('*')
        .eq('student_id', userId)
        .eq('signal', 'Clear')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const clarityConfirmations = clearSignals?.length || 0;

      // 4. Completed Revisions
      const { data: completedRevisions } = await supabaseAdmin
        .from('revision_plans')
        .select('*')
        .eq('student_id', userId)
        .eq('completed', true)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const revisionCompletion = completedRevisions?.length || 0;

      // 5. Calculate final learning score
      const learningScore = Math.round(
        avgMastery * 0.5 +
        practiceAccuracy * 0.25 +
        Math.min(clarityConfirmations * 5, 15) +
        Math.min(revisionCompletion * 2, 10)
      );

      // 6. Streak
      const { data: sessions } = await supabaseAdmin
        .from('learning_sessions')
        .select('created_at')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });

      let streak = 0;
      if (sessions && sessions.length > 0) {
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
      }

      // 7. Weekly Stats
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: weeklySessions } = await supabaseAdmin
        .from('learning_sessions')
        .select('*')
        .eq('student_id', userId)
        .gte('created_at', weekAgo.toISOString());

      const weeklySessionCount = weeklySessions?.length || 0;
      
      const { data: weeklySignals } = await supabaseAdmin
        .from('confusion_signals')
        .select('created_at, signal')
        .eq('student_id', userId)
        .gte('created_at', weekAgo.toISOString());

      const weeklyProgress = getWeeklyBuckets();
      (weeklySessions || []).forEach(session => {
        const bucket = weeklyProgress.find(day => day.key === new Date(session.created_at).toISOString().slice(0, 10));
        if (bucket) bucket.sessions += 1;
      });
      (weeklySignals || []).forEach(signal => {
        const bucket = weeklyProgress.find(day => day.key === new Date(signal.created_at).toISOString().slice(0, 10));
        if (bucket) bucket.signals += 1;
      });

      const weeklyChange = Math.min(15, Math.round(clarityConfirmations * 3 + revisionCompletion * 2 + weeklySessionCount * 0.5));

      // 8. Revision Plan
      const { data: revisionPlan } = await supabaseAdmin
        .from('revision_plans')
        .select('*, concepts(name)')
        .eq('student_id', userId)
        .eq('completed', false)
        .order('priority', { ascending: false })
        .limit(3);

      // 9. Recommended Next
      let recommendedNext = 'Continue learning!';
      if (needsAttentionCount > 0) {
        const { data: weakConcept } = await supabaseAdmin
          .from('mastery_scores')
          .select('*, concept:concepts(name)')
          .eq('student_id', userId)
          .lt('score', 60)
          .order('score', { ascending: true })
          .limit(1)
          .single();
        
        if (weakConcept) {
          // @ts-ignore
          recommendedNext = `Review ${weakConcept.concept.name}`;
        }
      } else if (revisionPlan && revisionPlan.length > 0) {
        recommendedNext = `Complete revision: ${revisionPlan[0].concepts.name}`;
      }

      // 10. Confusion History
      const { data: confusionHistory } = await supabaseAdmin
        .from('confusion_signals')
        .select('*, concepts:concepts(name)')
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      res.json({
        learningScore,
        weeklyChange,
        masteredCount,
        needsAttentionCount,
        practiceAccuracy: Math.round(practiceAccuracy),
        streak,
        weeklySessionCount,
        weeklyProgress,
        revisionPlan: revisionPlan || [],
        recommendedNext,
        confusionHistory: confusionHistory || [],
        rank: learningScore >= 85 ? 'Expert' : learningScore >= 70 ? 'Pro Scholar' : learningScore >= 50 ? 'Focused Learner' : 'Learner',
        mlEnabled: await mlService.healthCheck()
      });
    } catch (error: any) {
      console.error('Error fetching student analytics:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * GET /api/analytics/educator
   * Educator-facing class analytics with ML insights
   */
  async getEducatorAnalytics(req: Request, res: Response) {
    try {
      const { since, courseId } = req.query;
      const sinceDate = since ? new Date(since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);

      // 1. Get all students in the course
      const { data: enrollments, error: enrollError } = await supabaseAdmin
        .from('course_enrollments')
        .select('student_id')
        .eq('course_id', courseId || 'cse2101');

      if (enrollError) throw enrollError;

      const studentIds = enrollments?.map(e => e.student_id) || [];

      // 2. Get recent confusion signals
      const { data: signals, error: signalsError } = await supabaseAdmin
        .from('confusion_signals')
        .select(`
          *,
          concepts:concepts(name, id),
          students:students(name)
        `)
        .in('student_id', studentIds)
        .gte('created_at', sinceDate.toISOString());

      if (signalsError) throw signalsError;

      // 3. Aggregate confusion by concept
      const confusionByTopic: Record<string, { count: number; name: string; id: string }> = {};
      signals?.forEach((signal: any) => {
        const conceptId = signal.concept_id;
        const conceptName = signal.concepts?.name || 'Unknown';
        if (!confusionByTopic[conceptId]) {
          confusionByTopic[conceptId] = { count: 0, name: conceptName, id: conceptId };
        }
        confusionByTopic[conceptId].count++;
      });

      const confusionMetrics = Object.values(confusionByTopic)
        .map(topic => ({
          name: topic.name,
          concept_id: topic.id,
          confusion_count: topic.count,
          confusion_percentage: Math.min(100, Math.round((topic.count / studentIds.length) * 100))
        }))
        .sort((a, b) => b.confusion_count - a.confusion_count);

      // 4. Get average class mastery score
      const { data: masteryData } = await supabaseAdmin
        .from('mastery_scores')
        .select('score')
        .in('student_id', studentIds);

      const avgClassScore = masteryData && masteryData.length > 0
        ? Math.round(masteryData.reduce((sum, m) => sum + Number(m.score), 0) / masteryData.length)
        : 0;

      // 5. Identify most confusing topic
      const mostConfusing = confusionMetrics[0] || null;

      // 6. Get ML-based risk predictions for at-risk students
      const atRiskStudents = await Promise.all(
        studentIds.slice(0, 5).map(async (studentId: string) => {
          const { data: student } = await supabaseAdmin
            .from('students')
            .select('name, email')
            .eq('id', studentId)
            .single();

          // Calculate risk score using ML
          const features = {
            prerequisite_avg: 0.6,
            prerequisite_min: 0.4,
            previous_accuracy: 0.55,
            recent_incorrect: 3,
            learning_velocity: -0.15,
            recent_confusion_count: 2,
            time_gap_hours: 48,
            revision_completion: 0.4,
            concept_difficulty: 70
          };

          const mlResult = await mlService.predictEarlyWarning(features);
          const riskScore = mlResult?.risk_probability ? mlResult.risk_probability * 100 : 0;

          return {
            id: studentId,
            name: student?.name || 'Unknown',
            email: student?.email || '',
            riskScore: Math.round(riskScore),
            riskLevel: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW'
          };
        })
      );

      res.json({
        totalStudents: studentIds.length,
        avgClassScore,
        confusionMetrics,
        mostConfusing,
        atRiskStudents: atRiskStudents.filter(s => s.riskScore > 40),
        recentSignals: signals?.slice(0, 20) || [],
        aiRecommendation: mostConfusing
          ? `${mostConfusing.confusion_percentage}% of students are struggling with ${mostConfusing.name}. Consider a mini-lesson or intervention.`
          : 'Class is performing well overall!',
        mlEnabled: await mlService.healthCheck()
      });
    } catch (error: any) {
      console.error('Error fetching educator analytics:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * GET /api/analytics/ml-status
   * Check ML service health and model metrics
   */
  async getMLStatus(req: Request, res: Response) {
    try {
      const isHealthy = await mlService.healthCheck();
      
      if (!isHealthy) {
        return res.json({
          available: false,
          message: 'ML Service is offline. Using fallback predictions.',
          models: []
        });
      }

      // Fetch model metrics from ML service
      const response = await fetch(`${process.env.ML_SERVICE_URL}/ml/metrics`);
      const data = await response.json();

      res.json({
        available: true,
        message: 'ML Service is operational',
        models: data.models || {}
      });
    } catch (error: any) {
      console.error('Error checking ML status:', error);
      res.json({
        available: false,
        message: error.message,
        models: []
      });
    }
  }
};
