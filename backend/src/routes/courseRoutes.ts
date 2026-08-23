import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { courseController } from '../controllers/courseController';

const router = Router();

// Publicly readable endpoints (for authenticated users)
router.get('/api/courses', requireAuth, courseController.getCourses);
router.get('/api/courses/:id', requireAuth, courseController.getCourseById);

// Educator-only write endpoints
router.post('/api/courses', requireAuth, requireRole(['educator']), courseController.createCourse);
router.post('/api/courses/:id/lessons', requireAuth, requireRole(['educator']), courseController.addLesson);
router.post('/api/lessons/:id/concepts', requireAuth, requireRole(['educator']), courseController.addConcept);

export default router;
