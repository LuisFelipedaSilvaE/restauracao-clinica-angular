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
  private readonly internalIsAuthenticated = signal<boolean>(this.hasToken());

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
    if (!token) return null;

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.role;
    } catch {
      return null;
    }
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(CHAVE_TOKEN);
  }
}
