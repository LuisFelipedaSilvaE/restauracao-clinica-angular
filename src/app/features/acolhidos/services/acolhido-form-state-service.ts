import { Injectable, signal } from '@angular/core';
import { AcolhidoFormDraft } from '../interfaces/acolhido-form-draft';

@Injectable({
  providedIn: 'root',
})
export class AcolhidoFormStateService {
  private readonly rascunho = signal<AcolhidoFormDraft | null>(null);

  salvarRascunho(dados: AcolhidoFormDraft): void {
    this.rascunho.set(structuredClone(dados));
  }

  consumirRascunho(): AcolhidoFormDraft | null {
    const dados = this.rascunho();
    this.rascunho.set(null);
    return dados ? structuredClone(dados) : null;
  }
}
