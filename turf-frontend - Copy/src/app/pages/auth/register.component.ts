import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-section">
      <div class="page-shell">
        <div class="glass-card auth-card">
          <div class="section-title">
            <div>
              <h2>Create account</h2>
              <p>Set up a customer or owner profile and start using the platform right away.</p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
            <div class="form-grid">
              <div class="field">
                <label for="username">Username</label>
                <input id="username" type="text" formControlName="username" />
              </div>
              <div class="field">
                <label for="role">Role</label>
                <select id="role" formControlName="role">
                  <option value="ROLE_CUSTOMER">Customer</option>
                  <option value="ROLE_OWNER">Owner</option>
                </select>
              </div>
              <div class="field" style="grid-column: 1 / -1;">
                <label for="password">Password</label>
                <input id="password" type="password" formControlName="password" />
              </div>
            </div>

            <p *ngIf="error()" class="error-text">{{ error() }}</p>

            <button class="btn btn-primary" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Creating account...' : 'Register' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-card {
        padding: 2rem;
      }

      .error-text {
        color: var(--danger);
        margin: 0;
      }
    `
  ]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['ROLE_CUSTOMER' as const, Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.router.navigateByUrl(response.user.role === 'OWNER' ? '/owner' : '/customer');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Registration could not be completed. Please try again.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
