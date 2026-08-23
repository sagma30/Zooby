import { Router } from 'express';
import { PetController } from '../controllers/PetController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { UserRole } from '../constants/roles';

const router = Router();
const petController = new PetController();

router.get('/', requireAuth, requireRole(UserRole.PET_PARENT, UserRole.ADMIN), petController.getPets);
router.post('/', requireAuth, requireRole(UserRole.PET_PARENT, UserRole.ADMIN), petController.createPet);
router.get('/:petId', requireAuth, petController.getPet);
router.put('/:petId', requireAuth, petController.updatePet);
router.delete('/:petId', requireAuth, petController.deletePet);

export default router;
