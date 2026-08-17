import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';
import {
  createUser,
  deleteUser,
  listAssignableUsers,
  listUsers,
  updateUser,
} from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

router.get('/assignable', listAssignableUsers);

router.use(requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
