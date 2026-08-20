import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import {
  LucideDynamicIcon,
  LucideHeartHandshake,
  LucideLock,
  LucideLogIn,
  LucideUser,
  LucideLockKeyhole,
  LucideLoaderCircle,
} from '@lucide/angular';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuario } from '../../../../core/guards/models/usuario.model';
import { Logo } from '../../../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  providers: [],
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    FormsModule,
    MessageModule,
    ToastModule,
    LucideDynamicIcon,
    LucideHeartHandshake,
    LucideLock,
    LucideUser,
    LucideLockKeyhole,
    Logo,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  protected readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly authService = inject(Auth);
  protected readonly loginForm: FormGroup;
  protected readonly formSubmitted = signal<boolean>(false);
  protected readonly requestActive = signal<boolean>(false);
  protected readonly loginButtonContent = computed(() => (this.requestActive() ? '' : 'Entrar'));
  protected readonly loginButtonIcon = computed(() =>
    this.requestActive() ? LucideLoaderCircle : LucideLogIn,
  );
  protected readonly messagePt = {
    contentWrapper: {
      class: 'pl-2 rounded-sm border-l-4 border-status-error-border-strong',
    },
  };
  protected readonly passwordInputPt = {
    pcInputText: { root: { class: 'placeholder:tracking-widest' } },
  };

  private readonly errorMessages: Record<string, (control: AbstractControl) => string> = {
    required: () => 'é obrigatório.',
    minlength: (c) => `deve ter no mínimo ${c.getError('minlength').requiredLength} caracteres.`,
    maxlength: (c) => `deve ter no máximo ${c.getError('maxlength').requiredLength} caracteres.`,
  };

  private readonly labels: Record<string, string> = {
    usuario: 'Usuário',
    senha: 'Senha',
  };

  constructor() {
    this.loginForm = new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      senha: new FormControl('', [Validators.required, Validators.maxLength(128)]),
    });
  }

  onSubmit() {
    this.toggleFormAndRequest();

    if (this.loginForm.invalid) return;

    const data: Usuario = {
      username: this.loginForm.get('usuario')?.value,
      password: this.loginForm.get('senha')?.value,
    };

    this.authService.login(data).subscribe({
      next: () => {
        this.toggleFormAndRequest();
        this.messageService.add({
          severity: 'success',
          summary: 'Bem-vindo(a)!',
          detail: 'Login realizado com sucesso.',
          life: 3000,
        });
        this.router.navigate(['/']);
      },
      error: ({ error: { message } }) => {
        this.toggleFormAndRequest();
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Login',
          detail: message,
          life: 3000,
        });
      },
    });
  }

  isInvalid(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted());
  }

  getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    const control = this.loginForm.get(controlName)!;
    const errorKey = Object.keys(control.errors ?? {})[0];
    const buildMessage = this.errorMessages[errorKey];

    if (!buildMessage) return null;

    return `${this.labels[controlName]} ${buildMessage(control)}`;
  }

  private toggleFormAndRequest(): void {
    this.formSubmitted.update((value) => !value);
    this.requestActive.update((value) => !value);
  }
}
