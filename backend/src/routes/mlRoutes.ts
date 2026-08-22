/**
 * ML Routes - API endpoints for ML features
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { mlService } from '../services/mlService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * POST /api/ml/student-profile
 * Get student's cognitive learning profile using K-Means clustering
 */
router.post('/api/ml/student-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { features } = req.body;

    // If no features provided, calculate from student data
    let profileFeatures = features;
    if (!profileFeatures) {
      profileFeatures = await calculateStudentFeatures(userId);
    }

    const result = await mlService.getStudentProfile(profileFeatures);
    
    if (result) {
      // Store ML insight
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'profile',
        model_name: result.model || 'kmeans_student_profile',
        result: result,
        confidence: result.confidence
      });

      // Check for ML Explorer achievement
      await checkMLAchievement(userId, 'ml_profile');
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error getting student profile:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ml/early-warning
 * Predict early warning risk for struggling students
 */
router.post('/api/ml/early-warning', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { features } = req.body;

    const result = await mlService.predictEarlyWarning(features);
    
    if (result) {
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'early_warning',
        model_name: result.model || 'early_warning',
        result: result,
        confidence: result.risk_probability
      });

      await checkMLAchievement(userId, 'ml_early_warning');
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error predicting early warning:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ml/recommendation
 * Get next-best action recommendation
 */
router.post('/api/ml/recommendation', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { current_concept, history } = req.body;

    const result = await mlService.getRecommendation(userId, current_concept, history || []);
    
    if (result) {
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'recommendation',
        model_name: 'recommendation_engine',
        result: result,
        confidence: result.confidence
      });
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ml/concept-difficulty
 * Calculate adaptive difficulty for a concept
 */
router.post('/api/ml/concept-difficulty', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { concept_id, student_features } = req.body;

    const result = await mlService.calculateConceptDifficulty({
      concept_id,
      student_features
    });
    
    if (result) {
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'concept_difficulty',
        model_name: 'IRT_difficulty',
        result: result,
        confidence: 0.85
      });
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error calculating concept difficulty:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ml/learning-risk
 * Calculate knowledge decay risk
 */
router.post('/api/ml/learning-risk', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { model_outputs, history, current_features } = req.body;

    const result = await mlService.calculateLearningRisk(model_outputs);
    
    if (result) {
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'learning_risk',
        model_name: 'exponential_decay',
        result: result,
        confidence: result.risk_probability
      });
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error calculating learning risk:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ml/nlp-classifier
 * Classify confusion text using NLP
 */
router.post('/api/ml/nlp-classifier', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { text } = req.body;

    const result = await mlService.classifyConfusion(text);
    
    if (result) {
      await supabaseAdmin.from('ml_insights').insert({
        student_id: userId,
        insight_type: 'nlp',
        model_name: 'BERT_classifier',
        result: result,
        confidence: result.confidence || 0.8
      });
    }

    res.json(result || { error: 'ML service unavailable' });
  } catch (error: any) {
    console.error('Error classifying text:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ml/insights/history
 * Get student's ML insights history
 */
router.get('/api/ml/insights/history', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { limit = 20, type } = req.query;

    let query = supabaseAdmin
      .from('ml_insights')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (type) {
      query = query.eq('insight_type', type);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    res.json(data || []);
  } catch (error: any) {
    console.error('Error fetching ML insights history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Calculate student features from database
 */
async function calculateStudentFeatures(userId: string) {
  // Get practice attempts
  const { data: attempts } = await supabaseAdmin
    .from('practice_attempts')
    .select('correct, created_at')
    .eq('student_id', userId);

  const totalAttempts = attempts?.length || 0;
  const correctAttempts = attempts?.filter(a => a.correct).length || 0;
  const avgAccuracy = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

  // Get confusion signals
  const { data: signals } = await supabaseAdmin
    .from('confusion_signals')
    .select('signal, created_at')
    .eq('student_id', userId);

  const confusedCount = signals?.filter(s => s.signal === 'Confused').length || 0;
  const confusionFreq = signals && signals.length > 0 ? confusedCount / signals.length : 0;

  // Get sessions
  const { data: sessions } = await supabaseAdmin
    .from('learning_sessions')
    .select('created_at, duration_minutes, session_type')
    .eq('student_id', userId);

  const tutorSessions = sessions?.filter(s => s.session_type === 'tutor').length || 0;
  const sessionFreq = sessions?.length || 0;

  // Get mastery progression
  const { data: mastery } = await supabaseAdmin
    .from('mastery_scores')
    .select('score')
    .eq('student_id', userId);

  const avgMastery = mastery && mastery.length > 0 
    ? mastery.reduce((sum, m) => sum + Number(m.score), 0) / mastery.length / 100 
    : 0.5;

  // Get revision completion
  const { data: revisions } = await supabaseAdmin
    .from('revision_plans')
    .select('completed')
    .eq('student_id', userId);

  const completedRevisions = revisions?.filter(r => r.completed).length || 0;
  const revisionRate = revisions && revisions.length > 0 
    ? completedRevisions / revisions.length 
    : 0.5;

  return {
    avg_practice_accuracy: avgAccuracy,
    avg_confusion_frequency: confusionFreq,
    session_frequency: sessionFreq,
    revision_completion: revisionRate,
    tutor_usage: tutorSessions,
    avg_mastery_progression: avgMastery,
    total_practice_attempts: totalAttempts
  };
}

/**
 * Helper: Check and unlock ML-related achievements
 */
async function checkMLAchievement(userId: string, achievementType: string) {
  const { data: insights } = await supabaseAdmin
    .from('ml_insights')
    .select('insight_type')
    .eq('student_id', userId);

  if (!insights) return;

  // ML Explorer - first ML insight
  if (insights.length === 1) {
    await supabaseAdmin.rpc('check_and_unlock_achievement', {
      p_student_id: userId,
      p_achievement_code: 'ml_explorer'
    });
  }

  // ML Enthusiast - all 6 model types
  const uniqueTypes = new Set(insights.map(i => i.insight_type));
  if (uniqueTypes.size >= 6) {
    await supabaseAdmin.rpc('check_and_unlock_achievement', {
      p_student_id: userId,
      p_achievement_code: 'ml_enthusiast'
    });
  }

  // Type-specific achievements
  if (achievementType === 'ml_early_warning') {
    await supabaseAdmin.rpc('check_and_unlock_achievement', {
      p_student_id: userId,
      p_achievement_code: 'risk_aware'
    });
  }

  if (achievementType === 'ml_profile') {
    await supabaseAdmin.rpc('check_and_unlock_achievement', {
      p_student_id: userId,
      p_achievement_code: 'profile_discovered'
    });
  }
}

export default router;
