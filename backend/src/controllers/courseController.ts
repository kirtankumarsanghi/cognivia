import { Request, Response } from 'express';
import { courseService } from '../services/courseService';

export const courseController = {
  async getCourses(req: Request, res: Response) {
    try {
      const data = await courseService.getCourses();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getCourseById(req: Request, res: Response) {
    try {
      const data = await courseService.getCourseById(req.params.id);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async createCourse(req: Request, res: Response) {
    const { name, code, description } = req.body;
    const educatorId = (req as any).user.id;
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    try {
      const data = await courseService.createCourse(name, code, description, educatorId);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async addLesson(req: Request, res: Response) {
    const { title, description, orderNumber } = req.body;
    const { id: courseId } = req.params;

    if (!title || orderNumber === undefined) {
      return res.status(400).json({ error: 'Title and orderNumber are required' });
    }

    try {
      const data = await courseService.addLesson(courseId, title, description, orderNumber);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async addConcept(req: Request, res: Response) {
    const { name, description, difficulty } = req.body;
    const { id: lessonId } = req.params;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const data = await courseService.addConcept(lessonId, name, description, difficulty);
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
