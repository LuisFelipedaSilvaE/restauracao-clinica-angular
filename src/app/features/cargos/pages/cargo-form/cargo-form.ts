import { RestoreDialogFocus } from '../../../../shared/directives/restore-dialog-focus';
import { AutoFocusError } from '../../../../shared/directives/auto-focus-error';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { CargosService } from '../../services/cargos-service';
import { MessageService } from 'primeng/api';
import { Cargo } from '../../interfaces/cargo';
import { CargoRequest } from '../../interfaces/cargo-request';
import { comprimentoTextoValidator } from '../../../../shared/validators/texto-validator';

@Component({
  selector: 'cargo-form',
  imports: [
    RestoreDialogFocus,
    AutoFocusError,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    FormField,
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
    nome: ['', [Validators.required, comprimentoTextoValidator(3, 250)]],
  });
  readonly visible = input.required<boolean>();
  readonly loading = input(false);

  readonly visibleChange = output<boolean>();
  readonly hidden = output<void>();

  constructor() {
    effect(() => {
      const cargo = this.cargo();
      this.formSubmitted.set(false);

      if (!cargo) {
        this.cargoForm.reset({ nome: '' });
        return;
      }

      this.cargoForm.patchValue({
        nome: cargo.nome,
      });
    });
  }

  salvarAlteracoes(): void {
    this.formSubmitted.set(true);
    this.cargoForm.markAllAsTouched();

    if (this.cargoForm.invalid) return;

    const cargo = this.cargo();

    const cargoRequest: CargoRequest = {
      nome: this.cargoForm.controls.nome.value!.trim(),
    };

    const request$ = cargo
      ? this.cargosService.updateCargo(cargo.id, cargoRequest)
      : this.cargosService.createCargo(cargoRequest);

    request$.subscribe({
      next: () => {
        this.visibleChange.emit(false);
        this.formSubmitted.set(false);
        this.cargoForm.reset({ nome: '' });
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
    const control = this.cargoForm.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (control.errors['required']) {
      return 'Nome do cargo é obrigatório';
    }

    if (control.errors['minlength']) {
      const { requiredLength } = control.errors['minlength'];
      return `Nome do cargo deve ter pelo menos ${requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      const { requiredLength } = control.errors['maxlength'];
      return `Nome do cargo deve ter no máximo ${requiredLength} caracteres`;
    }

    return 'Nome do cargo é inválido';
  }
}
