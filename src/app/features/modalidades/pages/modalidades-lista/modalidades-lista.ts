import { Component, signal } from '@angular/core';
import {
  LucideDoorOpen,
  LucideLayers,
  LucideLayoutGrid,
  LucidePlus,
  LucideUsersRound,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { InfoCard } from '../../../../shared/components/info-card/info-card';
import { ModalidadeCardContent } from '../../interfaces/modalidade-card-content';
import { ModalidadeCard } from '../../components/modalidade-card/modalidade-card';
import { ToggleModalidadeDto } from '../../interfaces/toggle-modalidade-dto';

@Component({
  selector: 'app-modalidades-lista',
  imports: [ButtonModule, LucidePlus, InfoCard, ModalidadeCard, ModalidadeCard],
  templateUrl: './modalidades-lista.html',
  styleUrl: './modalidades-lista.css',
})
export class ModalidadesLista {
  protected readonly modalidades = signal<ModalidadeCardContent[]>([
    {
      id: 1,
      value: 'Particular',
      label: 'Internação custeada integralmente pela família do acolhido.',
      totalVagas: 12,
      acolhidosAtivos: 4,
      color: 'sky',
      ativa: true,
    },
    {
      id: 2,
      value: 'Prefeitura',
      label: 'Vagas conveniadas com o município por meio de contrato público.',
      totalVagas: 12,
      acolhidosAtivos: 4,
      color: 'purple',
      ativa: true,
    },
    {
      id: 3,
      value: 'Social',
      label: 'Vaga beneficente ou bolsa social para pessoas em vulnerabilidade.',
      totalVagas: 12,
      acolhidosAtivos: 4,
      color: 'green',
      ativa: true,
    },
  ]);
  protected readonly infoModalidades = signal<InfoCardContent[]>([
    {
      value: 3,
      label: 'Modalidades',
      icon: LucideLayoutGrid,
      color: 'red',
    },
    {
      value: 30,
      label: 'Vagas totais',
      icon: LucideLayers,
      color: 'sky',
    },
    {
      value: 11,
      label: 'Vagas totais',
      icon: LucideUsersRound,
      color: 'amber',
    },
    {
      value: 19,
      label: 'Vagas totais',
      icon: LucideDoorOpen,
      color: 'green',
    },
  ]);

  toggleModalidade(dto: ToggleModalidadeDto): void {
    this.modalidades.update((value) => {
      return value.map((modalidade) =>
        modalidade.id === dto.id ? { ...modalidade, ativa: dto.ativa } : modalidade,
      );
    });
  }
}
