import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-section">
      <div class="page-shell grid grid-2">
        <div class="glass-card info-card">
          <div class="tag">FAQ</div>
          <h2>Frequently asked questions</h2>
          <div class="stack faq-list">
            <article class="faq-item" *ngFor="let item of faqs">
              <h3>{{ item.question }}</h3>
              <p>{{ item.answer }}</p>
            </article>
          </div>
        </div>

        <div class="glass-card visual-card">
          <img src="/media/faq-illustration.svg" alt="FAQ illustration" />
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

      .faq-item {
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--line);
      }

      .faq-item h3,
      .faq-item p {
        margin: 0;
      }

      .faq-item p {
        color: var(--muted);
        margin-top: 0.45rem;
      }

      img {
        width: 100%;
        display: block;
        border-radius: 24px;
      }
    `
  ]
})
export class FaqComponent {
  readonly faqs = [
    {
      question: 'How do I book a turf?',
      answer:
        'Sign in as a customer, choose a location, pick a turf, select a slot, and confirm the booking.'
    },
    {
      question: 'Can an owner manage only their own turfs?',
      answer:
        'Yes. Owners can see, add, and delete only the venues that belong to their account.'
    },
    {
      question: 'What can admins view?',
      answer:
        'Admins can review registered customers, owners, and the full turf catalog from the admin area.'
    },
    {
      question: 'How are payments handled?',
      answer:
        'The frontend supports payment options through the payment page and can be aligned to your backend provider flow.'
    }
  ];
}
