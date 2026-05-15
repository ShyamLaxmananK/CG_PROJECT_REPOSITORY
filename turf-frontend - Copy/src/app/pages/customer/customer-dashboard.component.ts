import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TurfService } from '../../core/services/turf.service';
import { BookingService } from '../../core/services/booking.service';
import { Turf } from '../../core/models/turf.models';
import { Booking } from '../../core/models/booking.models';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state.component';
import { mergeBookingsWithDemo } from '../../core/utils/demo-booking-storage';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, EmptyStateComponent, LoadingStateComponent],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Player Space</div>
            <h2>Explore available venues and book by location.</h2>
          </div>
        </div>

        <div *ngIf="bookingMessage()" class="glass-card success-banner">
          <strong>{{ bookingMessage() }}</strong>
        </div>

        <div class="glass-card toolbar">
          <div>
            <strong>Find turfs by location</strong>
            <p style="margin: 0.35rem 0 0; color: var(--muted);">
              Filter the available grounds by city or area before you reserve a slot.
            </p>
          </div>
          <div class="field location-field">
            <label for="locationFilter">Location</label>
            <select
              id="locationFilter"
              [value]="selectedLocation()"
              (change)="selectedLocation.set(($any($event.target)).value)"
            >
              <option value="ALL">All locations</option>
              <option *ngFor="let location of locations()" [value]="location">{{ location }}</option>
            </select>
          </div>
          <button class="btn btn-primary" (click)="loadTurfs()">Refresh list</button>
        </div>

        <div class="grid grid-3" *ngIf="!loading(); else busy">
          <article class="glass-card list-card" *ngFor="let turf of filteredTurfs()">
            <img class="card-image" src="/media/players-action.svg" alt="Turf sports preview" />

            <div class="section-title">
              <div>
                <h3>{{ turf.name }}</h3>
                <p>{{ turf.location }}</p>
              </div>
              <span class="tag">{{ turf.ownerUsername }}</span>
            </div>

            <p>Hosted by {{ turf.ownerUsername }}</p>
            <p><strong>{{ turf.pricePerHour | currency:'INR' }}</strong> per hour</p>
            <div style="margin-top: 1rem;">
              <a class="btn btn-primary" [routerLink]="['/booking', turf.id]">Reserve turf</a>
            </div>
          </article>
        </div>

        <app-empty-state
          *ngIf="!loading() && !filteredTurfs().length"
          title="No available turfs"
          message="Try another location or refresh the listings again in a moment."
        />

        <section class="grid grid-2">
          <div class="glass-card list-card">
            <div class="section-title">
              <div>
                <h3>Recent bookings</h3>
                <p>Your latest reservations in one place</p>
              </div>
              <a routerLink="/customer/bookings">View all</a>
            </div>
            <div class="stack" *ngIf="recentBookings().length; else emptyBookings">
              <div *ngFor="let booking of recentBookings()" class="booking-row">
                <div>
                  <strong>{{ booking.turfName || ('Booking #' + booking.id) }}</strong>
                  <p>{{ booking.slotTime || 'Timing pending' }} | {{ booking.bookingTime || booking.customerUsername }}</p>
                </div>
                <span class="status-pill" [ngClass]="'status-' + booking.status.toLowerCase()">
                  {{ booking.status }}
                </span>
              </div>
            </div>
            <ng-template #emptyBookings>
              <p>No bookings yet.</p>
            </ng-template>
          </div>

          <div class="glass-card list-card">
            <div class="section-title">
              <div>
                <h3>What you can do</h3>
                <p>Customer-side functionality in one glance</p>
              </div>
            </div>
            <ol class="flow-list">
              <li>Register and sign in as a customer.</li>
              <li>Filter turfs by location before selecting a venue.</li>
              <li>Choose a slot and confirm the booking.</li>
              <li>View or cancel bookings from your bookings page.</li>
            </ol>
          </div>
        </section>
      </div>
    </section>

    <ng-template #busy>
      <div class="page-shell">
        <app-loading-state />
      </div>
    </ng-template>
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

      .success-banner {
        padding: 1rem 1.2rem;
        color: var(--success);
        background: rgba(28, 139, 87, 0.1);
      }

      .location-field {
        min-width: 220px;
      }

      .card-image {
        width: 100%;
        display: block;
        border-radius: 20px;
        margin-bottom: 1rem;
      }

      .flow-list {
        margin: 0;
        padding-left: 1.1rem;
        color: var(--muted);
        display: grid;
        gap: 0.8rem;
      }
    `
  ]
})
export class CustomerDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly turfService = inject(TurfService);
  private readonly bookingService = inject(BookingService);

  readonly loading = signal(true);
  readonly turfs = signal<Turf[]>([]);
  readonly recentBookings = signal<Booking[]>([]);
  readonly bookingMessage = signal('');
  readonly selectedLocation = signal('ALL');

  readonly locations = computed(() =>
    [...new Set(this.turfs().map((turf) => turf.location).filter(Boolean))].sort()
  );

  readonly filteredTurfs = computed(() => {
    if (this.selectedLocation() === 'ALL') {
      return this.turfs();
    }

    return this.turfs().filter((turf) => turf.location === this.selectedLocation());
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.bookingMessage.set(
        params.get('bookingSuccess') === '1'
          ? 'Booking created successfully. Your latest reservation is shown below.'
          : ''
      );
    });

    this.loadTurfs();
    this.loadBookings();
  }

  loadTurfs(): void {
    this.loading.set(true);

    this.turfService.getAvailableTurfs().subscribe({
      next: (response) => this.turfs.set(response.items),
      error: () => this.turfs.set([]),
      complete: () => this.loading.set(false)
    });
  }

  private loadBookings(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (response) => this.recentBookings.set(mergeBookingsWithDemo(response.items).slice(0, 5)),
      error: () => this.recentBookings.set(mergeBookingsWithDemo([]).slice(0, 5))
    });
  }
}
