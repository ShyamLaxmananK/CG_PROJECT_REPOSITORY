import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(private http: HttpClient) {}

  createBooking(turfId: number) {

    const token = localStorage.getItem('token');

    if (!token) {
      alert('Please login before booking ❌');
      throw new Error('JWT token missing');
    }

    // Try to read customerId from storage
    let customerId = localStorage.getItem('customerId');

    // If missing, decode from JWT automatically
    if (!customerId) {

      try {

        const payload = JSON.parse(
          atob(token.split('.')[1])
        );

        customerId =
          payload.id ||
          payload.customerId ||
          payload.userId;

        if (!customerId) {
          throw new Error('customerId not found inside token');
        }

        localStorage.setItem(
          'customerId',
          String(customerId)
        );

      } catch (err) {

        console.error(err);

        alert('Unable to identify logged-in user ❌');

        throw err;
      }
    }

    const bookingData = {

      customerId: Number(customerId),

      turfId: turfId,

      bookingDate: this.getTodayDate(),

      startTime: "10:00",

      endTime: "11:00"

    };

    return this.http.post(
      `${environment.apiUrl}/bookings`,
      bookingData
    );
  }

  private getTodayDate(): string {

    const today = new Date();

    return today.toISOString().split('T')[0];
  }
}