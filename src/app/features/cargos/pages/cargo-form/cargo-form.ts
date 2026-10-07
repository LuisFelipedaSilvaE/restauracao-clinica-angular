import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormError } from '../../../../shared/components/form-error/form-error';
import { CargosService } from '../../services/cargos-service';
import { MessageService } from 'primeng/api';
import { Cargo } from '../../interfaces/cargo';
import { CargoRequest } from '../../interfaces/cargo-request';

@Component({
  selector: 'cargo-form',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormError,
  ],
  templateUrl: './cargo-form.html',
  styleUrl: './cargo-form.css',
})
export class CargoForm {
  private readonly fb = inject(FormBuilder);
  private readonly cargosService = inject(CargosService);
  private readonly messageService = inject(MessageService);
  private readonly formSubmitted = signal<boolean>(false);
  private readonly currentState = computed(() => {
    const cargo = this.cargo();

    return {
      title: cargo ? 'Editar cargo' : 'Novo cargo',
      btnLabel: cargo ? 'Salvar alterações' : 'Cadastrar cargo',
    };
  });
  readonly cargo = input<Cargo>();
  protected readonly cargoForm = this.fb.group({
    nome: ['', [Validators.required]],
  });
  readonly visible = input.required<boolean>();
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
  readonly hidden = output<void>();

  constructor() {
    effect(() => {
      const cargo = this.cargo();

      if (!cargo) return;

      this.cargoForm.patchValue({
        nome: cargo.nome,
      });
    });
  }

  salvarAlteracoes(): void {
    if (this.cargoForm.invalid) {
      this.cargoForm.markAllAsDirty();
      return;
    }

    const cargo = this.cargo();

    const cargoRequest: CargoRequest = {
      nome: this.cargoForm.controls.nome.value!,
    };

    const request$ = cargo
      ? this.cargosService.updateCargo(cargo.id, cargoRequest)
      : this.cargosService.createCargo(cargoRequest);

    request$.subscribe({
      next: () => {
        this.visibleChange.emit(false);
        this.cargoForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: cargo ? 'Cargo atualizado!' : 'Cargo criado!',
          detail: cargo
            ? 'As alterações foram salvas com sucesso.'
            : 'O cargo foi cadastrado com sucesso.',
          life: 3000,
        });
      },
    });
  }

  isInvalid(controlName: string): boolean | undefined {
    const control = this.cargoForm.get(controlName);
    return control?.invalid && (control?.touched || this.formSubmitted());
  }

  getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    return `Nome do cargo é obrigatório`;
  }
}
