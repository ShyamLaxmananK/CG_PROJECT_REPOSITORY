import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TurfService } from '../../core/services/turf.service';
import { Turf, TurfPayload } from '../../core/models/turf.models';

@Component({
  selector: 'app-manage-turfs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-section">
      <div class="page-shell grid grid-2">
        <div class="glass-card list-card">
          <div class="section-title">
            <div>
              <div class="tag">Venue Setup</div>
              <h2>Add a new venue</h2>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="save()" class="stack">
            <div class="form-grid">
              <div class="field">
                <label>Name</label>
                <input type="text" formControlName="name" />
              </div>
              <div class="field">
                <label>Location</label>
                <input type="text" formControlName="location" />
              </div>
              <div class="field">
                <label>Price per hour</label>
                <input type="number" formControlName="pricePerHour" />
              </div>
            </div>

            <button class="btn btn-primary" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Saving...' : 'Save venue' }}
            </button>
          </form>
        </div>

        <div class="glass-card list-card">
          <div class="section-title">
            <div>
              <h2>Your venues</h2>
              <p>Review pricing, locations, and live listings</p>
            </div>
          </div>

          <div class="stack" *ngIf="turfs().length; else emptyVenues">
            <article *ngFor="let turf of turfs()" class="glass-card list-card turf-card">
              <div class="section-title">
                <div>
                  <h3>{{ turf.name }}</h3>
                  <p>{{ turf.location }}</p>
                </div>
                <span class="tag">{{ turf.ownerUsername }}</span>
              </div>
              <p>{{ turf.pricePerHour }} per hour</p>
              <div class="action-row">
                <button class="btn btn-danger" (click)="remove(turf.id)">Delete</button>
              </div>
            </article>
          </div>
          <ng-template #emptyVenues>
            <p>No venues added yet. Create your first listing to start taking bookings.</p>
          </ng-template>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .turf-card {
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.65);
        border: 1px solid rgba(19, 33, 31, 0.06);
      }

      .action-row {
        display: flex;
        gap: 0.7rem;
      }
    `
  ]
})
export class ManageTurfsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly turfService = inject(TurfService);

  readonly turfs = signal<Turf[]>([]);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    pricePerHour: [0, Validators.required]
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.turfService.getOwnerTurfs().subscribe({
      next: (response) => this.turfs.set(response.items),
      error: () => this.turfs.set([])
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const payload = this.toPayload();
    this.saving.set(true);

    this.turfService.createTurf(payload).subscribe({
      next: () => {
        this.form.reset({
          name: '',
          location: '',
          pricePerHour: 0
        });
        this.load();
      },
      complete: () => this.saving.set(false)
    });
  }

  remove(turfId: number): void {
    this.turfService.deleteTurf(turfId).subscribe({
      next: () => this.load()
    });
  }

  private toPayload(): TurfPayload {
    return this.form.getRawValue();
  }
}
