import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware, requireRole('admin'), (req, res) => {
  res.json({ ok: true, role: req.user?.role });
});

export default router;
