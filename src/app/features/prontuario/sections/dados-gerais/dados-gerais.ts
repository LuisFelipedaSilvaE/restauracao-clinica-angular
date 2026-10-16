import { DatePipe } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { LucideCalendarHeart, LucideMapPin, LucidePhone, LucideUserRound } from '@lucide/angular';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { CepPipe } from '../../../../shared/pipes/cep-pipe';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { ProntuarioInfoField } from '../../components/prontuario-info-field/prontuario-info-field';
import { ProntuarioSectionCard } from '../../components/prontuario-section-card/prontuario-section-card';
import { ProntuarioHeaderContent } from '../../interfaces/prontuario-header-content';
import { ProntuarioOutletData } from '../../interfaces/prontuario-outlet-data';

@Component({
  selector: 'app-dados-gerais',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    DatePipe,
    TagModule,
    SkeletonModule,
    CepPipe,
    CpfPipe,
    TelefonePipe,
    ProntuarioInfoField,
    ProntuarioSectionCard,
  ],
  templateUrl: './dados-gerais.html',
  styleUrl: './dados-gerais.css',
})
export class DadosGerais {
  private readonly outletData = inject(ROUTER_OUTLET_DATA) as Signal<ProntuarioOutletData>;
  protected readonly acolhido = computed<ProntuarioHeaderContent | null>(
    () => this.outletData().acolhido,
  );
  protected readonly loading = computed(() => this.outletData().loading);
  protected readonly skeletonCards = [
    Array.from({ length: 4 }),
    Array.from({ length: 3 }),
    Array.from({ length: 4 }),
  ];

  protected readonly dadosPessoaisIcon = LucideUserRound;
  protected readonly contatoIcon = LucidePhone;
  protected readonly internacaoIcon = LucideCalendarHeart;
  protected readonly enderecoIcon = LucideMapPin;
}
