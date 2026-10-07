import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import {
  LucideCalendarHeart,
  LucideCircleDollarSign,
  LucidePhone,
  LucideUserRound,
} from '@lucide/angular';
import { TagModule } from 'primeng/tag';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { ProntuarioInfoField } from '../../components/prontuario-info-field/prontuario-info-field';
import { ProntuarioSectionCard } from '../../components/prontuario-section-card/prontuario-section-card';
import { ProntuarioHeaderContent } from '../../interfaces/prontuario-header-content';

@Component({
  selector: 'app-dados-gerais',
  host: {
    class: 'block min-w-0',
  },
  imports: [
    CurrencyPipe,
    DatePipe,
    TagModule,
    CpfPipe,
    TelefonePipe,
    ProntuarioInfoField,
    ProntuarioSectionCard,
  ],
  templateUrl: './dados-gerais.html',
  styleUrl: './dados-gerais.css',
})
export class DadosGerais {
  protected readonly acolhido = inject(ROUTER_OUTLET_DATA) as Signal<ProntuarioHeaderContent>;

  protected readonly dadosPessoaisIcon = LucideUserRound;
  protected readonly contatoIcon = LucidePhone;
  protected readonly internacaoIcon = LucideCalendarHeart;
  protected readonly pagamentoIcon = LucideCircleDollarSign;
}
