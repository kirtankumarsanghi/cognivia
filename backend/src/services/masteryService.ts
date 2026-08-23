import { supabaseAdmin } from '../config/supabase';
import { mlService } from './mlService';

export const masteryService = {
  /**
   * Recalculates mastery score using the Python BKT model
   * and updates the database.
   */
  async updateMastery(studentId: string, conceptId: string) {
    try {
      // 1. Fetch all practice attempts for this student & concept
      const { data: attempts, error } = await supabaseAdmin
        .from('practice_attempts')
        .select('correct')
        .eq('student_id', studentId)
        .eq('concept_id', conceptId)
        .order('created_at', { ascending: true }); // chronological order

      if (error) throw error;

      // Extract just the boolean values
      const attemptHistory = attempts?.map(a => Boolean(a.correct)) || [];

      // 2. Call Python ML Service (BKT)
      const mlData = await mlService.calculateMastery(attemptHistory);

      if (!mlData || !mlData.success) {
        throw new Error(`ML Service Error: Failed to calculate mastery`);
      }

      // Convert probability to 0-100 score
      const newScore = mlData.mastery_probability * 100;

      // 3. Upsert into database
      await supabaseAdmin.from('mastery_scores').upsert({
        student_id: studentId,
        concept_id: conceptId,
        score: newScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'student_id,concept_id' });

      return { success: true, score: newScore, probability: mlData.mastery_probability };
    } catch (error: any) {
      console.error('Error updating mastery score:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Fetches confusion risk from the Python ML Service
   */
  async getConfusionRisk(studentId: string, conceptId: string) {
    try {
      // 1. Get concept dependencies
      const { data: dependencies, error: depError } = await supabaseAdmin
        .from('concept_dependencies')
        .select('prerequisite_id')
        .eq('concept_id', conceptId);
        
      if (depError) throw depError;
      
      const prereqIds = dependencies?.map(d => d.prerequisite_id) || [];
      
      let prereqAvg = 1.0;
      let prereqMin = 1.0;

      if (prereqIds.length > 0) {
        // 2. Get student's mastery of those prerequisites
        const { data: masteryScores, error: masteryError } = await supabaseAdmin
          .from('mastery_scores')
          .select('score')
          .eq('student_id', studentId)
          .in('concept_id', prereqIds);
          
        if (masteryError) throw masteryError;

        const scores = masteryScores?.map(m => Number(m.score) / 100.0) || [];
        while (scores.length < prereqIds.length) {
          scores.push(0); // If not started, score is 0
        }
        
        prereqAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
        prereqMin = Math.min(...scores);
      }

      // Get current mastery of the target concept
      let currentMastery = 0.5; // Default if no history
      const { data: currentScore, error: currentError } = await supabaseAdmin
        .from('mastery_scores')
        .select('score')
        .eq('student_id', studentId)
        .eq('concept_id', conceptId)
        .single();
        
      if (!currentError && currentScore) {
        currentMastery = Number(currentScore.score) / 100.0;
      }

      // Prepare features payload for ML model
      const features = {
        current_mastery: currentMastery,
        prerequisite_avg: prereqAvg,
        prerequisite_min: prereqMin,
        // Mocking other required features for the demo context.
        // In a full production system, we'd query these from practice history.
        incorrect_attempts: 1, 
        recent_accuracy: 0.6,
        confusion_frequency: 0.2,
        recent_confusion_count: 0,
        time_since_last_practice: 24, // hours
        total_attempts: 5,
        streak: 1,
        revision_completion_rate: 0.8,
        previous_concept_accuracy: prereqAvg
      };

      // 3. Call Python ML Service (Logistic Regression / RF / GBT)
      const mlData = await mlService.predictConfusionRisk(features);

      if (!mlData || !mlData.success) {
        throw new Error(`ML Service Error: Failed to predict confusion risk`);
      }
      
      return { 
        success: true, 
        risk_percentage: mlData.confusion_probability * 100, 
        risk_probability: mlData.confusion_probability,
        is_high_risk: mlData.confusion_risk_alert
      };

    } catch (error: any) {
      console.error('Error fetching confusion risk:', error.message);
      return { success: false, error: error.message };
    }
  }
};
