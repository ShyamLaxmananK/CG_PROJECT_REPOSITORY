import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import {
  Booking,
  CreateBookingPayload
} from '../models/booking.models';
import { ApiListResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BookingService extends ApiBaseService {
  createBooking(payload: CreateBookingPayload) {
    return this.http.post<Booking>(
      this.url(`${this.environment.endpoints.bookings}/create/${payload.turfId}`),
      {
        slotTime: payload.slotTime
      }
    );
  }

  getSlots(turfId: number) {
    return this.http.get<string[]>(
      this.url(`${this.environment.endpoints.slots}/${turfId}`)
    );
  }

  getMyBookings() {
    return this.http
      .get<Booking[]>(this.url(`${this.environment.endpoints.bookings}/my`))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Booking>)));
  }

  getOwnerBookings() {
    return this.http
      .get<Booking[]>(this.url(`${this.environment.endpoints.bookings}/owner`))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Booking>)));
  }

  getAllBookings() {
    return this.http
      .get<Booking[]>(this.url(`${this.environment.endpoints.bookings}/all`))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Booking>)));
  }

  cancelBooking(bookingId: number) {
    return this.http.delete<string>(
      this.url(`${this.environment.endpoints.bookings}/cancel/${bookingId}`)
    );
  }
}
