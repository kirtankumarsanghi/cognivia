import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Get suggested peer matches based on mastery scores
router.get('/api/study-groups/matches', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  try {
    // Get concepts the user is struggling with (score < 70)
    const { data: weakConcepts } = await supabaseAdmin
      .from('mastery_scores')
      .select('concept_id, score')
      .eq('student_id', userId)
      .lt('score', 70)
      .order('score', { ascending: true })
      .limit(5);

    if (!weakConcepts || weakConcepts.length === 0) {
      return res.json([]);
    }

    const conceptIds = weakConcepts.map(c => c.concept_id);

    // Find students who have mastered these concepts (score > 80)
    const { data: potentialMatches } = await supabaseAdmin
      .from('mastery_scores')
      .select('student_id, concept_id, score, concept:concepts(name)')
      .in('concept_id', conceptIds)
      .gt('score', 80)
      .neq('student_id', userId);

    if (!potentialMatches || potentialMatches.length === 0) {
      return res.json([]);
    }

    // Group by student and calculate match score
    const matchMap: Record<string, { studentId: string; concepts: string[]; totalScore: number }> = {};
    
    potentialMatches.forEach(match => {
      if (!matchMap[match.student_id]) {
        matchMap[match.student_id] = {
          studentId: match.student_id,
          concepts: [],
          totalScore: 0
        };
      }
      const concept = Array.isArray(match.concept) ? match.concept[0] : match.concept;
      matchMap[match.student_id].concepts.push(concept.name);
      matchMap[match.student_id].totalScore += match.score;
    });

    // Get profile info for matches
    const matchIds = Object.keys(matchMap);
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name, avatar')
      .in('id', matchIds);

    // Calculate match percentage and format response
    const matches = profiles?.map(profile => {
      const matchInfo = matchMap[profile.id];
      const avgScore = matchInfo.totalScore / matchInfo.concepts.length;
      const matchPercentage = Math.min(Math.round(avgScore), 100);
      
      return {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar,
        strength: matchInfo.concepts[0], // Primary strength
        allStrengths: matchInfo.concepts,
        match: matchPercentage
      };
    }).sort((a, b) => b.match - a.match).slice(0, 10) || [];

    res.json(matches);
  } catch (err: any) {
    console.error('[Study Groups] Error finding matches:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get active study group sessions
router.get('/api/study-groups/sessions', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data: groups, error } = await supabaseAdmin
      .from('study_groups')
      .select(`
        *,
        creator:profiles!creator_id(id, name),
        concept:concepts(name),
        members:study_group_members(count)
      `)
      .eq('is_active', true)
      .is('ended_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    // Format response
    const sessions = groups?.map(group => ({
      id: group.id,
      title: group.title,
      description: group.description,
      topic: group.topic,
      conceptName: group.concept?.name,
      creator: group.creator,
      participants: group.members[0]?.count || 0,
      maxParticipants: group.max_participants,
      isLive: !!group.started_at && !group.ended_at,
      scheduledAt: group.scheduled_at,
      startedAt: group.started_at,
      createdAt: group.created_at
    })) || [];

    res.json(sessions);
  } catch (err: any) {
    console.error('[Study Groups] Error fetching sessions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new study group
router.post('/api/study-groups', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { title, description, topic, conceptId, maxParticipants, scheduledAt } = req.body;

  try {
    // Create the group
    const { data: group, error: groupError } = await supabaseAdmin
      .from('study_groups')
      .insert({
        title,
        description,
        topic,
        concept_id: conceptId || null,
        creator_id: userId,
        max_participants: maxParticipants || 8,
        scheduled_at: scheduledAt || null,
        is_active: true
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Auto-join the creator
    const { error: memberError } = await supabaseAdmin
      .from('study_group_members')
      .insert({
        group_id: group.id,
        student_id: userId,
        is_active: true
      });

    if (memberError) throw memberError;

    res.json({ success: true, group });
  } catch (err: any) {
    console.error('[Study Groups] Error creating group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Join a study group
router.post('/api/study-groups/:id/join', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const groupId = req.params.id;

  try {
    // Check if group is full
    const { data: group } = await supabaseAdmin
      .from('study_groups')
      .select('max_participants, members:study_group_members(count)')
      .eq('id', groupId)
      .single();

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const currentCount = group.members[0]?.count || 0;
    if (currentCount >= group.max_participants) {
      return res.status(400).json({ error: 'Group is full' });
    }

    // Join the group
    const { data, error } = await supabaseAdmin
      .from('study_group_members')
      .upsert({
        group_id: groupId,
        student_id: userId,
        is_active: true,
        joined_at: new Date().toISOString()
      }, { onConflict: 'group_id,student_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, membership: data });
  } catch (err: any) {
    console.error('[Study Groups] Error joining group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Leave a study group
router.post('/api/study-groups/:id/leave', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const groupId = req.params.id;

  try {
    const { error } = await supabaseAdmin
      .from('study_group_members')
      .update({
        is_active: false,
        left_at: new Date().toISOString()
      })
      .eq('group_id', groupId)
      .eq('student_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err: any) {
    console.error('[Study Groups] Error leaving group:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get messages for a study group
router.get('/api/study-groups/:id/messages', requireAuth, async (req: Request, res: Response) => {
  const groupId = req.params.id;

  try {
    const { data: messages, error } = await supabaseAdmin
      .from('study_group_messages')
      .select('*, student:profiles(id, name, avatar)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    res.json(messages || []);
  } catch (err: any) {
    console.error('[Study Groups] Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Send a message to a study group
router.post('/api/study-groups/:id/messages', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const groupId = req.params.id;
  const { message } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('study_group_messages')
      .insert({
        group_id: groupId,
        student_id: userId,
        message
      })
      .select('*, student:profiles(id, name, avatar)')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    console.error('[Study Groups] Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start a study session
router.post('/api/study-groups/:id/start', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const groupId = req.params.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('study_groups')
      .update({ started_at: new Date().toISOString() })
      .eq('id', groupId)
      .eq('creator_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, group: data });
  } catch (err: any) {
    console.error('[Study Groups] Error starting session:', err);
    res.status(500).json({ error: err.message });
  }
});

// End a study session
router.post('/api/study-groups/:id/end', requireAuth, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const groupId = req.params.id;

  try {
    const { data, error } = await supabaseAdmin
      .from('study_groups')
      .update({ 
        ended_at: new Date().toISOString(),
        is_active: false
      })
      .eq('id', groupId)
      .eq('creator_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, group: data });
  } catch (err: any) {
    console.error('[Study Groups] Error ending session:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
