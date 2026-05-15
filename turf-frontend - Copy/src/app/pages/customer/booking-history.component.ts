import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking.models';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import {
  loadDemoBookings,
  mergeBookingsWithDemo,
  updateDemoBooking
} from '../../core/utils/demo-booking-storage';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent, LoadingStateComponent],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Reservations</div>
            <h2>My bookings</h2>
          </div>
        </div>

        <app-loading-state *ngIf="loading()" />

        <div class="stack" *ngIf="!loading() && bookings().length">
          <article class="glass-card list-card" *ngFor="let booking of bookings()">
            <div class="section-title">
              <div>
                <h3>{{ booking.turfName || ('Booking #' + booking.id) }}</h3>
                <p>{{ booking.slotTime || 'Timing pending' }} | {{ booking.bookingTime || 'Schedule pending' }}</p>
              </div>
              <span class="status-pill" [ngClass]="'status-' + booking.status.toLowerCase()">
                {{ booking.status }}
              </span>
            </div>
            <p>Booked by {{ booking.customerUsername }}</p>
            <button
              *ngIf="booking.status !== 'CANCELLED'"
              class="btn btn-danger"
              (click)="cancel(booking.id)"
            >
              Cancel booking
            </button>
          </article>
        </div>

        <app-empty-state
          *ngIf="!loading() && !bookings().length"
          title="No bookings yet"
          message="Your confirmed reservations will appear here once you start booking venues."
        />
      </div>
    </section>
  `
})
export class BookingHistoryComponent {
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly bookings = signal<Booking[]>([]);

  constructor() {
    this.loadBookings();
  }

  cancel(bookingId: number): void {
    this.bookingService.cancelBooking(bookingId).subscribe({
      next: () => {
        updateDemoBooking(bookingId, { status: 'CANCELLED' });
        this.loadBookings();
      },
      error: () => {
        updateDemoBooking(bookingId, { status: 'CANCELLED' });
        this.bookings.set(
          this.bookings().map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: 'CANCELLED' }
              : booking
          )
        );
      }
    });
  }

  private loadBookings(): void {
    this.loading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (response) => this.bookings.set(mergeBookingsWithDemo(response.items)),
      error: () => this.bookings.set(loadDemoBookings()),
      complete: () => this.loading.set(false)
    });
  }
}
