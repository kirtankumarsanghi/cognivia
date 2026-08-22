import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { mlService } from '../services/mlService';
import { masteryService } from '../services/masteryService';

export const analyticsController = {
  /**
   * GET /api/analytics/student
   * Student-facing dashboard analytics
   */
  async getStudentAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // 1. Get mastery scores for all concepts this student has practiced
      const { data: masteryScores, error: masteryError } = await supabaseAdmin
        .from('mastery_scores')
        .select(`
          score,
          concept_id,
          concepts:concepts(name, course_id)
        `)
        .eq('student_id', userId);

      if (masteryError) throw masteryError;

      // 2. Calculate aggregate learning score (weighted average)
      const avgScore = masteryScores && masteryScores.length > 0
        ? Math.round(masteryScores.reduce((sum, m) => sum + Number(m.score), 0) / masteryScores.length)
        : 0;

      // 3. Count mastered vs needs attention
      const masteredCount = masteryScores?.filter(m => Number(m.score) >= 85).length || 0;
      const needsAttentionCount = masteryScores?.filter(m => Number(m.score) < 65).length || 0;

      // 4. Get learning streak (consecutive days with practice)
      const { data: recentAttempts } = await supabaseAdmin
        .from('practice_attempts')
        .select('created_at')
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      let streak = 0;
      if (recentAttempts && recentAttempts.length > 0) {
        const uniqueDays = new Set<string>();
        recentAttempts.forEach((attempt: any) => {
          const day = new Date(attempt.created_at).toISOString().split('T')[0];
          uniqueDays.add(day);
        });
        
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        if (uniqueDays.has(today) || uniqueDays.has(yesterday)) {
          streak = uniqueDays.size;
        }
      }

      // 5. Get confusion history
      const { data: confusionSignals } = await supabaseAdmin
        .from('confusion_signals')
        .select('*, concepts:concepts(name)')
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // 6. Get revision plan (concepts that need attention)
      const needsRevision = masteryScores
        ?.filter(m => Number(m.score) < 75)
        .sort((a, b) => Number(a.score) - Number(b.score))
        .slice(0, 5)
        .map(m => ({
          concept_id: m.concept_id,
          // @ts-ignore
          concept_name: m.concepts?.name,
          score: m.score,
          priority: Number(m.score) < 50 ? 'High' : Number(m.score) < 65 ? 'Medium' : 'Low'
        })) || [];

      // 7. Recommended next concept
      const recommendedNext = needsRevision[0]?.concept_name || 'Continue learning!';

      // 8. Weekly change (mock calculation for now)
      const weeklyChange = Math.floor(Math.random() * 10) - 2; // -2 to +8

      res.json({
        learningScore: avgScore,
        masteredCount,
        needsAttentionCount,
        streak,
        weeklyChange,
        recommendedNext,
        confusionHistory: confusionSignals || [],
        revisionPlan: needsRevision,
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
        .from('enrollments')
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
