import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { BookingService } from '../services/BookingService';
import { successResponse } from '../utils/response';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  getBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const { status } = req.query;
      const bookings = await this.bookingService.getBookingsByUser(req.user.userId, status as string);
      return successResponse(res, { bookings });
    } catch (error) {
      next(error);
    }
  };

  getBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const booking = await this.bookingService.getBookingById(req.params.bookingId, req.user.userId, req.user.role);
      return successResponse(res, { booking });
    } catch (error) {
      next(error);
    }
  };

  createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const booking = await this.bookingService.createBooking(req.user.userId, req.body);
      return successResponse(res, { booking }, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  updateBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const { status } = req.body;
      const booking = await this.bookingService.updateBookingStatus(
        req.params.bookingId,
        req.user.userId,
        req.user.role,
        status
      );
      return successResponse(res, { booking }, 'Booking status updated');
    } catch (error) {
      next(error);
    }
  };

  cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new Error('User not authenticated'));
      }

      const booking = await this.bookingService.cancelBooking(req.params.bookingId, req.user.userId, req.user.role);
      return successResponse(res, { booking }, 'Booking cancelled');
    } catch (error) {
      next(error);
    }
  };
}
