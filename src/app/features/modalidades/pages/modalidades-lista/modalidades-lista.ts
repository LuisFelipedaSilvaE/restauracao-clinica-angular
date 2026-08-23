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
import { ModalidadeDialog } from '../../components/modalidade-dialog/modalidade-dialog';
import { Modalidade } from '../../interfaces/modalidade';

@Component({
  selector: 'app-modalidades-lista',
  host: {
    class: 'flex gap-4 flex-col',
  },
  imports: [ButtonModule, LucidePlus, InfoCard, ModalidadeCard, ModalidadeCard, ModalidadeDialog],
  templateUrl: './modalidades-lista.html',
  styleUrl: './modalidades-lista.css',
})
export class ModalidadesLista {
  protected readonly modalidades = signal<ModalidadeCardContent[]>([
    {
      id: 1,
      cnpj: '00.000.000/0000-00',
      descricao: 'Particular',
      vagasMaximas: 12,
      corIdentificacao: '#0084d1',
      ativa: true,
      acolhidosAtivos: 4,
    },
    {
      id: 2,
      cnpj: '11.111.111/1111-11',
      descricao: 'Prefeitura',
      vagasMaximas: 12,
      corIdentificacao: '#9810fa',
      ativa: true,
      acolhidosAtivos: 4,
    },
    {
      id: 3,
      cnpj: '22.222.222/2222-22',
      descricao: 'Social',
      vagasMaximas: 12,
      corIdentificacao: '#00a63e',
      ativa: true,
      acolhidosAtivos: 4,
    },
  ]);
  protected readonly infoModalidades = signal<InfoCardContent[]>([
    {
      value: 3,
      label: 'Modalidades',
      icon: LucideLayoutGrid,
      color: '#e7000b',
    },
    {
      value: 30,
      label: 'Vagas totais',
      icon: LucideLayers,
      color: '#0084d1',
    },
    {
      value: 11,
      label: 'Vagas ocupadas',
      icon: LucideUsersRound,
      color: '#e17100',
    },
    {
      value: 19,
      label: 'Vagas disponíveis',
      icon: LucideDoorOpen,
      color: '#00a63e',
    },
  ]);
  protected readonly modalidadeParaAtualizar = signal<Modalidade | null>(null);
  protected readonly dialogVisible = signal<boolean>(false);
  protected readonly dialogType = signal<string>('regitro');

  showDialog(type: string): void {
    this.dialogVisible.set(true);
    this.dialogType.set(type);
  }

  closeDialog(state: boolean): void {
    this.dialogVisible.set(state);
    this.modalidadeParaAtualizar.set(null);
  }

  editarModalidade(modalidade: Modalidade) {
    this.modalidadeParaAtualizar.set(modalidade);
    this.showDialog('atualizacao');
  }

  toggleModalidade(dto: ToggleModalidadeDto): void {
    this.modalidades.update((value) => {
      return value.map((modalidade) =>
        modalidade.id === dto.id ? { ...modalidade, ativa: dto.ativa } : modalidade,
      );
    });
  }
}
