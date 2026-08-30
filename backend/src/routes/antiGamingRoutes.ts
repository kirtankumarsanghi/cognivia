import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { 
  getRateLimitStatus, 
  resetRateLimit, 
  getAnomalyStats 
} from '../middleware/antiGamingMiddleware';

const router = Router();

/**
 * Get rate limit status for current user and concept
 */
router.get('/api/anti-gaming/status/:conceptId', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const conceptId = req.params.conceptId;
    
    const status = getRateLimitStatus(userId, conceptId);
    
    res.json({
      success: true,
      status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get global anomaly statistics (admin only)
 */
router.get('/api/anti-gaming/anomaly-stats', requireAuth, requireRole('admin', 'educator'), async (req, res) => {
  try {
    const stats = getAnomalyStats();
    
    // Get recent anomaly spikes from database
    const { data: recentSpikes } = await supabaseAdmin
      .from('anomaly_spikes')
      .select('*')
      .order('spike_time', { ascending: false })
      .limit(10);
    
    res.json({
      success: true,
      currentStats: stats,
      recentSpikes: recentSpikes || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get suspicious activity report (admin/educator only)
 */
router.get('/api/anti-gaming/suspicious-activity', requireAuth, requireRole('admin', 'educator'), async (req, res) => {
  try {
    const { data: suspiciousUsers, error } = await supabaseAdmin
      .from('suspicious_activity')
      .select('*')
      .order('violation_count', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      suspiciousUsers: suspiciousUsers || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get detailed violations for a student (admin/educator only)
 */
router.get('/api/anti-gaming/violations/:studentId', requireAuth, requireRole('admin', 'educator'), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const timeWindow = req.query.hours ? `${req.query.hours} hours` : '24 hours';
    
    // Get violations
    const { data: violations, error } = await supabaseAdmin
      .from('rate_limit_violations')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get rate limit stats
    const { data: stats } = await supabaseAdmin
      .rpc('get_student_rate_limit_stats', {
        p_student_id: studentId,
        p_time_window: timeWindow
      });
    
    res.json({
      success: true,
      violations: violations || [],
      stats: stats?.[0] || null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reset rate limit for a student (admin only)
 */
router.post('/api/anti-gaming/reset/:studentId/:conceptId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { studentId, conceptId } = req.params;
    
    resetRateLimit(studentId, conceptId);
    
    res.json({
      success: true,
      message: 'Rate limit reset successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get rate limit configuration (admin only)
 */
router.get('/api/anti-gaming/config', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { data: config, error } = await supabaseAdmin
      .from('rate_limit_config')
      .select('*')
      .order('config_key');
    
    if (error) throw error;
    
    res.json({
      success: true,
      config: config || []
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update rate limit configuration (admin only)
 */
router.put('/api/anti-gaming/config/:configKey', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { configKey } = req.params;
    const { value, description } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('rate_limit_config')
      .update({
        config_value: { value, description },
        updated_at: new Date().toISOString()
      })
      .eq('config_key', configKey)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      config: data,
      message: 'Configuration updated successfully. Note: Server restart may be required for changes to take effect.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get recent violations timeline (admin/educator only)
 */
router.get('/api/anti-gaming/violations-timeline', requireAuth, requireRole('admin', 'educator'), async (req, res) => {
  try {
    const hours = parseInt(req.query.hours as string) || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const { data: violations, error } = await supabaseAdmin
      .from('rate_limit_violations')
      .select('violation_type, created_at, student_id')
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group by hour and violation type
    const timeline: Record<string, Record<string, number>> = {};
    
    violations?.forEach(v => {
      const hour = new Date(v.created_at).toISOString().slice(0, 13) + ':00:00Z';
      if (!timeline[hour]) {
        timeline[hour] = {
          cooldown_violation: 0,
          spam_detection: 0,
          coordinated_spike: 0
        };
      }
      timeline[hour][v.violation_type]++;
    });
    
    res.json({
      success: true,
      timeline,
      totalViolations: violations?.length || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
