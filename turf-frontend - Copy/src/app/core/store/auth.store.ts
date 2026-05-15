import { computed, Injectable, signal } from '@angular/core';
import {
  AuthApiResponse,
  AuthResponse,
  AuthUser,
  UserRole
} from '../models/auth.models';

const TOKEN_KEY = 'turf.token';
const USER_KEY = 'turf.user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly userState = signal<AuthUser | null>(this.loadUser());
  private readonly tokenState = signal<string | null>(this.loadToken());

  readonly user = this.userState.asReadonly();
  readonly token = this.tokenState.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenState());
  readonly role = computed(() => this.userState()?.role ?? null);

  setSession(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.tokenState.set(response.token);
    this.userState.set(response.user);
  }

  createSession(response: AuthApiResponse): AuthResponse {
    const token =
      response.token ?? response.jwtToken ?? response.accessToken ?? '';

    const userFromResponse = response.user ?? {};
    const tokenPayload = this.decodeJwtPayload(token);
    const tokenFullName = tokenPayload?.['fullName'];
    const tokenName = tokenPayload?.['name'];
    const tokenSubject = tokenPayload?.['sub'];
    const tokenEmail = tokenPayload?.['email'];
    const tokenRoles = tokenPayload?.['roles'] as unknown[] | undefined;
    const tokenAuthorities = tokenPayload?.['authorities'] as
      | unknown[]
      | undefined;
    const tokenPreferredUsername = tokenPayload?.['preferred_username'];

    const fullName =
      userFromResponse.fullName ??
      response.fullName ??
      userFromResponse.username ??
      response.name ??
      response.username ??
      tokenFullName ??
      tokenName ??
      tokenSubject ??
      'User';

    const email =
      userFromResponse.email ??
      response.email ??
      tokenEmail ??
      response.username ??
      tokenSubject ??
      '';

    const role = this.normalizeRole(
      userFromResponse.role ??
        userFromResponse.roles?.[0] ??
        response.role ??
        response.roles?.[0] ??
        tokenRoles?.[0] ??
        tokenAuthorities?.[0]
    );

    return {
      token,
      refreshToken: response.refreshToken,
      user: {
        id: userFromResponse.id ?? response.id ?? response.userId ?? null,
        fullName,
        email,
        phone: userFromResponse.phone ?? response.phone,
        role,
        username:
          userFromResponse.username ??
          response.username ??
          tokenPreferredUsername ??
          tokenSubject
      }
    };
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenState.set(null);
    this.userState.set(null);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadUser(): AuthUser | null {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  }

  private normalizeRole(value: unknown): UserRole {
    const normalized = String(value ?? 'CUSTOMER').replace('ROLE_', '');
    if (normalized === 'OWNER' || normalized === 'ADMIN') {
      return normalized;
    }

    return 'CUSTOMER';
  }

  private decodeJwtPayload(token: string): Record<string, any> | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  }
}
