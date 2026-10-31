import { Injectable, signal } from '@angular/core';
import { InternacaoFormDraft } from '../interfaces/internacao-form-draft';

@Injectable({
  providedIn: 'root',
})
export class InternacaoFormStateService {
  private readonly rascunho = signal<InternacaoFormDraft | null>(null);

  salvarRascunho(dados: InternacaoFormDraft): void {
    this.rascunho.set(structuredClone(dados));
  }

  consumirRascunho(): InternacaoFormDraft | null {
    const dados = this.rascunho();
    this.rascunho.set(null);
    return dados ? structuredClone(dados) : null;
  }
}
