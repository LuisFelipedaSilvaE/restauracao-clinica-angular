import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../guards/models/user-role.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly baseAPIUrl = `${environment.apiUrl}/users`;
  private readonly http = inject(HttpClient);
  private readonly internalRoles = signal<UserRole[]>([]);
  readonly roles = this.internalRoles.asReadonly();
  private readonly rolesCarregadas = signal(false);
  private readonly internalLoading = signal<boolean>(false);
  readonly loading = this.internalLoading.asReadonly();

  getAllRoles(forceRefresh = false): Observable<UserRole[]> {
    if (this.rolesCarregadas() && !forceRefresh) {
      return of(this.internalRoles());
    }

    return this.http.get<UserRole[]>(`${this.baseAPIUrl}/roles`).pipe(
      tap((roles) => {
        this.internalRoles.set(roles);
        this.rolesCarregadas.set(true);
      }),
    );
  }

  alterarSenha(userId: number, newPassword: string): Observable<void> {
    this.setLoading(true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${userId}/password`, { newPassword }).pipe(
      finalize(() => {
        this.setLoading(false);
      }),
    );
  }

  alterarRole(userId: number, role: UserRole): Observable<void> {
    this.setLoading(true);

    return this.http.patch<void>(`${this.baseAPIUrl}/${userId}/role`, { role }).pipe(
      finalize(() => {
        this.setLoading(false);
      }),
    );
  }

  private setLoading(value: boolean): void {
    this.internalLoading.set(value);
  }
}
