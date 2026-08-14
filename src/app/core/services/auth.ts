import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../guards/models/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseAPIUrl = 'http://localhost:8080/auth/login';
  private http = inject(HttpClient);

  constructor() {}

  login(usuario: Usuario) {
    return this.http.post<Usuario>(this.baseAPIUrl, { ...usuario });
  }
}
