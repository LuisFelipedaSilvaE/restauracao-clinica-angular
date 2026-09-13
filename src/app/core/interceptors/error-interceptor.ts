import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);
  const isLoginRequest = req.url.includes('/auth/login');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const backendMessage =
        typeof error.error?.message === 'string' ? error.error.message.trim() : '';
      let summary = 'Erro ao tentar concluir a operação';
      let detail = backendMessage || 'Não foi possível concluir a operação. Tente novamente.';

      switch (error.status) {
        case 401:
          if (!isLoginRequest) {
            authService.removeToken();
            router.navigate(['/login'], {
              queryParams: { sessionExpired: true },
            });
            return throwError(() => error);
          }
          summary = 'Erro no login';
          break;
        case 403:
          summary = 'Acesso negado';
          detail = backendMessage || 'Você não tem permissão para realizar esta ação.';
          break;
        case 0:
          summary = 'Falha de conexão';
          detail =
            'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
          break;
        default:
          if (error.status >= 500) {
            summary = 'Erro no servidor';
            detail = 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
          } else if (isLoginRequest) {
            summary = 'Erro no login';
          }
      }

      messageService.add({
        severity: 'error',
        summary,
        detail,
        life: 5000,
      });

      return throwError(() => error);
    }),
  );
};
