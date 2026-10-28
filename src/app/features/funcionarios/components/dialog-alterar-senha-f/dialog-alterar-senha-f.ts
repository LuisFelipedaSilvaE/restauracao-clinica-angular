import { Component, inject, input, model, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PasswordModule } from 'primeng/password';
import { UsersService } from '../../../../core/services/users-service';
import { FormField } from '../../../../shared/components/form-field/form-field';

@Component({
  selector: 'dialog-alterar-senha-f',
  imports: [
    ButtonModule,
    DialogModule,
    PasswordModule,
    KeyFilterModule,
    ReactiveFormsModule,
    FormField,
  ],
  templateUrl: './dialog-alterar-senha-f.html',
  styleUrl: './dialog-alterar-senha-f.css',
})
export class DialogAlterarSenhaF implements OnInit {
  readonly userId = input.required<number>();
  readonly visible = model.required<boolean>();
  protected readonly fb = inject(FormBuilder);
  protected readonly usersService = inject(UsersService);
  protected readonly messageService = inject(MessageService);
  protected readonly loading = this.usersService.loading;
  protected readonly blockspace: RegExp = /^[^\s]+$/;
  private readonly confirmarNovaSenha: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    if (!control.value) return null;
    const novaSenha = this.form.get('novaSenha');

    return novaSenha?.value === control.value ? null : { novaSenhaInvalida: true };
  };
  protected form = this.fb.nonNullable.group({
    novaSenha: ['', [Validators.required]],
    confirmarNovaSenha: ['', [Validators.required, this.confirmarNovaSenha]],
  });
  private readonly formSubmitted = signal<boolean>(false);
  private readonly labels: Record<string, string> = {
    novaSenha: 'Nova senha',
  };
  protected readonly passwordInputPt = {
    pcInputText: { root: { class: 'placeholder:tracking-widest' } },
  };

  ngOnInit(): void {
    this.form.get('novaSenha')?.valueChanges.subscribe(() => {
      const confirmarNovaSenha = this.form.get('confirmarNovaSenha');

      if (confirmarNovaSenha && confirmarNovaSenha.touched) {
        confirmarNovaSenha.updateValueAndValidity();
      }
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

  cancelarAlteracao(): void {
    this.visible.set(false);
    this.form.markAllAsDirty();

    setTimeout(() => {
      this.form.reset();
    }, 200);
  }

  alterarSenha(): void {
    this.usersService.alterarSenha(this.userId(), this.form.controls.novaSenha.value).subscribe({
      next: () => {
        this.visible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Senha atualizada!',
          detail: 'A senha foi alterada com sucesso.',
          life: 3000,
        });
      },
    });
  }
}
