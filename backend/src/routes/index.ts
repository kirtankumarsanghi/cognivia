import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { geminiService } from '../services/geminiService';

const router = Router();

// Middleware to mock auth for demo purposes if no token provided.
// In a real app, verify the JWT from Supabase.
const requireAuth = async (req: Request, res: Response, next: Function) => {
  // For MVP, we pass the student_id or educator_id in a header 'x-user-id'
  // to avoid complex JWT setup when testing the frontend demo flow.
  const userId = req.headers['x-user-id'] as string;
  const role = req.headers['x-user-role'] as string;

  if (!userId || !role) {
    return res.status(401).json({ error: 'Unauthorized. Missing x-user-id or x-user-role header.' });
  }

  (req as any).user = { id: userId, role };
  next();
};

// ==========================================
// COURSE & CONCEPT ROUTES
// ==========================================

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

router.get('/api/concepts/:id', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('concepts')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CONFUSION SIGNAL ROUTES
// ==========================================

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

    // Immediately trigger a pulse re-calculation or add to revision queue (simplified for MVP)
    if (signal === 'Confused') {
      await supabaseAdmin.from('revision_plans').upsert({
        student_id: userId,
        concept_id,
        priority: 'High',
        minutes: 10,
        completed: false
      }, { onConflict: 'student_id,concept_id' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/confusion/pulse', requireAuth, async (req, res) => {
  // Aggregate recent signals per concept
  try {
    const { data, error } = await supabaseAdmin
      .from('confusion_signals')
      .select('concept_id, signal, concepts(name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const pulse: Record<string, { concept_id: string; name: string; score: number; count: number }> = {};
    
    data.forEach(sig => {
      const cid = sig.concept_id;
      if (!pulse[cid]) pulse[cid] = { concept_id: cid, name: sig.concepts?.name || 'Unknown', score: 0, count: 0 };
      
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
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// AI TUTOR ROUTES
// ==========================================

router.post('/api/tutor/chat', requireAuth, async (req, res) => {
  const { question, concept_id } = req.body;
  const userId = (req as any).user.id;

  try {
    // Optional: fetch concept details to give Gemini context
    let context = '';
    if (concept_id) {
       const { data } = await supabaseAdmin.from('concepts').select('name, description').eq('id', concept_id).single();
       if (data) context = `The student is currently learning about: ${data.name} - ${data.description}.`;
    }

    const aiResponse = await geminiService.askTutor(question, context);

    // Save conversation
    await supabaseAdmin.from('ai_conversations').insert({
      student_id: userId,
      concept_id: concept_id || null,
      question,
      answer: aiResponse
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

// ==========================================
// REVISION ROUTES
// ==========================================

router.get('/api/revision/plan', requireAuth, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .select('*, concepts(name)')
      .eq('student_id', userId)
      .eq('completed', false)
      .order('priority', { ascending: true }); // Need a better sort logic ideally
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/revision/:id/complete', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('revision_plans')
      .update({ completed: true })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// EDUCATOR ANALYTICS ROUTES
// ==========================================

router.get('/api/analytics/educator', requireAuth, async (req, res) => {
  // Simplified for MVP. Get total students, average class learning score (mocked for speed)
  try {
    const { count: studentCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    
    // Get pulse
    const pulseRes = await fetch(`http://localhost:${env.port}/api/confusion/pulse`, {
      headers: { 'x-user-id': (req as any).user.id, 'x-user-role': 'educator' }
    }).then(r => r.json());

    res.json({
      studentCount,
      averageClassScore: 74, // Mocked overall score
      confusionPulse: pulseRes
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/educator/recommendation', requireAuth, async (req, res) => {
  const { metrics } = req.body;
  try {
    const recommendation = await geminiService.generateEducatorRecommendation(metrics);
    res.json({ recommendation });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
