import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page-section">
      <div class="page-shell auth-shell">
        <div class="glass-card auth-card">
          <div class="section-title">
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to continue with your bookings, turf management, or admin access.</p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
            <div class="field">
              <label for="username">Username</label>
              <input id="username" type="text" formControlName="username" />
            </div>

            <div class="field">
              <label for="password">Password</label>
              <input id="password" type="password" formControlName="password" />
            </div>

            <p *ngIf="error()" class="error-text">{{ error() }}</p>

            <button class="btn btn-primary" [disabled]="form.invalid || loading()">
              {{ loading() ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>

          <p class="helper-text">
            Need an account?
            <a routerLink="/register">Register here</a>
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-shell {
        display: grid;
        place-items: center;
        min-height: 65vh;
      }

      .auth-card {
        width: min(520px, 100%);
        padding: 2rem;
      }

      .error-text {
        color: var(--danger);
        margin: 0;
      }

      .helper-text {
        color: var(--muted);
      }

      .helper-text a {
        color: var(--brand-strong);
        font-weight: 600;
      }
    `
  ]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        const targetByRole = {
          CUSTOMER: '/customer',
          OWNER: '/owner',
          ADMIN: '/admin'
        } as const;

        this.router.navigateByUrl(targetByRole[response.user.role]);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('We could not sign you in. Please check your username and password.');
      },
      complete: () => this.loading.set(false)
    });
  }
}
