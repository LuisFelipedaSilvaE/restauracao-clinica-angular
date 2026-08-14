import { Component, inject } from '@angular/core';
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
  LucideHeartHandshake,
  LucideLock,
  LucideLogIn,
  LucideUser,
  LucideLockKeyhole,
} from '@lucide/angular';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { Usuario } from '../../../../core/guards/models/usuario.model';

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
    LucideHeartHandshake,
    LucideLock,
    LucideLogIn,
    LucideUser,
    LucideLockKeyhole,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  styles: [
    `
      :host ::ng-deep .border-error-left [data-pc-section='text'] {
        border-left: 5px solid #ef4444;
        padding-left: 8px;
        border-radius: 4px;
      }
    `,
  ],
})
export class Login {
  messageService = inject(MessageService);
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  mask: boolean = false;
  private router = inject(Router);
  private auth = inject(Auth);

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
    this.formSubmitted = true;

    if (this.loginForm.invalid) return;

    const data: Usuario = {
      username: this.loginForm.get('usuario')?.value,
      password: this.loginForm.get('senha')?.value,
    };

    this.auth.login(data).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Bem-vindo(a)!',
          detail: 'Login realizado com sucesso.',
          life: 3000,
        });
        this.router.navigate(['/']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Login',
          detail: 'Usuário ou senha incorretos.',
          life: 3000,
        });
      },
    });
  }
  isInvalid(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
  getErrorMessage(controlName: string): string | null {
    if (!this.isInvalid(controlName)) return null;

    const control = this.loginForm.get(controlName)!;
    const errorKey = Object.keys(control.errors ?? {})[0];
    const buildMessage = this.errorMessages[errorKey];

    if (!buildMessage) return null;

    return `${this.labels[controlName]} ${buildMessage(control)}`;
  }
}
