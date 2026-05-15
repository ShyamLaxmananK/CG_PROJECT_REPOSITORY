import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Booking } from '../../core/models/booking.models';
import { loadLastBooking } from '../../core/utils/demo-booking-storage';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <div class="glass-card confirmation-card">
          <div class="tag">Booking Confirmed</div>
          <h2>Booking confirmed</h2>
          <p class="lead">
            Kindly show booking ID and pay directly at location.
          </p>

          <div class="booking-id-card">
            <span>Booking ID</span>
            <strong>{{ bookingId() }}</strong>
          </div>

          <div *ngIf="booking()" class="details">
            <p><strong>Turf:</strong> {{ booking()?.turfName || ('Booking #' + booking()?.id) }}</p>
            <p><strong>Timing:</strong> {{ booking()?.slotTime || 'Timing pending' }}</p>
            <p><strong>Status:</strong> {{ booking()?.status || 'CREATED' }}</p>
          </div>

          <div class="actions">
            <a class="btn btn-primary" routerLink="/customer/bookings">View my bookings</a>
            <a class="btn btn-secondary" routerLink="/customer">Back to dashboard</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .confirmation-card {
        padding: 2rem;
        max-width: 760px;
        margin: 0 auto;
      }

      .lead {
        color: var(--muted);
        margin-top: 0.5rem;
      }

      .booking-id-card {
        margin: 1.5rem 0;
        padding: 1.25rem;
        border-radius: 22px;
        background: rgba(19, 121, 91, 0.1);
        display: grid;
        gap: 0.35rem;
      }

      .booking-id-card span {
        color: var(--muted);
        font-size: 0.92rem;
      }

      .booking-id-card strong {
        font-size: 2rem;
        font-family: "Space Grotesk", "DM Sans", sans-serif;
        color: var(--brand-strong);
      }

      .details {
        display: grid;
        gap: 0.6rem;
        margin-bottom: 1.5rem;
      }

      .details p {
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
      }
    `
  ]
})
export class BookingSuccessComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly storedBooking = signal<Booking | null>(this.loadBooking());

  readonly booking = computed(() => this.storedBooking());
  readonly bookingId = computed(
    () => this.route.snapshot.queryParamMap.get('bookingId') || String(this.booking()?.id || '')
  );

  private loadBooking(): Booking | null {
    return loadLastBooking();
  }
}
