import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../core/store/auth.store';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-main-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="page-shell topbar">
      <a routerLink="/" class="brand">
        <span class="brand-badge">GF</span>
        <div>
          <strong>GroundFlow</strong>
          <small>Sports Venue Booking</small>
        </div>
      </a>

      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/faq" routerLinkActive="active">FAQ</a>
        <a routerLink="/contact" routerLinkActive="active">Contact Us</a>
        <a *ngIf="role() === 'CUSTOMER'" routerLink="/customer" routerLinkActive="active">Customer</a>
        <a *ngIf="role() === 'OWNER'" routerLink="/owner" routerLinkActive="active">Owner</a>
        <a *ngIf="role() === 'ADMIN'" routerLink="/admin" routerLinkActive="active">Admin</a>
        <a *ngIf="role() === 'CUSTOMER'" routerLink="/payments" routerLinkActive="active">Payments</a>
      </nav>

      <div class="actions">
        <div *ngIf="user()" class="user-chip">
          <span>{{ user()?.username || user()?.fullName }}</span>
          <small>{{ user()?.role }}</small>
        </div>
        <a *ngIf="!isAuthenticated()" routerLink="/login" class="btn btn-secondary">Sign in</a>
        <a *ngIf="!isAuthenticated()" routerLink="/register" class="btn btn-primary">Create account</a>
        <button *ngIf="isAuthenticated()" class="btn btn-secondary" (click)="logout()">Sign out</button>
      </div>
    </header>

    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.2rem 0;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.9rem;
      }

      .brand strong,
      .brand small {
        display: block;
      }

      .brand strong {
        font-family: "Space Grotesk", "DM Sans", sans-serif;
        font-size: 1.05rem;
      }

      .brand small {
        color: var(--muted);
      }

      .brand-badge {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        color: #fff;
        background:
          linear-gradient(135deg, rgba(221, 139, 61, 0.92), rgba(19, 121, 91, 0.96));
        font-weight: 700;
        box-shadow: 0 12px 24px rgba(19, 121, 91, 0.18);
      }

      .nav,
      .actions {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        flex-wrap: wrap;
      }

      .nav a {
        padding: 0.7rem 0.9rem;
        border-radius: 999px;
        color: var(--muted);
      }

      .nav a.active {
        color: var(--text);
        background: rgba(255, 255, 255, 0.6);
      }

      .user-chip {
        padding: 0.55rem 0.9rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.6);
        display: grid;
      }

      .user-chip small {
        color: var(--muted);
      }

      @media (max-width: 900px) {
        .topbar {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `
  ]
})
export class MainShellComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);

  readonly user = this.authStore.user;
  readonly role = this.authStore.role;
  readonly isAuthenticated = computed(() => this.authStore.isAuthenticated());

  logout(): void {
    this.authService.logout();
  }
}
