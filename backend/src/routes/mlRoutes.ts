import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { mlService } from '../services/mlService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Endpoint for Educator dashboard to get early warnings
router.post('/api/ml/early-warning', requireAuth, async (req: Request, res: Response) => {
  try {
    const { features } = req.body;
    if (!features) {
      return res.status(400).json({ error: 'Features required' });
    }
    const result = await mlService.predictEarlyWarning(features);
    return res.json(result || { success: false, error: 'ML Service failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to get student profile clustering
router.post('/api/ml/student-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const { studentId, features } = req.body;
    if (!studentId || !features) {
      return res.status(400).json({ error: 'StudentId and features required' });
    }
    
    const result = await mlService.predictStudentProfile(features);
    
    // If successful, we could update the user_learning_profiles table
    if (result && result.success) {
      await supabaseAdmin.from('user_learning_profiles').upsert({
        user_id: studentId,
        learning_pattern: result.cluster,
        confidence_score: result.confidence,
        risk_score: 50, // This should come from ensemble model eventually
        at_risk: false,
        last_updated: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
    
    return res.json(result || { success: false, error: 'ML Service failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint for concept difficulty
router.post('/api/ml/concept-difficulty', requireAuth, async (req: Request, res: Response) => {
  try {
    const { conceptId, stats } = req.body;
    if (!conceptId || !stats) {
      return res.status(400).json({ error: 'ConceptId and stats required' });
    }
    
    const result = await mlService.calculateConceptDifficulty(stats);
    
    if (result && result.success) {
      await supabaseAdmin.from('concept_difficulties').upsert({
        concept_id: conceptId,
        difficulty_score: result.difficulty_score,
        average_time: stats.average_time || 0,
        confusion_frequency: stats.confusion_frequency || 0,
        last_updated: new Date().toISOString()
      }, { onConflict: 'concept_id' });
    }
    
    return res.json(result || { success: false, error: 'ML Service failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// General learning risk score endpoint
router.post('/api/ml/learning-risk', requireAuth, async (req: Request, res: Response) => {
  try {
    const { model_outputs } = req.body;
    const result = await mlService.calculateLearningRisk(model_outputs);
    return res.json(result || { success: false, error: 'ML Service failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// NLP Confusion Classifier
router.post('/api/ml/classify-confusion', requireAuth, async (req: Request, res: Response) => {
  try {
    const { text, conceptName } = req.body;
    const result = await mlService.classifyConfusion(text, conceptName);
    return res.json(result || { success: false, error: 'ML Service failed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
