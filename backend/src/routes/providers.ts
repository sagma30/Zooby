import { Router } from 'express';
import { ServiceProviderController } from '../controllers/ServiceProviderController';
import { requireAuth, requireRole, optionalAuth } from '../middlewares/auth';
import { UserRole } from '../constants/roles';

const router = Router();
const providerController = new ServiceProviderController();

router.get('/', optionalAuth, providerController.searchProviders); // Public search
router.get('/:providerId', optionalAuth, providerController.getProvider); // Public view
router.post('/', requireAuth, requireRole(UserRole.PROVIDER), providerController.createProvider);
router.put('/:providerId', requireAuth, providerController.updateProvider);

export default router;
