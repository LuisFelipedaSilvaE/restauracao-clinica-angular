import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideDynamicIcon, LucideLogOut } from '@lucide/angular';
import { Logo } from '../../shared/components/logo/logo';
import { ButtonModule } from 'primeng/button';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';
import { ProfileColor } from '../../shared/directives/profile-color';
import { isNavigationRouteActive, NAVIGATION_ROUTES } from '../navigation-routes';

@Component({
  selector: 'app-sidebar',
  imports: [LucideDynamicIcon, LucideLogOut, Logo, ButtonModule, RouterModule, ProfileColor],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  protected readonly username = this.authService.getUsername();
  protected readonly userRole = this.authService.getUserRoleLabel();
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly routes = signal(NAVIGATION_ROUTES);
  protected readonly navButtonPt = {
    root: {
      class: 'justify-start!',
    },
    label: {
      class: 'text-md',
    },
  };
  protected readonly logoutBtnPt = {
    root: {
      class: 'justify-start!',
    },
  };

  onLogoutClick() {
    this.authService.logout();
  }

  protected isRouteActive(route: string, routerLinkActive: boolean): boolean {
    return isNavigationRouteActive(route, this.currentUrl(), routerLinkActive);
  }
}
