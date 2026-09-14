import { Router, Request, Response } from 'express';
import { store } from '../data/store';

const router = Router();

// GET /api/stats - dashboard overview metrics
router.get('/', (_req: Request, res: Response) => {
  try {
    const stats = store.getStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
