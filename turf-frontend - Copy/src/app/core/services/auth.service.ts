import { Injectable, inject } from '@angular/core';
import { map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiBaseService } from './api-base.service';
import {
  AuthApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload
} from '../models/auth.models';
import { AuthStore } from '../store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService extends ApiBaseService {
  private readonly authStore = inject(AuthStore);

  login(payload: LoginPayload) {
    return this.http
      .post(
        this.url(`${this.environment.endpoints.auth}/login`),
        payload,
        { responseType: 'text' }
      )
      .pipe(
        map((token) =>
          this.authStore.createSession({
            token,
            username: payload.username
          })
        ),
        tap((response) => this.authStore.setSession(response))
      );
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<AuthApiResponse>(
        this.url(`${this.environment.endpoints.auth}/register`),
        payload
      )
      .pipe(
        switchMap((response) =>
          this.login({
            username: payload.username,
            password: payload.password
          }).pipe(
            map((session) => ({
              ...session,
              user: {
                ...session.user,
                id: response.user?.id ?? response.id ?? response.userId ?? session.user.id,
                username: response.user?.username ?? response.username ?? payload.username
              }
            }))
          )
        ),
        tap((response) => this.authStore.setSession(response))
      );
  }

  logout(): void {
    this.authStore.clear();
  }
}
