import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { listUsers } from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

router.get('/', listUsers);

export default router;
