import { Router } from 'express';
import { EmergencyController } from '../controllers/EmergencyController';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { UserRole } from '../constants/roles';

const router = Router();
const controller = new EmergencyController();

// Triage evaluation (AI safety assessment preview)
router.post('/triage', optionalAuth, controller.evaluateTriage);

// Dispatch 24/7 Rapid SOS
router.post('/dispatch', optionalAuth, controller.createAndDispatchSOS);

// Real-time SSE stream for emergency events
router.get('/stream', optionalAuth, controller.streamEmergencies);

// Current user or worker active emergency lookup
router.get('/active', requireAuth, controller.getActiveIncident);

// Admin view of all emergency incidents
router.get(
  '/admin/all',
  requireAuth,
  requireRole(UserRole.ADMIN),
  controller.getAllForAdmin
);

// Incident details by ID
router.get('/:incidentId', optionalAuth, controller.getIncident);

// Update status (Worker accepting, arriving, or Parent resolving)
router.put('/:incidentId/status', requireAuth, controller.updateStatus);

export default router;
