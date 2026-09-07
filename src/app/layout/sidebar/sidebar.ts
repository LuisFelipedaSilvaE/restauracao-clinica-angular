import { Component, inject, signal } from '@angular/core';
import { LucideDynamicIcon, LucideLogOut } from '@lucide/angular';
import { Logo } from '../../shared/components/logo/logo';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { ProfileColor } from '../../shared/directives/profile-color';
import { NAVIGATION_ROUTES } from '../navigation-routes';

@Component({
  selector: 'app-sidebar',
  imports: [LucideDynamicIcon, LucideLogOut, Logo, ButtonModule, RouterModule, ProfileColor],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  protected readonly activeRoute = inject(ActivatedRoute);
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
}
