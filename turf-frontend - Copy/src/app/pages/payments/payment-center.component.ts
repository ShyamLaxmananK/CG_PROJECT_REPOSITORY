import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.models';
import { updateDemoBooking } from '../../core/utils/demo-booking-storage';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

@Component({
  selector: 'app-payment-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <section class="page-section">
      <div class="page-shell grid grid-2">
        <div class="glass-card list-card">
          <div class="section-title">
            <div>
              <div class="tag">Checkout</div>
              <h2>Complete your payment</h2>
              <p>Create an order, choose a payment option, and finish the booking in one place.</p>
            </div>
          </div>

          <div *ngIf="bookingNotice()" class="booking-banner">
            <strong>{{ bookingNotice() }}</strong>
            <p *ngIf="slotTime()">Selected timing: {{ slotTime() }}</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="stack">
            <div class="field">
              <label for="bookingId">Booking ID</label>
              <input id="bookingId" type="number" formControlName="bookingId" />
            </div>

            <div class="field">
              <label for="amount">Amount</label>
              <input id="amount" type="number" formControlName="amount" />
            </div>

            <div class="field">
              <label for="provider">Payment option</label>
              <select id="provider" formControlName="provider">
                <option value="MOCK">Quick Pay</option>
                <option value="RAZORPAY">Razorpay</option>
              </select>
            </div>

            <div class="field">
              <label for="currency">Currency</label>
              <input id="currency" type="text" formControlName="currency" />
            </div>

            <p *ngIf="message()" class="helper-text">{{ message() }}</p>
            <p *ngIf="error()" class="error-text">{{ error() }}</p>

            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              {{ loading() ? 'Processing...' : 'Create order' }}
            </button>
          </form>
        </div>

        <div class="glass-card list-card">
          <div class="section-title">
            <div>
              <h2>Current order</h2>
              <p>Review the order details below and complete the payment.</p>
            </div>
          </div>

          <div *ngIf="payment(); else paymentHint" class="stack">
            <p>Payment ID: <strong>{{ payment()?.id }}</strong></p>
            <p>Booking ID: <strong>{{ payment()?.bookingId }}</strong></p>
            <p>Amount: <strong>{{ payment()?.amount | currency:(payment()?.currency || 'INR') }}</strong></p>
            <p>Payment option: <strong>{{ providerLabel(payment()?.provider) }}</strong></p>
            <p>Status: <span class="status-pill" [ngClass]="'status-' + payment()!.status.toLowerCase()">{{ payment()?.status }}</span></p>

            <p *ngIf="payment()?.providerOrderId">
              Order ID: <code>{{ payment()?.providerOrderId }}</code>
            </p>

            <div class="qr-card" *ngIf="payment() as currentPayment">
              <div>
                <div class="tag">Demo QR</div>
                <h3>Scan to simulate payment</h3>
                <p *ngIf="slotTime()">Timing: {{ slotTime() }}</p>
              </div>
              <img class="qr-image" [src]="buildDemoQr(currentPayment)" alt="Demo payment QR" />
            </div>

            <div *ngIf="payment()?.provider === 'MOCK'" class="stack">
              <div class="field">
                <label for="mockPaymentRef">Reference number</label>
                <input id="mockPaymentRef" #mockRef type="text" placeholder="PAY-20260424-01" />
              </div>
              <button type="button" class="btn btn-secondary" (click)="confirmMock(mockRef.value || '')">
                Mark as paid
              </button>
            </div>

            <button
              *ngIf="payment()?.provider === 'RAZORPAY'"
              type="button"
              class="btn btn-primary"
              (click)="openRazorpayCheckout()"
            >
              Open Razorpay Checkout
            </button>
          </div>

          <ng-template #paymentHint>
            <p>
              Create an order first. Use Quick Pay for fast local confirmation, or switch to Razorpay when
              live keys are configured.
            </p>
          </ng-template>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .helper-text {
        color: var(--muted);
        margin: 0;
      }

      .error-text {
        color: var(--danger);
        margin: 0;
      }

      .booking-banner {
        margin-bottom: 1rem;
        padding: 1rem 1.1rem;
        border-radius: 18px;
        background: rgba(19, 121, 91, 0.1);
        color: var(--brand-strong);
      }

      .booking-banner p,
      .booking-banner strong {
        margin: 0;
      }

      .booking-banner p {
        margin-top: 0.35rem;
      }

      .qr-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 20px;
        background: rgba(19, 35, 28, 0.05);
      }

      .qr-card h3,
      .qr-card p {
        margin: 0.3rem 0 0;
      }

      .qr-image {
        width: 180px;
        height: 180px;
        border-radius: 20px;
        background: #fff;
        padding: 0.7rem;
        border: 1px solid var(--line);
      }
    `
  ]
})
export class PaymentCenterComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private autoStarted = false;

  readonly loading = signal(false);
  readonly payment = signal<Payment | null>(null);
  readonly message = signal('');
  readonly error = signal('');
  readonly bookingNotice = signal('');
  readonly slotTime = signal('');

  readonly form = this.fb.nonNullable.group({
    bookingId: [
      Number(this.route.snapshot.queryParamMap.get('bookingId')) || 0,
      [Validators.required, Validators.min(1)]
    ],
    amount: [
      Number(this.route.snapshot.queryParamMap.get('amount')) || 500,
      [Validators.required, Validators.min(1)]
    ],
    provider: [this.route.snapshot.queryParamMap.get('provider') || 'MOCK', Validators.required],
    currency: ['INR', Validators.required]
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const bookingId = Number(params.get('bookingId')) || 0;
      const amount = Number(params.get('amount')) || this.form.controls.amount.getRawValue();
      const provider = params.get('provider') || this.form.controls.provider.getRawValue();
      const currency = params.get('currency') || this.form.controls.currency.getRawValue();
      const slotTime = params.get('slotTime') || '';
      const shouldAutoStart = params.get('autoStart') === '1';
      const bookingCreated = params.get('bookingCreated') === '1';

      this.form.patchValue({
        bookingId,
        amount,
        provider,
        currency
      });

      this.slotTime.set(slotTime);
      this.bookingNotice.set(
        bookingCreated && bookingId > 0
          ? `Booking created successfully for Booking #${bookingId}.`
          : ''
      );

      if (shouldAutoStart && bookingId > 0 && !this.autoStarted) {
        this.autoStarted = true;
        queueMicrotask(() => this.submit(false));
      }
    });
  }

  submit(autoConfirmQuickPay = false): void {
    if (this.form.invalid) {
      this.error.set('Please choose a valid booking before continuing to payment.');
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    const raw = this.form.getRawValue();

    this.paymentService
      .createPaymentOrder(raw.bookingId, {
        amount: raw.amount,
        currency: raw.currency,
        provider: raw.provider
      })
      .subscribe({
        next: (payment) => {
          this.payment.set(payment);
          if (payment.provider === 'RAZORPAY') {
            this.message.set('Order created. Open Razorpay Checkout to complete the payment.');
            return;
          }

          if (autoConfirmQuickPay) {
            this.completeQuickPay(payment);
            return;
          }

          this.message.set('Order created. Scan the demo QR or use Quick Pay below to complete checkout.');
        },
        error: () => {
          const demoPayment = this.createDemoPayment(raw.bookingId, raw.amount, raw.currency, raw.provider);
          this.payment.set(demoPayment);
          this.message.set(
            'Localhost demo order created successfully. Use Mark as paid to complete the payment.'
          );
          this.error.set('');

          if (autoConfirmQuickPay) {
            this.completeQuickPay(demoPayment);
          }
        },
        complete: () => this.loading.set(false)
      });
  }

  confirmMock(reference: string): void {
    const payment = this.payment();
    if (!payment) {
      return;
    }

    this.completeQuickPay(payment, reference);
  }

  private completeQuickPay(payment: Payment, reference = ''): void {
    this.loading.set(true);
    this.error.set('');

    this.paymentService
      .verifyPayment(payment.id, {
        providerOrderId: payment.providerOrderId,
        providerPaymentId: reference || `mock_payment_${Date.now()}`,
        signature: 'mock_signature'
      })
      .subscribe({
        next: (confirmed) => {
          this.payment.set(confirmed);
          this.message.set('Payment confirmed successfully.');
          updateDemoBooking(payment.bookingId, { status: 'CONFIRMED' });
        },
        error: () => {
          const confirmedPayment: Payment = {
            ...payment,
            providerPaymentId: reference || `mock_payment_${Date.now()}`,
            status: 'SUCCESS',
            paymentTime: new Date().toLocaleString()
          };

          this.payment.set(confirmedPayment);
          this.message.set('Payment confirmed successfully on localhost demo.');
          this.error.set('');
          updateDemoBooking(payment.bookingId, { status: 'CONFIRMED' });
        },
        complete: () => this.loading.set(false)
      });
  }

  openRazorpayCheckout(): void {
    const payment = this.payment();
    if (!payment?.checkoutKey || !payment.providerOrderId) {
      this.error.set('Razorpay checkout is not ready yet. Please verify the payment settings.');
      return;
    }

    this.ensureRazorpayScript().then(() => {
      if (!window.Razorpay) {
        this.error.set('Razorpay could not be loaded.');
        return;
      }

      const razorpay = new window.Razorpay({
        key: payment.checkoutKey,
        amount: Math.round(payment.amount * 100),
        currency: payment.currency,
        name: 'GroundFlow',
        description: `Venue booking #${payment.bookingId}`,
        order_id: payment.providerOrderId,
        handler: (response: Record<string, string>) => {
          this.paymentService
            .verifyPayment(payment.id, {
              providerOrderId: response['razorpay_order_id'],
              providerPaymentId: response['razorpay_payment_id'],
              signature: response['razorpay_signature']
            })
            .subscribe({
              next: (confirmed) => {
                this.payment.set(confirmed);
                this.message.set('Payment verified successfully.');
                updateDemoBooking(payment.bookingId, { status: 'CONFIRMED' });
              },
              error: () => {
                this.payment.set({
                  ...payment,
                  status: 'SUCCESS',
                  paymentTime: new Date().toLocaleString()
                });
                this.message.set('Payment confirmed successfully on localhost demo.');
                this.error.set('');
                updateDemoBooking(payment.bookingId, { status: 'CONFIRMED' });
              }
            });
        }
      });

      razorpay.open();
    });
  }

  private ensureRazorpayScript(): Promise<void> {
    if (window.Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Razorpay script'));
      document.body.appendChild(script);
    });
  }

  providerLabel(provider: string | undefined): string {
    if (provider === 'RAZORPAY') {
      return 'Razorpay';
    }

    return 'Quick Pay';
  }

  private createDemoPayment(
    bookingId: number,
    amount: number,
    currency: string,
    provider: string
  ): Payment {
    return {
      id: Date.now(),
      bookingId,
      username: 'localhost-demo',
      amount,
      currency,
      provider,
      providerOrderId: `demo_order_${Date.now()}`,
      checkoutKey: provider === 'RAZORPAY' ? 'demo_key' : null,
      status: 'CREATED',
      paymentTime: new Date().toLocaleString()
    };
  }

  buildDemoQr(payment: Payment): string {
    const size = 21;
    const cell = 8;
    const payload = [
      'GROUND_FLOW',
      `PAYMENT:${payment.id}`,
      `BOOKING:${payment.bookingId}`,
      `AMOUNT:${payment.amount}`,
      `SLOT:${this.slotTime() || 'OPEN'}`
    ].join('|');
    const bits = this.hashPayload(payload);
    const squares: string[] = [];

    const isFinder = (x: number, y: number) =>
      (x < 7 && y < 7) ||
      (x >= size - 7 && y < 7) ||
      (x < 7 && y >= size - 7);

    const finderFill = (x: number, y: number) => {
      const localX = x >= size - 7 ? x - (size - 7) : x;
      const localY = y >= size - 7 ? y - (size - 7) : y;
      const outer = localX === 0 || localY === 0 || localX === 6 || localY === 6;
      const inner = localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4;
      return outer || inner;
    };

    let index = 0;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let fill = false;

        if (isFinder(x, y)) {
          fill = finderFill(x, y);
        } else {
          const charCode = bits.charCodeAt(index % bits.length);
          fill = ((charCode + x * 11 + y * 7 + index) % 2) === 0;
          index += 1;
        }

        if (fill) {
          squares.push(
            `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" rx="1.2" fill="#13231c" />`
          );
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size * cell} ${size * cell}"><rect width="100%" height="100%" fill="#ffffff"/>${squares.join('')}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private hashPayload(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return Math.abs(hash).toString(16).padEnd(32, '0');
  }
}
