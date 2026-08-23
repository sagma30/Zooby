import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logout);

export default router;
