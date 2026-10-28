import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, map, of } from 'rxjs';
import { CargosService } from '../../cargos/services/cargos-service';

export const cargoExistenteGuard: CanActivateFn = () => {
  const cargosService = inject(CargosService);
  const messageService = inject(MessageService);
  const router = inject(Router);

  return cargosService.getAllCargos().pipe(
    map((cargos) => {
      if (cargos.some((cargo) => cargo.ativo)) return true;

      messageService.add({
        severity: 'warn',
        summary: 'Cargo ativo necessário',
        detail: 'Cadastre ou ative pelo menos um cargo antes de criar um funcionário.',
        life: 4000,
      });

      return router.createUrlTree(['/funcionarios']);
    }),
    catchError(() => of(router.createUrlTree(['/funcionarios']))),
  );
};
