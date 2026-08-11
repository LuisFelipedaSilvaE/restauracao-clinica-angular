import { Component } from '@angular/core';
import {
  LucideEye,
  LucideHeartHandshake,
  LucideLock,
  LucideLogIn,
  LucideUser,
  LucideLockKeyhole,
} from '@lucide/angular';

@Component({
  selector: 'app-login',
  imports: [
    LucideEye,
    LucideHeartHandshake,
    LucideLock,
    LucideLogIn,
    LucideUser,
    LucideLockKeyhole,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
