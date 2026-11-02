import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideBell,
  LucideCalendar,
  LucideDynamicIcon,
  LucideMenu,
  LucideSearch,
  LucideX,
} from '@lucide/angular';
import { AutoCompleteModule } from 'primeng/autocomplete';
import type {
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
} from 'primeng/types/autocomplete';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth-service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MobileNav } from '../mobile-nav/mobile-nav';
import { GlobalSearchGroup, GlobalSearchResult } from './interfaces/global-search-result';
import { GlobalSearchService } from './services/global-search-service';

@Component({
  selector: 'app-header',
  host: {
    class: 'sticky top-4 z-20',
  },
  providers: [DatePipe],
  imports: [
    AutoCompleteModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    ButtonModule,
    LucideSearch,
    LucideCalendar,
    LucideBell,
    LucideMenu,
    LucideX,
    LucideDynamicIcon,
    CommonModule,
    MobileNav,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly authService = inject(AuthService);
  private readonly datePipe = inject(DatePipe);
  private readonly globalSearchService = inject(GlobalSearchService);
  private readonly router = inject(Router);
  protected readonly searchValue = signal<GlobalSearchResult | string | null>('');
  protected readonly searchSuggestions = signal<GlobalSearchGroup[]>([]);
  protected readonly dataAtual = signal(new Date());
  protected readonly isMobileNavOpen = signal(false);
  private searchSequence = 0;

  toggleMobileNav(): void {
    this.isMobileNavOpen.update((open) => !open);
  }

  protected buscar(event: AutoCompleteCompleteEvent): void {
    const searchSequence = ++this.searchSequence;

    this.globalSearchService.buscar(event.query).subscribe({
      next: (grupos) => {
        if (searchSequence === this.searchSequence) {
          this.searchSuggestions.set(grupos);
        }
      },
      error: () => {
        if (searchSequence === this.searchSequence) {
          this.searchSuggestions.set([]);
        }
      },
    });
  }

  protected selecionarResultado(event: AutoCompleteSelectEvent): void {
    const resultado = event.value as GlobalSearchResult;

    this.router.navigate(resultado.rota, { queryParams: resultado.queryParams }).then(() => {
      this.searchValue.set('');
      this.searchSuggestions.set([]);
    });
  }

  protected limparBusca(): void {
    this.searchSequence++;
    this.searchValue.set('');
    this.searchSuggestions.set([]);
  }

  protected readonly dataFormatada = computed(() => {
    const data = this.dataAtual();

    let diaSemana = this.datePipe.transform(data, 'EEEE', '', 'pt-BR')!.split('-')[0];
    const pLDiaSemana = diaSemana.charAt(0);
    let dia = this.datePipe.transform(data, 'dd', '', 'pt-BR')!;
    let mes = this.datePipe.transform(data, 'MMMM', '', 'pt-BR')!;
    const pLMes = mes.charAt(0);

    diaSemana = diaSemana.replace(pLDiaSemana, pLDiaSemana.toUpperCase());
    mes = mes.replace(pLMes, pLMes.toUpperCase());

    return `${diaSemana}, ${dia} de ${mes}`;
  });
}
