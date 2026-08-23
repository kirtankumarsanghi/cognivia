import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getRevisionPlan, generateSmartPlan, completeRevision, deleteRevisionPlan } from '../controllers/revisionController';

const router = Router();

// Get revision plan (auto-generates if empty)
router.get('/api/revision/plan', requireAuth, getRevisionPlan);

// Generate smart revision plan using AI-powered recommendations
router.post('/api/revision/generate', requireAuth, generateSmartPlan);

// Mark revision as complete
router.post('/api/revision/:id/complete', requireAuth, completeRevision);

// Delete revision plan item
router.delete('/api/revision/:id', requireAuth, deleteRevisionPlan);

export default router;
