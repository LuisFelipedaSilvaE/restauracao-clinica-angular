import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { CargosService } from '../../../cargos/services/cargos-service';
import { Funcionario } from '../../interfaces/funcionario';

@Component({
  selector: 'dialog-edicao-funcionario',
  imports: [
    ButtonModule,
    DialogModule,
    ReactiveFormsModule,
    FormField,
    SelectModule,
    PasswordModule,
    KeyFilterModule,
  ],
  templateUrl: './dialog-edicao-funcionario.html',
  styleUrl: './dialog-edicao-funcionario.css',
})
export class DialogEdicaoFuncionario {
  readonly funcionario = input.required<Funcionario>();
  readonly cargosService = inject(CargosService);
  readonly cargos = this.cargosService.cargos;
  readonly visible = model.required<boolean>();
  readonly onConfirm = output<void>();
  readonly hidden = output<void>();
  protected fb = inject(FormBuilder);
  protected form!: FormGroup;
  readonly type = model.required<'cargo' | 'senha' | null>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly loading = input(false);
  private readonly formSubmitted = signal<boolean>(false);
  private readonly confirmarNovaSenha: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!control.value) return null;
    const novaSenha = this.form.get('novaSenha');

    return novaSenha?.value === control.value ? null : { novaSenhaInvalida: true };
  };
  private readonly labels: Record<string, string> = {
    novoCargo: 'Novo cargo',
    novaSenha: 'Nova senha',
  };
  protected readonly passwordInputPt = {
    pcInputText: { root: { class: 'placeholder:tracking-widest' } },
  };

  constructor() {
    effect(() => {
      const type = this.type();
      const funcionario = this.funcionario();

      if (!type) return;

      if (type === 'cargo') {
        this.cargosService.getAllCargos().subscribe();

        this.form = this.fb.group({
          novoCargo: [funcionario.cargo.id, [Validators.required]],
        });
        return;
      }

      this.form = this.fb.group({
        novaSenha: ['', [Validators.required]],
        confirmarNovaSenha: ['', [Validators.required, this.confirmarNovaSenha]],
      });

      this.form.get('novaSenha')?.valueChanges.subscribe(() => {
        const confirmarNovaSenha = this.form.get('confirmarNovaSenha');

        if (confirmarNovaSenha && confirmarNovaSenha.touched) {
          confirmarNovaSenha.updateValueAndValidity();
        }
      });
    });
  }

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (controlName === 'confirmarNovaSenha') {
      if (control.errors['required']) {
        return `Confirme a nova senha`;
      }

      if (control.errors['novaSenhaInvalida']) {
        return `Informe senhas iguais`;
      }
    }

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    return `${this.labels[controlName]} é inválido`;
  }

  cancelarEdicao(): void {
    this.visible.set(false);
    this.form.markAllAsDirty();

    setTimeout(() => {
      if (this.type() === 'cargo') {
        this.form.get('novoCargo')?.setValue(this.funcionario().cargo.id);
        return;
      }

      this.form.reset();
    }, 200);
  }
}
