import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Start a new class session
router.post('/api/sessions/start', requireAuth, async (req: Request, res: Response) => {
  const { course_id, title } = req.body;
  const educatorId = (req as any).user.id;

  if (!course_id || !title) {
    return res.status(400).json({ error: 'Missing required fields: course_id, title' });
  }

  try {
    // Check if there's already an active session for this course
    const { data: existingSessions } = await supabaseAdmin
      .from('class_sessions')
      .select('*')
      .eq('course_id', course_id)
      .is('ended_at', null);

    if (existingSessions && existingSessions.length > 0) {
      return res.status(400).json({ 
        error: 'An active session already exists for this course',
        activeSession: existingSessions[0]
      });
    }

    const { data, error } = await supabaseAdmin
      .from('class_sessions')
      .insert({
        course_id,
        educator_id: educatorId,
        title,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err: any) {
    console.error('Error starting session:', err);
    res.status(500).json({ error: err.message });
  }
});

// End a class session
router.post('/api/sessions/:id/end', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const educatorId = (req as any).user.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('class_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('educator_id', educatorId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }

    res.json(data);
  } catch (err: any) {
    console.error('Error ending session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get active session for a course
router.get('/api/sessions/active/:courseId', requireAuth, async (req: Request, res: Response) => {
  const courseId = req.params.courseId;

  try {
    const { data, error } = await supabaseAdmin
      .from('class_sessions')
      .select('*, course:courses(id, name, code), educator:profiles!educator_id(id, name)')
      .eq('course_id', courseId)
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    res.json(data || null);
  } catch (err: any) {
    console.error('Error fetching active session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get session details including moments and signals
router.get('/api/sessions/:id', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.params.id;

  try {
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('class_sessions')
      .select('*, course:courses(id, name, code), educator:profiles!educator_id(id, name)')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Get lecture moments for this session
    const { data: moments } = await supabaseAdmin
      .from('lecture_moments')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp_seconds', { ascending: true });

    // Get confusion signals for this session
    const { data: signals } = await supabaseAdmin
      .from('confusion_signals')
      .select('*, concept:concepts(name), student:profiles!student_id(name)')
      .eq('session_id', sessionId)
      .order('lecture_timestamp_seconds', { ascending: true });

    res.json({
      ...session,
      moments: moments || [],
      signals: signals || []
    });
  } catch (err: any) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all sessions for a course
router.get('/api/sessions/course/:courseId', requireAuth, async (req: Request, res: Response) => {
  const courseId = req.params.courseId;

  try {
    const { data, error } = await supabaseAdmin
      .from('class_sessions')
      .select('*, educator:profiles!educator_id(name)')
      .eq('course_id', courseId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err: any) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a lecture moment
router.post('/api/sessions/:id/moments', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const { label } = req.body;
  const educatorId = (req as any).user.id;

  if (!label) {
    return res.status(400).json({ error: 'Missing required field: label' });
  }

  try {
    // Verify session exists and belongs to educator
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('class_sessions')
      .select('started_at, ended_at')
      .eq('id', sessionId)
      .eq('educator_id', educatorId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }

    if (session.ended_at) {
      return res.status(400).json({ error: 'Cannot add moments to ended session' });
    }

    // Calculate timestamp_seconds
    const startedAt = new Date(session.started_at);
    const now = new Date();
    const timestamp_seconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    const { data, error } = await supabaseAdmin
      .from('lecture_moments')
      .insert({
        session_id: sessionId,
        timestamp_seconds,
        label: label.trim()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err: any) {
    console.error('Error adding lecture moment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get lecture moments for a session
router.get('/api/sessions/:id/moments', requireAuth, async (req: Request, res: Response) => {
  const sessionId = req.params.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('lecture_moments')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp_seconds', { ascending: true });

    if (error) throw error;

    res.json(data || []);
  } catch (err: any) {
    console.error('Error fetching lecture moments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a lecture moment (educator can fix mistakes)
router.delete('/api/sessions/:sessionId/moments/:momentId', requireAuth, async (req: Request, res: Response) => {
  const { sessionId, momentId } = req.params;
  const educatorId = (req as any).user.id;

  try {
    // Verify session belongs to educator
    const { data: session } = await supabaseAdmin
      .from('class_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('educator_id', educatorId)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Session not found or not authorized' });
    }

    const { error } = await supabaseAdmin
      .from('lecture_moments')
      .delete()
      .eq('id', momentId)
      .eq('session_id', sessionId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting lecture moment:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
