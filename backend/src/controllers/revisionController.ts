import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

/**
 * Revision Plan Controller
 * Generates intelligent revision plans based on:
 * - Low mastery scores
 * - Recent confusion signals
 * - Concept difficulty
 * - Learning patterns
 */

interface RevisionRecommendation {
  concept: any;
  score: number;
  confusionCount: number;
  priorityScore: number;
  priority: 'Low' | 'Medium' | 'High';
  estimatedMinutes: number;
  reason: string;
}

/**
 * Get the current revision plan for a student
 */
export const getRevisionPlan = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('[RevisionController] Getting revision plan for user:', userId);
    
    // Get explicit revision plans
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .select(`
        *,
        concepts (
          id,
          name,
          difficulty,
          lesson:lessons (
            id,
            title,
            course:courses (
              id,
              name
            )
          )
        )
      `)
      .eq('student_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false });
    
    if (error) {
      console.error('[RevisionController] Error fetching revision plans:', error);
      throw error;
    }
    
    console.log(`[RevisionController] Found ${data?.length || 0} existing plans`);
    
    const priorityOrder: Record<string, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
    let plans = data?.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]) || [];

    // If no explicit plans, auto-generate based on mastery scores
    if (plans.length === 0) {
      console.log('[RevisionController] No plans found, auto-generating...');
      
      const { data: lowMasteryData, error: masteryError } = await supabaseAdmin
        .from('mastery_scores')
        .select(`
          score,
          concept:concepts (
            id,
            name,
            difficulty,
            lesson:lessons (
              id,
              title,
              course:courses (
                id,
                name
              )
            )
          )
        `)
        .eq('student_id', userId)
        .lt('score', 70)
        .order('score', { ascending: true })
        .limit(5);

      if (masteryError) {
        console.error('[RevisionController] Error fetching mastery scores:', masteryError);
      }

      console.log(`[RevisionController] Found ${lowMasteryData?.length || 0} low mastery concepts`);

      if (lowMasteryData && lowMasteryData.length > 0) {
        // Auto-create revision plans for low mastery concepts
        const newPlans = lowMasteryData
          .filter(m => m.concept && (Array.isArray(m.concept) ? m.concept.length > 0 : true))
          .map(m => {
            const concept = Array.isArray(m.concept) ? m.concept[0] : m.concept;
            if (!concept || !concept.id) {
              console.warn('[RevisionController] Skipping invalid concept:', m);
              return null;
            }
            return {
              student_id: userId,
              concept_id: concept.id,
              priority: m.score < 40 ? 'High' : m.score < 60 ? 'Medium' : 'Low',
              minutes: m.score < 40 ? 15 : 10,
              completed: false
            };
          })
          .filter(Boolean) as any[];

        console.log('[RevisionController] Creating', newPlans.length, 'new revision plans');

        if (newPlans.length === 0) {
          console.log('[RevisionController] No valid concepts to create plans for');
        } else {
          const { data: insertedPlans, error: insertError } = await supabaseAdmin
            .from('revision_plans')
            .insert(newPlans)
            .select(`
              *,
              concepts (
                id,
                name,
                difficulty,
                lesson:lessons (
                  id,
                  title,
                  course:courses (
                    id,
                    name
                  )
                )
              )
            `);

          if (insertError) {
            console.error('[RevisionController] Error creating plans:', insertError);
          } else if (insertedPlans) {
            console.log('[RevisionController] Successfully created', insertedPlans.length, 'plans');
            plans = insertedPlans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
          }
        }
      } else {
        console.log('[RevisionController] No low mastery concepts found, student is doing well!');
      }
    }
    
    console.log(`[RevisionController] Returning ${plans.length} revision plans`);
    res.json(plans);
  } catch (err: any) {
    console.error('[RevisionController] Error in getRevisionPlan:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Generate a smart revision plan using AI-powered recommendations
 */
export const generateSmartPlan = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('[RevisionController] Generating smart plan for user:', userId);
    
    // Step 1: Get student's current mastery scores
    const { data: masteryData, error: masteryError } = await supabaseAdmin
      .from('mastery_scores')
      .select(`
        score,
        concept:concepts (
          id,
          name,
          difficulty,
          lesson:lessons (
            id,
            title,
            course:courses (
              id,
              name
            )
          )
        )
      `)
      .eq('student_id', userId)
      .order('score', { ascending: true });

    if (masteryError) {
      console.error('[RevisionController] Error fetching mastery:', masteryError);
      throw masteryError;
    }

    console.log(`[RevisionController] Found ${masteryData?.length || 0} mastery scores`);

    // Step 2: Get recent confusion signals (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: confusionData, error: confusionError } = await supabaseAdmin
      .from('confusion_signals')
      .select(`
        concept_id,
        signal,
        created_at,
        concepts (
          id,
          name
        )
      `)
      .eq('student_id', userId)
      .gte('created_at', sevenDaysAgo);

    if (confusionError) {
      console.error('[RevisionController] Error fetching confusion:', confusionError);
    }

    console.log(`[RevisionController] Found ${confusionData?.length || 0} confusion signals`);

    // Step 3: Calculate confusion frequency per concept
    const confusionMap: Record<string, number> = {};
    confusionData?.forEach(sig => {
      if (!confusionMap[sig.concept_id]) confusionMap[sig.concept_id] = 0;
      if (sig.signal === 'Confused') confusionMap[sig.concept_id] += 2;
      else if (sig.signal === 'Partially Clear') confusionMap[sig.concept_id] += 1;
    });

    // Step 4: Smart scoring algorithm
    let recommendations: RevisionRecommendation[] = [];
    
    if (masteryData && masteryData.length > 0) {
      recommendations = masteryData
        .filter(m => {
          // Filter out invalid data
          if (m.score >= 80) return false;
          const concept = Array.isArray(m.concept) ? m.concept[0] : m.concept;
          return concept && concept.id && concept.name;
        })
        .map(m => {
          const concept = Array.isArray(m.concept) ? m.concept[0] : m.concept;
          const confusionScore = confusionMap[concept.id] || 0;
          const masteryGap = 100 - m.score;
          const difficultyWeight = 
            concept.difficulty === 'advanced' ? 1.5 : 
            concept.difficulty === 'intermediate' ? 1.2 : 1.0;
          
          // Combined priority score
          const priorityScore = (masteryGap * 0.5 + confusionScore * 10) * difficultyWeight;
          
          // Determine reason
          let reason = '';
          if (confusionScore > 0 && m.score < 60) {
            reason = 'Recent confusion + low mastery';
          } else if (confusionScore > 0) {
            reason = 'Recent confusion signals';
          } else if (m.score < 40) {
            reason = 'Very low mastery';
          } else if (m.score < 60) {
            reason = 'Low mastery';
          } else {
            reason = 'Needs reinforcement';
          }
          
          return {
            concept: concept,
            score: m.score,
            confusionCount: confusionScore,
            priorityScore,
            priority: (priorityScore > 50 ? 'High' : priorityScore > 25 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
            estimatedMinutes: priorityScore > 50 ? 20 : priorityScore > 25 ? 15 : 10,
            reason
          };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 8); // Top 8 recommendations
    }

    console.log(`[RevisionController] Generated ${recommendations.length} recommendations`);

    // Step 5: Create or update revision plans
    if (recommendations.length > 0) {
      const plans = recommendations.map(rec => ({
        student_id: userId,
        concept_id: rec.concept.id,
        priority: rec.priority,
        minutes: rec.estimatedMinutes,
        completed: false
      }));

      console.log('[RevisionController] Upserting plans to database...');

      // Delete old completed plans first to avoid conflicts
      await supabaseAdmin
        .from('revision_plans')
        .delete()
        .eq('student_id', userId)
        .eq('completed', true);

      // Upsert new plans
      const { error: upsertError } = await supabaseAdmin
        .from('revision_plans')
        .upsert(plans, { 
          onConflict: 'student_id,concept_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('[RevisionController] Error upserting plans:', upsertError);
        throw upsertError;
      }

      console.log('[RevisionController] Successfully upserted plans');
    } else {
      console.log('[RevisionController] No recommendations, generating fallback...');
      
      // Fallback: Get enrolled courses and recommend some concepts
      const { data: enrollments } = await supabaseAdmin
        .from('course_enrollments')
        .select('course_id')
        .eq('student_id', userId);

      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map(e => e.course_id);
        
        // Get some concepts from enrolled courses
        const { data: concepts } = await supabaseAdmin
          .from('concepts')
          .select(`
            id,
            name,
            difficulty,
            lesson:lessons!inner (
              id,
              title,
              course_id,
              course:courses (
                id,
                name
              )
            )
          `)
          .in('lesson.course_id', courseIds)
          .limit(5);

        console.log(`[RevisionController] Fallback: Found ${concepts?.length || 0} concepts`);

        if (concepts && concepts.length > 0) {
          recommendations = concepts.map(c => ({
            concept: c,
            score: 50,
            confusionCount: 0,
            priorityScore: 30,
            priority: 'Medium' as const,
            estimatedMinutes: 15,
            reason: 'General review recommended'
          }));

          const plans = recommendations.map(rec => ({
            student_id: userId,
            concept_id: rec.concept.id,
            priority: rec.priority,
            minutes: rec.estimatedMinutes,
            completed: false
          }));

          await supabaseAdmin
            .from('revision_plans')
            .upsert(plans, { 
              onConflict: 'student_id,concept_id',
              ignoreDuplicates: false 
            });

          console.log('[RevisionController] Created fallback plans');
        }
      }
    }

    const message = recommendations.length > 0
      ? `Generated ${recommendations.length} personalized revision topics`
      : 'No concepts need revision at this time. Great work!';

    console.log('[RevisionController]', message);

    // Fetch the updated plans to return to the frontend
    const { data: returnedPlans } = await supabaseAdmin
      .from('revision_plans')
      .select(`
        *,
        concepts (
          id,
          name,
          difficulty,
          lesson:lessons (
            id,
            title,
            course:courses (
              id,
              name
            )
          )
        )
      `)
      .eq('student_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false });

    res.json({ 
      success: true, 
      recommendations,
      plans: returnedPlans || [],
      message
    });

  } catch (err: any) {
    console.error('[RevisionController] Error in generateSmartPlan:', err);
    res.status(500).json({ 
      error: err.message,
      success: false,
      message: 'Failed to generate revision plan'
    });
  }
};

/**
 * Mark a revision plan item as complete
 */
export const completeRevision = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const planId = req.params.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log(`[RevisionController] Completing revision ${planId} for user ${userId}`);
    
    // Update the plan to completed
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .update({ completed: true })
      .eq('id', planId)
      .eq('student_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('[RevisionController] Error completing revision:', error);
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Revision plan not found' });
    }

    console.log('[RevisionController] Revision completed:', data);

    // Log a learning session
    await supabaseAdmin.from('learning_sessions').insert({
      student_id: userId,
      session_type: 'revision',
      duration_minutes: data.minutes || 10
    });

    // Boost the mastery score slightly
    const { data: currentMastery } = await supabaseAdmin
      .from('mastery_scores')
      .select('score')
      .eq('student_id', userId)
      .eq('concept_id', data.concept_id)
      .single();

    const boost = 5; // 5 point boost for completing revision
    const newScore = Math.min(100, (currentMastery?.score || 50) + boost);
    
    await supabaseAdmin.from('mastery_scores').upsert({
      student_id: userId,
      concept_id: data.concept_id,
      score: newScore,
      updated_at: new Date().toISOString()
    }, { onConflict: 'student_id,concept_id' });

    console.log(`[RevisionController] Mastery updated: ${currentMastery?.score || 50} → ${newScore}`);

    res.json({ 
      success: true,
      data,
      message: 'Revision completed successfully!'
    });
  } catch (err: any) {
    console.error('[RevisionController] Error in completeRevision:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a revision plan item
 */
export const deleteRevisionPlan = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const planId = req.params.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { error } = await supabaseAdmin
      .from('revision_plans')
      .delete()
      .eq('id', planId)
      .eq('student_id', userId);
    
    if (error) throw error;

    res.json({ 
      success: true,
      message: 'Revision plan item deleted'
    });
  } catch (err: any) {
    console.error('[RevisionController] Error in deleteRevisionPlan:', err);
    res.status(500).json({ error: err.message });
  }
};
