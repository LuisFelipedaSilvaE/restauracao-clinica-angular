import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth-service';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { LucideBell, LucideCalendar, LucideSearch } from '@lucide/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-header',
  host: {
    class: 'sticky top-4 z-10',
  },
  providers: [DatePipe],
  imports: [
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    ButtonModule,
    LucideSearch,
    LucideCalendar,
    LucideBell,
    CommonModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly authService = inject(AuthService);
  private readonly datePipe = inject(DatePipe);
  protected readonly searchValue = signal('');
  protected readonly dataAtual = signal(new Date());
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
