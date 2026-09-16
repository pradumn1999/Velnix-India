import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';

const router = Router();

// GET /api/pincode/:code - lookup serviceability and estimated delivery
router.get('/:code', (req: Request, res: Response) => {
  try {
    const result = store.lookupPincode(req.params.code);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
