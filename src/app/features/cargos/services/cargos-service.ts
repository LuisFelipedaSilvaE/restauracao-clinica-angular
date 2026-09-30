import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cargo } from '../interfaces/cargo';
import { map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CargosService {
  private readonly baseAPIUrl = `${environment.apiUrl}/cargos`;
  private readonly http = inject(HttpClient);
  private readonly internalCargos = signal<Cargo[]>([
    {
      id: 1,
      nome: 'Administrador',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Coordenador',
      ativo: false,
    },
    {
      id: 3,
      nome: 'Enfermeiro(a)',
      ativo: true,
    },
    {
      id: 4,
      nome: 'Assistente Social',
      ativo: true,
    },
    {
      id: 5,
      nome: 'Nutricionista',
      ativo: true,
    },
    {
      id: 6,
      nome: 'Psicólogo(a)',
      ativo: true,
    },
    {
      id: 7,
      nome: 'Monitor',
      ativo: true,
    },
  ]);
  readonly cargos = this.internalCargos.asReadonly();

  getAllCargos(): void {
    if (this.internalCargos().length > 0) return;

    this.http.get<Cargo[]>(this.baseAPIUrl).subscribe({
      next: (res) => {
        this.internalCargos.set(res);
      },
    });
  }

  getCargoById(id: number): Observable<Cargo | undefined> {
    const cargoOriginal: Cargo | undefined = this.internalCargos().find((f) => f.id === id);

    return of(cargoOriginal);
    // return this.http.get<Cargo>(`${this.baseAPIUrl}/${id}`);
  }

  updateCargoToggleAtivo(id: number, ativo: boolean): Observable<Cargo | undefined> {
    const cargoOriginal: Cargo | undefined = this.internalCargos().find((f) => f.id === id);
    return of({}).pipe(
      map(() => {
        return cargoOriginal ? { ...cargoOriginal, ativo } : undefined;
      }),
      tap(() => {
        this.internalCargos.update((value) =>
          value.map((f) => (f.id === id ? { ...f, ativo } : f)),
        );
      }),
    );

    //   return this.http.put<void>(`${this.baseAPIUrl}/${id}`, { id, ativo }).pipe(
    //     map(() => {
    //       return cargoOriginal ? { ...cargoOriginal, ativo } : undefined;
    //     }),
    //     tap(() =>
    //       this.internalcargos.update((value) =>
    //         value.map((f) => (f.id === id ? { ...f, ativo } : f)),
    //       ),
    //     ),
    //   );
  }
}
