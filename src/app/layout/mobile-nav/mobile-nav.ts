import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  Renderer2,
  signal,
  afterRenderEffect,
  ElementRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FocusTrapModule } from 'primeng/focustrap';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { LucideDynamicIcon, LucideLogOut } from '@lucide/angular';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth-service';
import { ProfileColor } from '../../shared/directives/profile-color';
import { isNavigationRouteActive, navigationRoutesForRole } from '../navigation-routes';

@Component({
  selector: 'app-mobile-nav',
  host: { '(window:resize)': 'closeOnDesktop()' },
  imports: [
    FocusTrapModule,
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
  protected readonly username = this.authService.getUsername();
  protected readonly userRole = this.authService.getUserRoleLabel();
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private returnFocus: HTMLElement | null = null;

  isOpen = input<boolean>(false);
  closeMenu = output<void>();

  protected readonly routes = signal(navigationRoutesForRole(this.authService.getUserRole()));
  private readonly currentUrl = signal(this.router.url);

  protected readonly navButtonPt = {
    root: {
      class: 'justify-start!',
    },
    label: {
      class: 'text-md',
    },
  };

  constructor() {
    afterRenderEffect(() => {
      const main = this.document.getElementById('conteudo-principal');
      if (this.isOpen()) {
        this.returnFocus = this.document.activeElement as HTMLElement;
        main?.setAttribute('inert', '');
        this.element.nativeElement.querySelector<HTMLElement>('a[href]')?.focus();
      } else {
        main?.removeAttribute('inert');
        if (this.returnFocus?.isConnected) this.returnFocus.focus();
        this.returnFocus = null;
      }
    });
    effect(() => {
      if (this.isOpen()) {
        this.renderer.addClass(this.document.body, 'overflow-hidden');
      } else {
        this.renderer.removeClass(this.document.body, 'overflow-hidden');
      }
    });

    this.destroyRef.onDestroy(() => {
      this.renderer.removeClass(this.document.body, 'overflow-hidden');
      this.document.getElementById('conteudo-principal')?.removeAttribute('inert');
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);

        if (this.isOpen()) {
          this.closeMenu.emit();
        }
      });
  }

  onNavigate(): void {
    this.closeMenu.emit();
  }

  protected closeOnDesktop(): void {
    if (this.isOpen() && (this.document.defaultView?.innerWidth ?? 0) >= 1024) {
      this.closeMenu.emit();
    }
  }

  onBackdropClick(): void {
    this.closeMenu.emit();
  }

  onLogoutClick(): void {
    this.closeMenu.emit();
    this.authService.logout();
  }

  protected isRouteActive(route: string, routerLinkActive: boolean): boolean {
    return isNavigationRouteActive(route, this.currentUrl(), routerLinkActive);
  }
}
