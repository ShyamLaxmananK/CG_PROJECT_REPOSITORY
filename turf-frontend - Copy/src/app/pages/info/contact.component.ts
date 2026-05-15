import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-section">
      <div class="page-shell grid grid-2">
        <div class="glass-card info-card">
          <div class="tag">Contact Us</div>
          <h2>Need help with bookings, venues, or account access?</h2>
          <p class="lead">
            Reach the support desk using the details below. This page is ready for presentation and can be
            wired to a real contact backend later if needed.
          </p>

          <div class="stack contact-list">
            <article class="contact-item">
              <strong>Email</strong>
              <p>support&#64;groundflow.local</p>
            </article>
            <article class="contact-item">
              <strong>Phone</strong>
              <p>+91 90000 12345</p>
            </article>
            <article class="contact-item">
              <strong>Office</strong>
              <p>Sports Hub, Hyderabad, Telangana</p>
            </article>
          </div>
        </div>

        <div class="glass-card visual-card">
          <img src="/media/contact-support.svg" alt="Contact support" />
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .info-card,
      .visual-card {
        padding: 1.5rem;
      }

      .lead {
        color: var(--muted);
      }

      .contact-item {
        padding: 1rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.62);
      }

      .contact-item strong,
      .contact-item p {
        margin: 0;
      }

      .contact-item p {
        color: var(--muted);
        margin-top: 0.35rem;
      }

      img {
        width: 100%;
        display: block;
        border-radius: 24px;
      }
    `
  ]
})
export class ContactComponent {}
