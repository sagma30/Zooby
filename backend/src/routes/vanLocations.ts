import { Router } from 'express';
import { VanLocationController } from '../controllers/VanLocationController';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { UserRole } from '../constants/roles';

const router = Router();
const controller = new VanLocationController();

// Van worker submits real-time device location
router.post(
  '/:vanId/location',
  requireAuth,
  requireRole(UserRole.VAN_WORKER, UserRole.ADMIN),
  controller.updateLocation
);

// Real-time SSE stream for authorized clients
router.get('/stream', optionalAuth, controller.streamLocations);

// Admin queries all fleet locations
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.ADMIN),
  controller.getAllLocationsForAdmin
);

// Authorized client fetches specific van location
router.get('/:vanId/location', optionalAuth, controller.getLocation);

export default router;
