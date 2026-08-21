import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          authService.removeToken();
          router.navigate(['/login'], {
            queryParams: { sessionExpired: true },
          });

          break;
        case 403:
          messageService.add({
            severity: 'error',
            summary: 'Acesso negado',
            detail: 'Você não tem permissão para realizar esta ação.',
          });
          break;
      }
      return throwError(() => error);
    }),
  );
};
