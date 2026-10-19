import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucidePill } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'app-medicamento-form',
  host: {
    class: 'flex flex-col gap-4',
  },
  imports: [
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    DividerModule,
    FormHeader,
    Card,
    FormField,
    ReactiveFormsModule,
  ],
  templateUrl: './medicamento-form.html',
  styleUrl: './medicamento-form.css',
})
export class MedicamentoForm implements OnInit {
  protected readonly id = input<string>();
  private readonly fb = inject(FormBuilder);
  private readonly medicamentosService = inject(MedicamentosService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  protected readonly medicamentoForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    preco: this.fb.control<number | null>(null, [Validators.required]),
    unidadeControle: ['', [Validators.required]],
    estoque: this.fb.control<number | null>(null, [Validators.required]),
  });
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly modo = computed<FormState>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly btnLabel = computed(() => {
    return this.modo() === 'registro' ? 'Cadastrar medicamento' : 'Salvar alterações';
  });
  protected readonly headerInfo = computed(() => {
    const modo = this.modo();

    return {
      value: modo === 'registro' ? 'Novo medicamento' : 'Editar medicamento',
      label:
        modo === 'registro'
          ? 'Cadastre um medicamento e defina seu estoque inicial e nível de alerta.'
          : 'Atualize os dados e as informações cadastrais deste medicamento.',
      icon: LucidePill,
      color: '#be222d',
    };
  });
  private readonly labels: Record<string, string> = {
    nome: 'Nome do medicamento',
    preco: 'Preço',
    unidadeControle: 'Unidade de controle',
    estoque: 'Estoque inicial',
  };

  ngOnInit(): void {
    if (this.id()) {
      this.getMedicamento();
    }
  }

  getMedicamento(): void {
    const idNumerico = Number(this.id());

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
      this.router.navigate(['/medicamentos']);
      return;
    }

    this.medicamentosService.getMedicamentoById(idNumerico).subscribe({
      next: (medicamento) => {
        if (!medicamento) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Funcionário não encontrado',
            detail: 'O registro solicitado não existe ou foi removido.',
            life: 4000,
          });

          this.router.navigate(['/medicamentos']);
          return;
        }
        const { id, ...medicamentoFormData } = medicamento;

        this.medicamentoForm.patchValue(medicamentoFormData);
      },
      error: () => {
        this.router.navigate(['/medicamentos']);
      },
    });
  }

  limparForm(): void {
    this.formSubmitted.set(false);
    this.medicamentoForm.reset();

    this.router.navigate(['/medicamentos']);
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.medicamentoForm.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.medicamentoForm.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    return `${this.labels[controlName]} é inválido`;
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.medicamentoForm.invalid) {
      this.medicamentoForm.markAllAsDirty();
      return;
    }

    const rawForm = this.medicamentoForm.getRawValue();
    const medicamento = {
      ...rawForm,
      preco: rawForm.preco!,
      estoque: rawForm.estoque!,
    };

    const id = this.id();
    const request$ = id
      ? this.medicamentosService.updateMedicamento(Number(id), medicamento)
      : this.medicamentosService.createMedicamento(medicamento);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Medicamento atualizado!' : 'Medicamento criado!',
          detail: id
            ? 'As alterações foram salvas com sucesso.'
            : 'O medicamento foi cadastrado com sucesso.',
          life: 3000,
        });

        this.router.navigate(['/medicamentos']);
      },
    });
  }
}
