import { inject, Injectable } from '@angular/core';
import { LucideClipboardList, LucideUserRound } from '@lucide/angular';
import { forkJoin, map, Observable, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth-service';
import { Acolhido } from '../../../features/acolhidos/interfaces/acolhido';
import { AcolhidosService } from '../../../features/acolhidos/services/acolhidos-service';
import { StatusTriagem } from '../../../features/triagens/enums/status-triagem';
import { Triagem } from '../../../features/triagens/interfaces/triagem';
import { TriagensService } from '../../../features/triagens/services/triagens-service';
import { formatCpf } from '../../../shared/utils/cpf-formatter';
import { formatTelefone } from '../../../shared/utils/telefone-formatter';
import { GlobalSearchGroup, GlobalSearchResult } from '../interfaces/global-search-result';

const LIMITE_POR_GRUPO = 5;

const STATUS_TRIAGEM_LABELS: Record<StatusTriagem, string> = {
  [StatusTriagem.AGENDADA]: 'Agendada',
  [StatusTriagem.ATRASADA]: 'Atrasada',
  [StatusTriagem.CONCLUIDA]: 'Concluída',
};

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchService {
  private readonly authService = inject(AuthService);
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly triagensService = inject(TriagensService);

  buscar(termo: string): Observable<GlobalSearchGroup[]> {
    const termoNormalizado = this.normalizarTexto(termo);

    if (termoNormalizado.length < 2) {
      return of([]);
    }

    const podeBuscarTriagens = this.authService.hasRole('ADMIN');

    return forkJoin({
      acolhidos: this.acolhidosService.getAllAcolhidos(),
      triagens: podeBuscarTriagens ? this.triagensService.getAllTriagens() : of([] as Triagem[]),
    }).pipe(
      map(({ acolhidos, triagens }) => {
        const grupos: GlobalSearchGroup[] = [];
        const resultadosAcolhidos = acolhidos
          .filter((acolhido) => this.correspondeAcolhido(acolhido, termo))
          .slice(0, LIMITE_POR_GRUPO)
          .map((acolhido) => this.mapearAcolhido(acolhido));

        if (resultadosAcolhidos.length > 0) {
          grupos.push({ label: 'Acolhidos', items: resultadosAcolhidos });
        }

        const resultadosTriagens = triagens
          .filter((triagem) => this.correspondeTriagem(triagem, termo))
          .slice(0, LIMITE_POR_GRUPO)
          .map((triagem) => this.mapearTriagem(triagem));

        if (resultadosTriagens.length > 0) {
          grupos.push({ label: 'Triagens', items: resultadosTriagens });
        }

        return grupos;
      }),
    );
  }

  private correspondeAcolhido(acolhido: Acolhido, termo: string): boolean {
    const texto = this.normalizarTexto(termo);
    const numeros = termo.replace(/\D/g, '');
    const codigo = texto.replace(/\W/g, '');
    const id = String(acolhido.id);

    return (
      this.normalizarTexto(acolhido.nome).includes(texto) ||
      this.normalizarTexto(acolhido.email).includes(texto) ||
      [`p${id}`, `p${id.padStart(2, '0')}`].some((valor) => valor.includes(codigo)) ||
      (!!numeros &&
        (acolhido.cpf.replace(/\D/g, '').includes(numeros) ||
          acolhido.telefone.replace(/\D/g, '').includes(numeros)))
    );
  }

  private correspondeTriagem(triagem: Triagem, termo: string): boolean {
    const texto = this.normalizarTexto(termo);
    const numeros = termo.replace(/\D/g, '');
    const codigo = texto.replace(/\W/g, '');
    const id = String(triagem.id);

    return (
      this.normalizarTexto(triagem.nomePossivelAcolhido).includes(texto) ||
      this.normalizarTexto(triagem.convenio.descricao).includes(texto) ||
      [`t${id}`, `t${id.padStart(2, '0')}`].some((valor) => valor.includes(codigo)) ||
      (!!numeros && triagem.telefone.replace(/\D/g, '').includes(numeros))
    );
  }

  private mapearAcolhido(acolhido: Acolhido): GlobalSearchResult {
    return {
      id: acolhido.id,
      tipo: 'acolhido',
      titulo: acolhido.nome,
      descricao: `P-${String(acolhido.id).padStart(2, '0')} · CPF ${formatCpf(acolhido.cpf)}`,
      icon: LucideUserRound,
      rota: ['/prontuarios', acolhido.id],
      queryParams: { origem: 'acolhido' },
    };
  }

  private mapearTriagem(triagem: Triagem): GlobalSearchResult {
    return {
      id: triagem.id,
      tipo: 'triagem',
      titulo: triagem.nomePossivelAcolhido,
      descricao: `${formatTelefone(triagem.telefone)} · ${triagem.convenio.descricao} · ${STATUS_TRIAGEM_LABELS[triagem.triagemStatus]}`,
      icon: LucideClipboardList,
      rota: ['/triagens', triagem.id],
    };
  }

  private normalizarTexto(valor: string): string {
    return valor
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
