import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const ownerGuard: CanActivateFn = () => {

  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (!token) {

    router.navigate(['/login']);

    return false;

  }

  const payload = JSON.parse(
    atob(token.split('.')[1])
  );

  const roles = payload.roles;

  if (roles.includes('ROLE_OWNER')) {

    return true;

  }

  router.navigate(['/turfs']);

  return false;

};