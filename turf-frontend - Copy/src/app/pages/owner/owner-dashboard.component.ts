import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { TurfService } from '../../core/services/turf.service';
import { Booking } from '../../core/models/booking.models';
import { Turf } from '../../core/models/turf.models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Venue Partner</div>
            <h2>Manage your listings and stay ahead of every reservation.</h2>
          </div>
          <a class="btn btn-primary" routerLink="/owner/turfs">Manage venues</a>
        </div>

        <div class="grid grid-3">
          <article class="glass-card metric-card">
            <h3>Total venues</h3>
            <p class="metric-value">{{ turfs().length }}</p>
          </article>
          <article class="glass-card metric-card">
            <h3>Reservations</h3>
            <p class="metric-value">{{ bookings().length }}</p>
          </article>
          <article class="glass-card metric-card">
            <h3>Latest update</h3>
            <p class="metric-value">{{ latestStatus() }}</p>
          </article>
        </div>

        <div class="grid grid-2">
          <div class="glass-card list-card">
            <div class="section-title">
              <div>
                <h3>Your venues</h3>
                <p>Active listings available for players to book</p>
              </div>
            </div>
            <div class="stack" *ngIf="turfs().length; else noOwnerTurfs">
              <div *ngFor="let turf of turfs()" class="booking-row">
                <div>
                  <strong>{{ turf.name }}</strong>
                  <p>{{ turf.location }}</p>
                </div>
                <span class="tag">{{ turf.pricePerHour | currency:'INR' }}/hr</span>
              </div>
            </div>
            <ng-template #noOwnerTurfs>
              <p>No venues published yet.</p>
            </ng-template>
          </div>

          <div class="glass-card list-card">
            <div class="section-title">
              <div>
                <h3>Recent reservations</h3>
                <p>Latest player activity across your listings</p>
              </div>
            </div>
            <div class="stack" *ngIf="bookings().length; else noOwnerBookings">
              <div *ngFor="let booking of bookings()" class="booking-row">
                <div>
                  <strong>{{ booking.turfName || ('Booking #' + booking.id) }}</strong>
                  <p>{{ booking.customerUsername }} | {{ booking.bookingTime || 'Time unavailable' }}</p>
                </div>
                <span class="status-pill" [ngClass]="'status-' + booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
            </div>
            <ng-template #noOwnerBookings>
              <p>No reservations yet.</p>
            </ng-template>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .booking-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: center;
        border-bottom: 1px solid var(--line);
        padding-bottom: 0.85rem;
      }

      .booking-row p {
        margin: 0.25rem 0 0;
        color: var(--muted);
      }
    `
  ]
})
export class OwnerDashboardComponent {
  private readonly bookingService = inject(BookingService);
  private readonly turfService = inject(TurfService);

  readonly bookings = signal<Booking[]>([]);
  readonly latestStatus = signal('N/A');
  readonly turfs = signal<Turf[]>([]);

  constructor() {
    this.turfService.getOwnerTurfs().subscribe({
      next: (response) => this.turfs.set(response.items),
      error: () => this.turfs.set([])
    });

    this.bookingService.getOwnerBookings().subscribe({
      next: (response) => {
        this.bookings.set(response.items);
        this.latestStatus.set(response.items[0]?.status ?? 'N/A');
      },
      error: () => {
        this.bookings.set([]);
        this.latestStatus.set('N/A');
      }
    });
  }
}
