import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from './models/user-role.model';
import { AuthService } from '../services/auth-service';

export function roleGuard(...roles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (roles.some((role) => authService.hasRole(role))) {
      return true;
    }

    return router.createUrlTree(['/acesso-negado']);
  };
}
