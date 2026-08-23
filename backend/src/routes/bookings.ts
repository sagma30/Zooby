import { Router } from 'express';
import { BookingController } from '../controllers/BookingController';
import { requireAuth, requireRole } from '../middlewares/auth';
import { UserRole } from '../constants/roles';

const router = Router();
const bookingController = new BookingController();

router.get('/', requireAuth, bookingController.getBookings);
router.post('/', requireAuth, requireRole(UserRole.PET_PARENT), bookingController.createBooking);
router.get('/:bookingId', requireAuth, bookingController.getBooking);
router.put('/:bookingId/status', requireAuth, bookingController.updateBookingStatus);
router.delete('/:bookingId', requireAuth, bookingController.cancelBooking);

export default router;
