import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { BookingService } from '../../core/services/booking.service';
import { TurfService } from '../../core/services/turf.service';
import { Booking } from '../../core/models/booking.models';
import { AdminOverview } from '../../core/models/dashboard.models';
import { AuthUser } from '../../core/models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Admin</div>
            <h2>Review customers, owners, turfs, and booking activity.</h2>
          </div>
          <div class="actions">
            <a class="btn btn-secondary" routerLink="/admin/users">View customers</a>
            <a class="btn btn-primary" routerLink="/admin/turfs">View turfs</a>
          </div>
        </div>

        <div class="grid grid-2" *ngIf="overview() as data">
          <article class="glass-card metric-card">
            <h3>Customers</h3>
            <p class="metric-value">{{ data.totalCustomers }}</p>
          </article>
          <article class="glass-card metric-card">
            <h3>Owners</h3>
            <p class="metric-value">{{ data.totalOwners }}</p>
          </article>
          <article class="glass-card metric-card">
            <h3>Total turfs</h3>
            <p class="metric-value">{{ data.totalTurfs }}</p>
          </article>
          <article class="glass-card metric-card">
            <h3>Total bookings</h3>
            <p class="metric-value">{{ data.totalBookings }}</p>
          </article>
        </div>

        <div class="glass-card list-card">
          <div class="section-title">
            <div>
              <h3>Recent bookings</h3>
              <p>Latest booking movement across the platform</p>
            </div>
          </div>
          <div class="stack" *ngIf="bookings().length; else noAdminBookings">
            <div *ngFor="let booking of bookings()" class="booking-row">
              <div>
                <strong>{{ booking.turfName || ('Booking #' + booking.id) }}</strong>
                <p>{{ booking.customerUsername }} | {{ booking.slotTime || booking.bookingTime || 'Time unavailable' }}</p>
              </div>
              <span class="status-pill" [ngClass]="'status-' + booking.status.toLowerCase()">
                {{ booking.status }}
              </span>
            </div>
          </div>
          <ng-template #noAdminBookings>
            <p>No booking activity available right now.</p>
          </ng-template>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .actions {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
      }

      .booking-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
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
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);
  private readonly bookingService = inject(BookingService);
  private readonly turfService = inject(TurfService);

  readonly bookings = signal<Booking[]>([]);
  readonly overview = signal<AdminOverview | null>(null);
  readonly users = signal<AuthUser[]>([]);
  readonly totalTurfs = signal(0);

  constructor() {
    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.users.set(response.items);
        this.syncOverview();
      },
      error: () => {
        this.users.set([]);
        this.syncOverview();
      }
    });

    this.bookingService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings.set(response.items.slice(0, 8));
        this.syncOverview(response.items.length);
      },
      error: () => {
        this.bookings.set([]);
        this.syncOverview(0);
      }
    });

    this.turfService.getAvailableTurfs().subscribe({
      next: (response) => {
        this.totalTurfs.set(response.items.length);
        this.syncOverview();
      },
      error: () => {
        this.totalTurfs.set(0);
        this.syncOverview();
      }
    });
  }

  private syncOverview(totalBookings = this.bookings().length): void {
    const users = this.users();
    const totalCustomers = users.filter((user) => user.role === 'CUSTOMER').length;
    const totalOwners = users.filter((user) => user.role === 'OWNER').length;

    this.overview.set({
      totalCustomers,
      totalOwners,
      totalBookings,
      totalRevenue: 0,
      totalTurfs: this.totalTurfs()
    });
  }
}
