import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LucideDynamicIcon, LucideLogOut } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth-service';
import { ProfileColor } from '../../shared/directives/profile-color';
import { NAVIGATION_ROUTES } from '../navigation-routes';

@Component({
  selector: 'app-mobile-nav',
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    LucideDynamicIcon,
    LucideLogOut,
    ProfileColor,
  ],
  templateUrl: './mobile-nav.html',
  styleUrl: './mobile-nav.css',
})
export class MobileNav {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  isOpen = input<boolean>(false);
  closeMenu = output<void>();

  protected readonly routes = signal(NAVIGATION_ROUTES);

  protected readonly navButtonPt = {
    root: {
      class: 'justify-start!',
    },
    label: {
      class: 'text-md',
    },
  };

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.renderer.addClass(this.document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(this.document.body, 'overflow-hidden');
      }
    });

    this.destroyRef.onDestroy(() => {
      this.renderer.removeClass(this.document.body, 'overflow-hidden');
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.isOpen()) {
        this.closeMenu.emit();
      }
    });
  }

  onNavigate(): void {
    this.closeMenu.emit();
  }

  onBackdropClick(): void {
    this.closeMenu.emit();
  }

  onLogoutClick(): void {
    this.closeMenu.emit();
    this.authService.logout();
  }
}
