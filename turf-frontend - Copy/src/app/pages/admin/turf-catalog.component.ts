import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TurfService } from '../../core/services/turf.service';
import { Turf } from '../../core/models/turf.models';

@Component({
  selector: 'app-turf-catalog',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <section class="page-section">
      <div class="page-shell stack">
        <div class="section-title">
          <div>
            <div class="tag">Admin Turfs</div>
            <h2>All registered turf listings</h2>
          </div>
        </div>

        <div class="glass-card toolbar">
          <div>
            <strong>Location filter</strong>
            <p style="margin: 0.35rem 0 0; color: var(--muted);">
              Review venues by city or neighbourhood.
            </p>
          </div>
          <div class="field location-field">
            <label for="adminLocation">Location</label>
            <select
              id="adminLocation"
              [value]="selectedLocation()"
              (change)="selectedLocation.set(($any($event.target)).value)"
            >
              <option value="ALL">All locations</option>
              <option *ngFor="let location of locations()" [value]="location">{{ location }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-3">
          <article class="glass-card list-card" *ngFor="let turf of filteredTurfs()">
            <div class="section-title">
              <div>
                <h3>{{ turf.name }}</h3>
                <p>{{ turf.location }}</p>
              </div>
              <span class="tag">{{ turf.ownerUsername }}</span>
            </div>
            <p><strong>{{ turf.pricePerHour | currency:'INR' }}</strong> per hour</p>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .location-field {
        min-width: 220px;
      }
    `
  ]
})
export class TurfCatalogComponent {
  private readonly turfService = inject(TurfService);

  readonly turfs = signal<Turf[]>([]);
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
    this.turfService.getAvailableTurfs().subscribe({
      next: (response) => this.turfs.set(response.items),
      error: () => this.turfs.set([])
    });
  }
}
