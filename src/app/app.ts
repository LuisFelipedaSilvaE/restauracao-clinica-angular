import { Component, inject, signal } from '@angular/core';
import { PageTitleStrategy } from './core/services/page-title-strategy';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly pageTitle = inject(PageTitleStrategy);
  protected readonly title = signal('clinica-restauracao-angular');
}
