import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import {
  Payment,
  PaymentOrderPayload,
  PaymentVerificationPayload
} from '../models/payment.models';
import { ApiListResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PaymentService extends ApiBaseService {
  createPaymentOrder(bookingId: number, payload: PaymentOrderPayload) {
    return this.http.post<Payment>(
      this.url(`${this.environment.endpoints.payments}/orders/${bookingId}`),
      payload
    );
  }

  verifyPayment(paymentId: number, payload: PaymentVerificationPayload) {
    return this.http.post<Payment>(
      this.url(`${this.environment.endpoints.payments}/verify/${paymentId}`),
      payload
    );
  }

  getMyPayments() {
    return this.http
      .get<Payment[]>(this.url(`${this.environment.endpoints.payments}/history`))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Payment>)));
  }
}
