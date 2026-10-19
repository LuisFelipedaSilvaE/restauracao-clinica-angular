import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowDownToLine,
  LucideArrowUpFromLine,
  LucideHandCoins,
  LucidePackage,
  LucidePencil,
  LucidePill,
  LucideTablets,
  LucideTrash2,
} from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { BackButton } from '../../../../shared/components/back-button/back-button';
import { Card } from '../../../../shared/components/card/card';
import { IconColor } from '../../../../shared/directives/icon-color';
import { Medicamento } from '../../interfaces/medicamento';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamento-detalhado',
  host: {
    class: 'flex flex-col gap-4',
  },
  imports: [
    ButtonModule,
    BackButton,
    Card,
    LucideArrowDownToLine,
    LucideArrowUpFromLine,
    LucidePencil,
    LucideTrash2,
    LucidePill,
    LucideTablets,
    IconColor,
    LucideHandCoins,
    LucidePackage,
    CommonModule,
  ],
  templateUrl: './medicamento-detalhado.html',
  styleUrl: './medicamento-detalhado.css',
})
export class MedicamentoDetalhado implements OnInit {
  protected readonly id = input<string>();
  private readonly medicamentosService = inject(MedicamentosService);
  private readonly router = inject(Router);
  protected readonly medicamento = signal<Medicamento | undefined>(undefined);

  ngOnInit(): void {
    this.getMedicamento();
  }

  getMedicamento(): void {
    const id = Number(this.id());
    if (Number.isNaN(id)) {
      this.router.navigate(['/funcionarios']);
      return;
    }

    this.medicamentosService.getMedicamentoById(id).subscribe({
      next: (res) => {
        this.medicamento.set(res);
      },
    });
  }
}
