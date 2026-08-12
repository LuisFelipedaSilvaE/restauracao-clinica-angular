import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
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

@Component({
  selector: 'app-login',
  providers: [MessageService],
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    FormsModule,
    MessageModule,
    LucideHeartHandshake,
    LucideLock,
    LucideLogIn,
    LucideUser,
    LucideLockKeyhole,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  messageService = inject(MessageService);
  loginForm: FormGroup;
  formSubmitted: boolean = false;
  mask: boolean = false;

  constructor() {
    this.loginForm = new FormGroup({
      usuario: new FormControl('', [Validators.required]),
      senha: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.loginForm.valid) {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Form is submitted',
        life: 3000,
      });
    }
  }
  isInvalid(controlName: string) {
    const control = this.loginForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}
