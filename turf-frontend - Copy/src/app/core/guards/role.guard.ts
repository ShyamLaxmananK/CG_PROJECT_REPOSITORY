import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { UserRole } from '../models/auth.models';

export function roleGuard(roles: UserRole[]): CanActivateFn {

  return () => {

    const authStore = inject(AuthStore);
    const router = inject(Router);

    const role = authStore.role();

    // allow navigation if role exists and matches
    if (role && roles.includes(role)) {
      return true;
    }

    // fallback: if user logged in but role still resolving
    if (authStore.isAuthenticated()) {
      return true;
    }

    return router.createUrlTree(['/login']);

  };

}