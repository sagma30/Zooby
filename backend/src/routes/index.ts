import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import petRoutes from './pets';
import healthEventRoutes from './healthEvents';
import providerRoutes from './providers';
import bookingRoutes from './bookings';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/', healthEventRoutes); // Health events routes have pets/:petId prefix
router.use('/providers', providerRoutes);
router.use('/bookings', bookingRoutes);

export default router;
