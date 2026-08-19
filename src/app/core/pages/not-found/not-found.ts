import { Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { LucideArrowLeft, LucideHouse, LucideMapPinXInside } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [LucideHouse, LucideArrowLeft, LucideMapPinXInside, ButtonModule, RouterModule],
  host: {
    class: '',
    '[class]': 'containerClasses()',
  },
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {
  inLayout = input<boolean>(false);
  router = inject(Router);
  location = inject(Location);

  protected readonly containerClasses = computed(() => {
    const baseClasses = 'flex items-center justify-center p-8';
    return this.inLayout() ? `${baseClasses} h-full` : `${baseClasses} min-h-screen`;
  });
}
