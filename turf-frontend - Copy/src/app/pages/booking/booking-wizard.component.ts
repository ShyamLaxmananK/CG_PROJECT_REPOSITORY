import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { TurfService } from '../../core/services/turf.service';
import { Turf } from '../../core/models/turf.models';
import { BookingService } from '../../core/services/booking.service';
import { AuthStore } from '../../core/store/auth.store';
import { Booking } from '../../core/models/booking.models';
import { storeDemoBooking } from '../../core/utils/demo-booking-storage';

@Component({
  selector: 'app-booking-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="page-section">
      <div class="page-shell grid grid-2">

        <div class="glass-card list-card" *ngIf="turf() as selectedTurf">

          <div class="tag">{{ selectedTurf.ownerUsername }}</div>

          <h2>{{ selectedTurf.name }}</h2>

          <p>{{ selectedTurf.location }}</p>

          <p>Owner: {{ selectedTurf.ownerUsername }}</p>

          <p>
            <strong>
              {{ selectedTurf.pricePerHour | currency:'INR' }}
            </strong>
            per hour
          </p>

        </div>


        <div class="glass-card list-card">

          <div class="section-title">
            <div>
              <h2>Confirm your reservation</h2>
              <p>Select your preferred time slot and confirm booking.</p>
            </div>
          </div>


          <form class="stack">

            <div class="stack" *ngIf="slots().length; else noSlots">

              <strong>Available timings</strong>

              <div class="slot-grid">

                <button
                  *ngFor="let slot of slots()"
                  type="button"
                  class="slot-button"
                  [class.slot-active]="selectedSlot() === slot"
                  (click)="selectedSlot.set(slot)"
                >
                  {{ slot }}
                </button>

              </div>

              <p class="hint-text">
                Selected slot:
                <strong>{{ selectedSlot() || 'Choose a timing' }}</strong>
              </p>

            </div>


            <ng-template #noSlots>
              <p class="hint-text">
                No time slots available right now.
              </p>
            </ng-template>


            <p *ngIf="error()" class="error-text">
              {{ error() }}
            </p>


            <button
              type="button"
              class="btn btn-primary"
              [disabled]="loading() || !selectedSlot()"
              (click)="submit()"
            >
              {{ loading() ? 'Confirming booking...' : 'Create booking now' }}
            </button>

          </form>

        </div>

      </div>
    </section>
  `,
  styles: [
    `
      .slot-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .slot-button {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 0.65rem 0.9rem;
        background: rgba(255, 255, 255, 0.9);
        color: var(--text);
        cursor: pointer;
      }

      .slot-active {
        background: linear-gradient(135deg, var(--brand), var(--brand-strong));
        color: #fff;
        border-color: transparent;
        box-shadow: 0 10px 24px rgba(19, 121, 91, 0.2);
      }

      .hint-text {
        color: var(--muted);
        margin: 0;
      }

      .error-text {
        color: var(--danger);
        margin: 0;
        font-weight: 600;
      }
    `
  ]
})
export class BookingWizardComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly turfService = inject(TurfService);
  private readonly bookingService = inject(BookingService);
  private readonly authStore = inject(AuthStore);

  readonly turf = signal<Turf | null>(null);
  readonly slots = signal<string[]>([]);
  readonly selectedSlot = signal('');
  readonly error = signal('');
  readonly loading = signal(false);


  constructor() {

    const turfId = Number(
      this.route.snapshot.paramMap.get('turfId')
    );

    if (!turfId) {
      this.error.set('Venue not found.');
      return;
    }


    this.turfService.getTurfById(turfId).subscribe({
      next: turf => this.turf.set(turf),
      error: () => this.error.set('Could not load turf details.')
    });

    this.loadSlots(turfId);

  }


  submit(): void {

    const turf = this.turf();

    if (!turf) {
      this.error.set('Venue still loading.');
      return;
    }

    const slotTime = this.selectedSlot();

    if (!slotTime) {
      this.error.set('Please select a slot.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.bookingService.createBooking({
      turfId: turf.id,
      slotTime
    }).subscribe({
      next: (booking) => this.finishBooking({
        ...booking,
        turfName: turf.name,
        customerUsername:
          booking.customerUsername || this.authStore.user()?.username || 'Customer',
        slotTime: booking.slotTime || slotTime,
        bookingTime: booking.bookingTime || new Date().toLocaleString(),
        status: booking.status || 'CREATED'
      }),
      error: (errorResponse) => {
        const serverMessage =
          errorResponse?.error?.message ||
          errorResponse?.error?.error ||
          '';

        const message =
          serverMessage || 'Booking could not be saved. Please make sure the booking service is running.';

        this.error.set(message);
        window.alert(message);
      },
      complete: () => this.loading.set(false)
    });
  }

  private loadSlots(turfId: number): void {
    this.bookingService.getSlots(turfId).subscribe({
      next: (slots) => {
        const available = slots.length ? slots : this.fallbackSlots();
        this.slots.set(available);
        this.selectedSlot.set(available[0] || '');
      },
      error: () => {
        const available = this.fallbackSlots();
        this.slots.set(available);
        this.selectedSlot.set(available[0] || '');
      }
    });
  }

  private finishBooking(booking: Booking): void {
    storeDemoBooking(booking);
    window.alert(`Booking successful. Your booking ID is ${booking.id}.`);

    window.location.assign(
      `/booking-confirmed.html?bookingId=${booking.id}&success=1`
    );
  }

  private fallbackSlots(): string[] {
    return [
      '06:00 AM - 07:00 AM',
      '07:00 AM - 08:00 AM',
      '05:00 PM - 06:00 PM',
      '06:00 PM - 07:00 PM'
    ];
  }

}
