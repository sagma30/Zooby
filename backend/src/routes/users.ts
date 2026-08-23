import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);

export default router;
