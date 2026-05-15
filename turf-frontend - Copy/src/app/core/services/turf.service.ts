import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { ApiListResponse } from '../models/api.models';
import { Turf, TurfPayload } from '../models/turf.models';

@Injectable({ providedIn: 'root' })
export class TurfService extends ApiBaseService {
  getAvailableTurfs() {
    return this.http
      .get<Turf[]>(this.url(this.environment.endpoints.turfs))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Turf>)));
  }

  getTurfById(turfId: number) {
    return this.http.get<Turf>(
      this.url(`${this.environment.endpoints.turfs}/${turfId}`)
    );
  }

  getOwnerTurfs() {
    return this.http
      .get<Turf[]>(this.url(`${this.environment.endpoints.turfs}/owner`))
      .pipe(map((items) => ({ items } satisfies ApiListResponse<Turf>)));
  }

  createTurf(payload: TurfPayload) {
    return this.http.post<Turf>(
      this.url(`${this.environment.endpoints.turfs}/add`),
      payload
    );
  }

  deleteTurf(turfId: number) {
    return this.http.delete<void>(
      this.url(`${this.environment.endpoints.turfs}/delete/${turfId}`)
    );
  }
}
