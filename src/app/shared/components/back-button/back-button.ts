import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'back-button',
  imports: [RouterLink, LucideArrowLeft],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  private readonly router = inject(Router);

  readonly label = input.required<string>();
  readonly url = input.required<string>();
  protected readonly urlTree = computed(() => this.router.parseUrl(this.url()));
}
