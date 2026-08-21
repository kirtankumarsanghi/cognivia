import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { geminiService } from '../services/geminiService';

const router = Router();

const weeklyBuckets = () => Array.from({ length: 7 }, (_, offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (6 - offset));
  return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString('en-US', { weekday: 'short' }), sessions: 0, signals: 0 };
});

// Middleware to mock auth for demo purposes if no token provided.
const requireAuth = async (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] as string;
  const role = req.headers['x-user-role'] as string;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  (req as any).user = { id: userId, role };
  next();
};

// ========== USER / ME ==========
router.get('/api/me', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== COURSES & LESSONS & CONCEPTS ==========
router.get('/api/courses', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('courses').select('*, lessons(*, concepts(*))');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/courses/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('*, lessons(*, concepts(*))')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/lessons/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('lessons')
      .select('*, concepts(*), course:courses(*)')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/concepts/:id', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data: concept, error: conceptError } = await supabaseAdmin
      .from('concepts')
      .select('*, lesson:lessons(*, course:courses(*))')
      .eq('id', req.params.id)
      .single();
    
    if (conceptError) throw conceptError;

    const { data: prereqs } = await supabaseAdmin
      .from('concept_dependencies')
      .select('prerequisite:prerequisite_id(id, name)')
      .eq('concept_id', req.params.id);

    const { data: mastery } = await supabaseAdmin
      .from('mastery_scores')
      .select('score')
      .eq('student_id', userId)
      .eq('concept_id', req.params.id)
      .single();

    const { data: signals } = await supabaseAdmin
      .from('confusion_signals')
      .select('signal')
      .eq('student_id', userId)
      .eq('concept_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(10);

    let confusionLevel = 0;
    if (signals && signals.length > 0) {
      const total = signals.reduce((sum, s) => {
        if (s.signal === 'Confused') return sum + 1.0;
        if (s.signal === 'Partially Clear') return sum + 0.5;
        return sum;
      }, 0);
      confusionLevel = Math.round((total / signals.length) * 100);
    }

    res.json({
      ...concept,
      prerequisites: prereqs?.map(p => p.prerequisite) || [],
      mastery: mastery?.score || 0,
      confusion: confusionLevel
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CONFUSION SIGNALS ==========
router.post('/api/confusion/signal', requireAuth, async (req, res) => {
  const { concept_id, signal } = req.body;
  const userId = (req as any).user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('confusion_signals')
      .insert({ student_id: userId, concept_id, signal })
      .select()
      .single();
    
    if (error) throw error;

    if (signal === 'Confused') {
      await supabaseAdmin.from('revision_plans').upsert({
        student_id: userId,
        concept_id,
        priority: 'High',
        minutes: 10,
        completed: false
      }, { onConflict: 'student_id,concept_id' });

      const { data: currentMastery } = await supabaseAdmin
        .from('mastery_scores')
        .select('score')
        .eq('student_id', userId)
        .eq('concept_id', concept_id)
        .single();

      const newScore = Math.max(0, (currentMastery?.score || 50) - 10);
      await supabaseAdmin.from('mastery_scores').upsert({
        student_id: userId,
        concept_id,
        score: newScore
      }, { onConflict: 'student_id,concept_id' });
    } else if (signal === 'Clear') {
      const { data: currentMastery } = await supabaseAdmin
        .from('mastery_scores')
        .select('score')
        .eq('student_id', userId)
        .eq('concept_id', concept_id)
        .single();

      const newScore = Math.min(100, (currentMastery?.score || 50) + 15);
      await supabaseAdmin.from('mastery_scores').upsert({
        student_id: userId,
        concept_id,
        score: newScore
      }, { onConflict: 'student_id,concept_id' });

      await supabaseAdmin
        .from('revision_plans')
        .delete()
        .eq('student_id', userId)
        .eq('concept_id', concept_id);

      const { data: conceptData } = await supabaseAdmin
        .from('concepts')
        .select('name')
        .eq('id', concept_id)
        .single();

      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        type: 'improvement',
        message: `${conceptData?.name || 'Concept'} improved to ${Math.round(newScore)}%!`,
        read: false
      });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/confusion/pulse', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('confusion_signals')
      .select('concept_id, signal, concepts(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const pulse: Record<string, { concept_id: string; name: string; score: number; count: number }> = {};
    
    data.forEach(sig => {
      const cid = sig.concept_id;
      const concept = Array.isArray(sig.concepts) ? sig.concepts[0] : sig.concepts;
      if (!pulse[cid]) pulse[cid] = { concept_id: cid, name: concept?.name || 'Unknown', score: 0, count: 0 };
      
      pulse[cid].count += 1;
      if (sig.signal === 'Confused') pulse[cid].score += 1.0;
      else if (sig.signal === 'Partially Clear') pulse[cid].score += 0.5;
      else if (sig.signal === 'Clear') pulse[cid].score += 0.0;
    });

    const result = Object.values(pulse).map(p => {
      const avg = p.count > 0 ? (p.score / p.count) * 100 : 0;
      let status = 'LOW';
      if (avg >= 66) status = 'HIGH';
      else if (avg >= 33) status = 'MEDIUM';

      return {
        concept_id: p.concept_id,
        name: p.name,
        confusion_percentage: Math.round(avg),
        status
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/confusion/history', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('confusion_signals')
      .select('*, concepts(name, lesson:lessons(course:courses(name)))')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== AI TUTOR ==========
router.post('/api/tutor/chat', requireAuth, async (req, res) => {
  const { question, concept_id } = req.body;
  const userId = (req as any).user.id;

  try {
    let context = '';
    if (concept_id) {
       const { data } = await supabaseAdmin.from('concepts').select('name, description').eq('id', concept_id).single();
       if (data) context = `The student is currently learning about: ${data.name} - ${data.description}.`;
    }

    const aiResponse = await geminiService.askTutor(question, context);

    await supabaseAdmin.from('ai_conversations').insert({
      student_id: userId,
      concept_id: concept_id || null,
      question,
      answer: aiResponse
    });

    await supabaseAdmin.from('learning_sessions').insert({
      student_id: userId,
      session_type: 'tutor',
      duration_minutes: 5
    });

    res.json(aiResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/tutor/explain-again', requireAuth, async (req, res) => {
  const { question, previousExplanation } = req.body;
  try {
    const aiResponse = await geminiService.explainAgain(question, previousExplanation);
    res.json(aiResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/tutor/history', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_conversations')
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false})
      .limit(20);
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== REVISION ==========
router.get('/api/revision/plan', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false });
    if (error) throw error;
    
    const priorityOrder: Record<string, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };
    const sorted = data.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/revision/:id/complete', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .update({ completed: true })
      .eq('id', req.params.id)
      .eq('student_id', userId)
      .select()
      .single();
    if (error) throw error;

    await supabaseAdmin.from('learning_sessions').insert({
      student_id: userId,
      session_type: 'revision',
      duration_minutes: data.minutes
    });

    const { data: currentMastery } = await supabaseAdmin
      .from('mastery_scores')
      .select('score')
      .eq('student_id', userId)
      .eq('concept_id', data.concept_id)
      .single();

    const newScore = Math.min(100, (currentMastery?.score || 50) + 5);
    await supabaseAdmin.from('mastery_scores').upsert({
      student_id: userId,
      concept_id: data.concept_id,
      score: newScore
    }, { onConflict: 'student_id,concept_id' });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PRACTICE ==========
router.get('/api/practice', requireAuth, async (req, res) => {
  const { concept_id } = req.query;
  try {
    let query = supabaseAdmin.from('practice_questions').select('*');
    if (concept_id) query = query.eq('concept_id', concept_id);
    
    const { data, error } = await query.limit(10);
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/practice/attempt', requireAuth, async (req, res) => {
  const { concept_id, correct } = req.body;
  const userId = (req as any).user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('practice_attempts')
      .insert({ student_id: userId, concept_id, correct })
      .select()
      .single();
    
    if (error) throw error;

    const { data: recentAttempts } = await supabaseAdmin
      .from('practice_attempts')
      .select('correct')
      .eq('student_id', userId)
      .eq('concept_id', concept_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentAttempts && recentAttempts.length >= 3) {
      const correctCount = recentAttempts.filter(a => a.correct).length;
      const accuracy = correctCount / recentAttempts.length;

      const { data: currentMastery } = await supabaseAdmin
        .from('mastery_scores')
        .select('score')
        .eq('student_id', userId)
        .eq('concept_id', concept_id)
        .single();

      let change = 0;
      if (accuracy >= 0.8) change = 10;
      else if (accuracy >= 0.6) change = 5;
      else if (accuracy < 0.4) change = -5;

      const newScore = Math.max(0, Math.min(100, (currentMastery?.score || 50) + change));
      await supabaseAdmin.from('mastery_scores').upsert({
        student_id: userId,
        concept_id,
        score: newScore
      }, { onConflict: 'student_id,concept_id' });
    }

    await supabaseAdmin.from('learning_sessions').insert({
      student_id: userId,
      session_type: 'practice',
      duration_minutes: 2
    });

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== STUDENT ANALYTICS ==========
router.get('/api/analytics/student', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data: masteryData } = await supabaseAdmin
      .from('mastery_scores')
      .select('score')
      .eq('student_id', userId);

    const scores = masteryData?.map(m => m.score) || [];
    const avgMastery = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const masteredCount = scores.filter(s => s >= 80).length;
    const needsAttentionCount = scores.filter(s => s < 60).length;

    const { data: practiceData } = await supabaseAdmin
      .from('practice_attempts')
      .select('correct')
      .eq('student_id', userId);

    const totalPractice = practiceData?.length || 0;
    const correctPractice = practiceData?.filter(p => p.correct).length || 0;
    const practiceAccuracy = totalPractice > 0 ? (correctPractice / totalPractice) * 100 : 0;

    const { data: clearSignals } = await supabaseAdmin
      .from('confusion_signals')
      .select('*')
      .eq('student_id', userId)
      .eq('signal', 'Clear')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const clarityConfirmations = clearSignals?.length || 0;

    const { data: completedRevisions } = await supabaseAdmin
      .from('revision_plans')
      .select('*')
      .eq('student_id', userId)
      .eq('completed', true)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const revisionCompletion = completedRevisions?.length || 0;

    const learningScore = Math.round(
      avgMastery * 0.5 +
      practiceAccuracy * 0.25 +
      Math.min(clarityConfirmations * 5, 15) +
      Math.min(revisionCompletion * 2, 10)
    );

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

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { data: weeklySessions } = await supabaseAdmin
      .from('learning_sessions')
      .select('*')
      .eq('student_id', userId)
      .gte('created_at', weekAgo.toISOString());

    const weeklySessionCount = weeklySessions?.length || 0;
    const { data: weeklySignals } = await supabaseAdmin
      .from('confusion_signals')
      .select('created_at')
      .eq('student_id', userId)
      .gte('created_at', weekAgo.toISOString());

    const weeklyProgress = weeklyBuckets();
    (weeklySessions || []).forEach(session => {
      const bucket = weeklyProgress.find(day => day.key === new Date(session.created_at).toISOString().slice(0, 10));
      if (bucket) bucket.sessions += 1;
    });
    (weeklySignals || []).forEach(signal => {
      const bucket = weeklyProgress.find(day => day.key === new Date(signal.created_at).toISOString().slice(0, 10));
      if (bucket) bucket.signals += 1;
    });
    const weeklyChange = Math.min(15, Math.round(clarityConfirmations * 3 + revisionCompletion * 2 + weeklySessionCount * 0.5));

    const { data: revisionPlan } = await supabaseAdmin
      .from('revision_plans')
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: false })
      .limit(3);

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
        recommendedNext = `Review ${weakConcept.concept.name}`;
      }
    } else if (revisionPlan && revisionPlan.length > 0) {
      recommendedNext = `Complete revision: ${revisionPlan[0].concepts.name}`;
    }

    res.json({
      learningScore,
      weeklyChange,
      masteredCount,
      needsAttentionCount,
      practiceAccuracy: Math.round(practiceAccuracy),
      streak,
      weeklySessionCount,
      weeklyProgress,
      revisionPlan,
      recommendedNext,
      rank: learningScore >= 85 ? 'Expert' : learningScore >= 70 ? 'Pro Scholar' : learningScore >= 50 ? 'Focused Learner' : 'Learner'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== EDUCATOR ANALYTICS ==========
router.get('/api/analytics/educator', requireAuth, async (req, res) => {
  try {
    const { count: studentCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');
    
    const { data: allMastery } = await supabaseAdmin
      .from('mastery_scores')
      .select('score');
    
    const avgClassScore = allMastery && allMastery.length > 0
      ? Math.round(allMastery.reduce((sum, m) => sum + m.score, 0) / allMastery.length)
      : 0;

    const { data: signals } = await supabaseAdmin
      .from('confusion_signals')
      .select('concept_id, signal, created_at, concepts(name)')
      .order('created_at', { ascending: false });

    const pulse: Record<string, { name: string; score: number; count: number }> = {};
    signals?.forEach(sig => {
      const cid = sig.concept_id;
      const concept = Array.isArray(sig.concepts) ? sig.concepts[0] : sig.concepts;
      if (!pulse[cid]) pulse[cid] = { name: concept?.name || 'Unknown', score: 0, count: 0 };
      pulse[cid].count += 1;
      if (sig.signal === 'Confused') pulse[cid].score += 1.0;
      else if (sig.signal === 'Partially Clear') pulse[cid].score += 0.5;
    });

    const confusionMetrics = Object.entries(pulse).map(([id, p]) => {
      const avg = p.count > 0 ? (p.score / p.count) * 100 : 0;
      return { concept_id: id, name: p.name, confusion_percentage: Math.round(avg) };
    }).sort((a, b) => b.confusion_percentage - a.confusion_percentage);

    const mostConfusing = confusionMetrics[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyTrend = weeklyBuckets();
    (signals || []).filter(signal => new Date(signal.created_at) >= weekAgo).forEach(signal => {
      const bucket = weeklyTrend.find(day => day.key === new Date(signal.created_at).toISOString().slice(0, 10));
      if (bucket) bucket.signals += signal.signal === 'Confused' ? 1 : signal.signal === 'Partially Clear' ? 0.5 : 0;
    });

    let aiRecommendation = null;
    if (mostConfusing) {
      try {
        aiRecommendation = await geminiService.generateEducatorRecommendation({
          highestConfusionConcept: mostConfusing.name,
          confusionPercentage: mostConfusing.confusion_percentage,
          studentCount
        });
      } catch (e) {
        // AI unavailable
      }
    }

    res.json({
      studentCount: studentCount || 0,
      averageClassScore: avgClassScore,
      confusionMetrics,
      mostConfusing,
      aiRecommendation,
      weeklyTrend,
      criticalConceptCount: confusionMetrics.filter(metric => metric.confusion_percentage >= 66).length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== EDUCATOR ANALYTICS - STUDENT PERFORMANCE ==========
router.get('/api/analytics/educator/students', requireAuth, async (req, res) => {
  try {
    // Get all students
    const { data: students } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'student');

    if (!students || students.length === 0) {
      return res.json([]);
    }

    const studentPerformance = await Promise.all(
      students.map(async (student) => {
        // Get mastery scores
        const { data: masteryData } = await supabaseAdmin
          .from('mastery_scores')
          .select('score')
          .eq('student_id', student.id);

        const scores = masteryData?.map(m => m.score) || [];
        const avg_mastery = scores.length > 0 
          ? scores.reduce((a, b) => a + b, 0) / scores.length 
          : 0;

        // Get practice accuracy
        const { data: practiceData } = await supabaseAdmin
          .from('practice_attempts')
          .select('correct')
          .eq('student_id', student.id);

        const totalPractice = practiceData?.length || 0;
        const correctPractice = practiceData?.filter(p => p.correct).length || 0;
        const practice_accuracy = totalPractice > 0 
          ? (correctPractice / totalPractice) * 100 
          : 0;

        // Get confusion count (recent week)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const { count: confusionCount } = await supabaseAdmin
          .from('confusion_signals')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', student.id)
          .eq('signal', 'Confused')
          .gte('created_at', weekAgo.toISOString());

        // Get last activity
        const { data: lastSession } = await supabaseAdmin
          .from('learning_sessions')
          .select('created_at')
          .eq('student_id', student.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Determine status
        let status: 'excellent' | 'good' | 'needs_attention' | 'at_risk';
        if (avg_mastery >= 80 && practice_accuracy >= 80 && (confusionCount || 0) < 3) {
          status = 'excellent';
        } else if (avg_mastery >= 60 && practice_accuracy >= 60) {
          status = 'good';
        } else if (avg_mastery >= 40 || (confusionCount || 0) > 5) {
          status = 'needs_attention';
        } else {
          status = 'at_risk';
        }

        return {
          student_id: student.id,
          student_name: student.name,
          avg_mastery: Math.round(avg_mastery),
          practice_accuracy: Math.round(practice_accuracy),
          confusion_count: confusionCount || 0,
          last_active: lastSession?.created_at || new Date().toISOString(),
          status
        };
      })
    );

    // Sort by status priority (at_risk first, then needs_attention, etc.)
    const statusPriority = { at_risk: 0, needs_attention: 1, good: 2, excellent: 3 };
    studentPerformance.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

    res.json(studentPerformance);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== NOTIFICATIONS ==========
router.get('/api/notifications', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SAVED EXPLANATIONS ==========
router.get('/api/saved-explanations', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('saved_explanations')
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/saved-explanations', requireAuth, async (req, res) => {
  const { concept_id, title, content } = req.body;
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('saved_explanations')
      .insert({ student_id: userId, concept_id, title, content })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/saved-explanations/:id', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { error } = await supabaseAdmin
      .from('saved_explanations')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', userId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== PROFILE ==========
router.get('/api/profile', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/profile', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  const { name, avatar } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, avatar })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SEARCH ==========
router.get('/api/search', requireAuth, async (req, res) => {
  const { q } = req.query;
  const query = (q as string)?.toLowerCase() || '';
  
  try {
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id, name, code')
      .ilike('name', `%${query}%`);

    const { data: lessons } = await supabaseAdmin
      .from('lessons')
      .select('id, title, course:courses(name)')
      .ilike('title', `%${query}%`);

    const { data: concepts } = await supabaseAdmin
      .from('concepts')
      .select('id, name, lesson:lessons(course:courses(name))')
      .ilike('name', `%${query}%`);

    res.json({
      courses: courses || [],
      lessons: lessons || [],
      concepts: concepts || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ========== STUDY GROUPS ==========
router.get('/api/study-groups/matches', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data: otherStudents } = await supabaseAdmin
      .from('profiles')
      .select('id, name')
      .eq('role', 'student')
      .neq('id', userId)
      .limit(4);

    if (!otherStudents) return res.json([]);

    const matches = await Promise.all(otherStudents.map(async (student) => {
      const { data: bestMastery } = await supabaseAdmin
        .from('mastery_scores')
        .select('score, concept:concepts(name)')
        .eq('student_id', student.id)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      const conceptData = bestMastery?.concept as any;
      return {
        id: student.id,
        name: student.name,
        strength: (Array.isArray(conceptData) ? conceptData[0]?.name : conceptData?.name) || 'General Programming',
        match: Math.floor(Math.random() * 20) + 80 // 80-99% match
      };
    }));

    res.json(matches.sort((a, b) => b.match - a.match));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/study-groups/sessions', requireAuth, async (req, res) => {
  try {
    const sessions = [
      {
        id: '1',
        title: 'Algorithms Prep',
        topic: 'Graph Traversal and BFS/DFS implementation details.',
        participants: 4,
        isLive: true
      },
      {
        id: '2',
        title: 'System Design Basics',
        topic: 'Discussing CAP theorem and database sharding strategies.',
        participants: 3,
        isLive: true
      }
    ];
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
