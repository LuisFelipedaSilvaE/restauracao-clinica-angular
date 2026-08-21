import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Usuario } from '../guards/models/usuario.model';
import { tap } from 'rxjs';

const CHAVE_TOKEN = 'auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseAPIUrl = 'http://localhost:8080/auth/login';
  private http = inject(HttpClient);
  private internalIsAuthenticated = signal<boolean>(this.hasToken());

  isAuthenticated = this.internalIsAuthenticated.asReadonly();

  login(usuario: Usuario) {
    return this.http
      .post<{ token: string }>(this.baseAPIUrl, usuario)
      .pipe(tap((res) => this.setToken(res.token)));
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

  private hasToken(): boolean {
    return !!localStorage.getItem(CHAVE_TOKEN);
  }
}
