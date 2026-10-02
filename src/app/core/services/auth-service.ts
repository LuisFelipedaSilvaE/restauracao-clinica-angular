import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../guards/models/usuario.model';
import { tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { TokenPayload } from '../guards/models/token-payload.model';

const CHAVE_TOKEN = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseAPIUrl = `${environment.apiUrl}/auth/login`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly internalIsAuthenticated = signal<boolean>(this.isTokenValid());
  isAuthenticated = this.internalIsAuthenticated.asReadonly();

  login(usuario: Usuario) {
    return this.http
      .post<{ token: string }>(this.baseAPIUrl, usuario)
      .pipe(tap((res) => this.setToken(res.token)));
  }

  logout() {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  setToken(token: string) {
    localStorage.setItem(CHAVE_TOKEN, token);

    if (!this.isTokenValid()) {
      this.removeToken();
      return;
    }

    this.internalIsAuthenticated.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  removeToken() {
    localStorage.removeItem(CHAVE_TOKEN);
    this.internalIsAuthenticated.set(false);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token || !this.isTokenValid()) return null;

    try {
      const payload = jwtDecode<TokenPayload>(token);
      return payload.role;
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = jwtDecode<TokenPayload>(token);

      if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();

    if (!token || !this.isTokenValid()) return null;

    try {
      return jwtDecode<TokenPayload>(token).sub;
    } catch {
      return null;
    }
  }

  getUserRoleLabel(): string {
    const role = this.getUserRole();

    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      USER: 'Usuário',
      NO_ACCESS: 'Sem acesso',
    };

    return role ? (labels[role] ?? role) : 'Usuário';
  }
}
