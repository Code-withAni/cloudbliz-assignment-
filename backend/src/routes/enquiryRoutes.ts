import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createEnquiry,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  updateEnquiry,
} from '../controllers/enquiryController';

const router = Router();

router.use(authMiddleware);

router.post('/', createEnquiry);
router.get('/', listEnquiries);
router.get('/:id', getEnquiry);
router.put('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

export default router;
