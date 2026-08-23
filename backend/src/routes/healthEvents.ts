import { Router } from 'express';
import { HealthEventController } from '../controllers/HealthEventController';
import { requireAuth } from '../middlewares/auth';

const router = Router();
const healthEventController = new HealthEventController();

// Health events for a specific pet
router.get('/pets/:petId/health-events', requireAuth, healthEventController.getHealthEvents);
router.post('/pets/:petId/health-events', requireAuth, healthEventController.createHealthEvent);

// Update/delete specific health event
router.put('/health-events/:eventId', requireAuth, healthEventController.updateHealthEvent);
router.delete('/health-events/:eventId', requireAuth, healthEventController.deleteHealthEvent);

export default router;
