import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="page-shell hero-grid">
        <div class="hero-copy">
          <div class="tag">Turf Management Platform</div>
          <h1>Book city turfs, manage venue listings, and track sports bookings with one polished frontend.</h1>
          <p class="lead">
            GroundFlow connects customers, owners, and admins through one responsive Angular experience
            aligned to your Spring Boot microservices and API Gateway.
          </p>

          <div class="hero-actions">
            <a class="btn btn-primary" [routerLink]="primaryRoute()">{{ primaryLabel() }}</a>
            <a class="btn btn-secondary" routerLink="/register">Register now</a>
            <a class="btn btn-secondary" routerLink="/contact">Contact us</a>
          </div>

          <div class="hero-links">
            <a routerLink="/faq">Read FAQ</a>
            <a routerLink="/contact">Support</a>
          </div>
        </div>

        <div class="hero-visual stack">
          <img class="hero-main-image" src="/media/hero-stadium.svg" alt="Turf stadium overview" />
          <div class="image-row">
            <img src="/media/players-action.svg" alt="Players in action" />
            <div class="glass-card image-callout">
              <strong>Role-based access</strong>
              <p>Customers, owners, and admins each land in the right workspace after login.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="page-section">
      <div class="page-shell grid grid-3">
        <article class="glass-card metric-card">
          <div class="tag">Location Filter</div>
          <h3>Browse turfs by location</h3>
          <p>Customers can narrow venue discovery by city or neighbourhood before booking.</p>
        </article>
        <article class="glass-card metric-card">
          <div class="tag">Owner Controls</div>
          <h3>Manage your own venues</h3>
          <p>Owners can add, view, and delete only the turfs that belong to their account.</p>
        </article>
        <article class="glass-card metric-card">
          <div class="tag">Admin Review</div>
          <h3>View customers and turfs</h3>
          <p>Admins can inspect registered users and the complete turf catalog from one place.</p>
        </article>
      </div>
    </section>

    <section class="page-section">
      <div class="page-shell grid grid-2">
        <div class="glass-card list-card gallery-card">
          <div class="section-title">
            <div>
              <div class="tag">Platform Highlights</div>
              <h2>Everything needed for a turf booking demo</h2>
            </div>
          </div>

          <div class="grid grid-2">
            <article class="gallery-tile">
              <img src="/media/players-action.svg" alt="Sports booking highlight" />
              <strong>Customer bookings</strong>
              <p>View bookings, cancel them, and track their latest status from the dashboard.</p>
            </article>
            <article class="gallery-tile">
              <img src="/media/faq-illustration.svg" alt="Support and FAQ" />
              <strong>Help pages</strong>
              <p>FAQ and Contact pages are linked directly from the home page and top navigation.</p>
            </article>
          </div>
        </div>

        <div class="glass-card list-card steps-card">
          <div class="section-title">
            <div>
              <div class="tag">How It Works</div>
              <h2>From registration to reservation</h2>
            </div>
          </div>

          <ol class="step-list">
            <li>Create an account as a customer or owner.</li>
            <li>Browse venues filtered by location.</li>
            <li>Select a slot and confirm the booking.</li>
            <li>Review booking history, cancellations, and payment options.</li>
          </ol>

          <div class="quick-links">
            <a class="btn btn-secondary" routerLink="/faq">Open FAQ</a>
            <a class="btn btn-secondary" routerLink="/contact">Open Contact Us</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        padding: 3.5rem 0 2rem;
      }

      .hero-grid {
        display: grid;
        grid-template-columns: 1.1fr 1fr;
        gap: 1.5rem;
        align-items: center;
      }

      .hero-copy h1 {
        font-size: clamp(2.8rem, 5vw, 4.8rem);
        line-height: 0.98;
        margin: 1rem 0;
        max-width: 11ch;
        font-family: "Space Grotesk", "DM Sans", sans-serif;
      }

      .lead {
        color: var(--muted);
        font-size: 1.08rem;
        max-width: 58ch;
      }

      .hero-actions,
      .hero-links,
      .quick-links {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
      }

      .hero-actions {
        margin-top: 1.4rem;
      }

      .hero-links {
        margin-top: 1rem;
      }

      .hero-links a {
        color: var(--brand-strong);
        font-weight: 700;
      }

      .hero-main-image {
        width: 100%;
        display: block;
        border-radius: 28px;
      }

      .image-row {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 1rem;
      }

      .image-row img {
        width: 100%;
        display: block;
        border-radius: 24px;
      }

      .image-callout {
        padding: 1.25rem;
      }

      .image-callout p,
      .gallery-tile p {
        color: var(--muted);
      }

      .gallery-card,
      .steps-card {
        padding: 1.5rem;
      }

      .gallery-tile {
        display: grid;
        gap: 0.7rem;
      }

      .gallery-tile img {
        width: 100%;
        display: block;
        border-radius: 22px;
      }

      .gallery-tile strong,
      .gallery-tile p {
        margin: 0;
      }

      .step-list {
        margin: 0;
        padding-left: 1.15rem;
        color: var(--muted);
        display: grid;
        gap: 0.9rem;
      }

      @media (max-width: 900px) {
        .hero-grid,
        .image-row {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HomeComponent {
  private readonly authStore = inject(AuthStore);

  readonly primaryRoute = computed(() => {
    const role = this.authStore.role();

    if (role === 'CUSTOMER') {
      return '/customer';
    }

    if (role === 'OWNER') {
      return '/owner';
    }

    if (role === 'ADMIN') {
      return '/admin';
    }

    return '/login';
  });

  readonly primaryLabel = computed(() =>
    this.authStore.isAuthenticated() ? 'Open dashboard' : 'Sign in'
  );
}
