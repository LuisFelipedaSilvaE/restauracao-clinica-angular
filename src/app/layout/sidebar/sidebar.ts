import { Component, inject, signal } from '@angular/core';
import {
  LucideBriefcase,
  LucideChartColumn,
  LucideClipboardCheck,
  LucideDynamicIcon,
  LucideFileText,
  LucideIcon,
  LucideLayers,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideStethoscope,
  LucideUsersRound,
} from '@lucide/angular';
import { Logo } from '../../shared/components/logo/logo';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface ButtonRoute {
  label: string;
  route: string;
  icon: LucideIcon;
}

@Component({
  selector: 'app-sidebar',
  imports: [LucideDynamicIcon, LucideLogOut, Logo, ButtonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly activeRoute = inject(ActivatedRoute);
  protected readonly routes = signal<ButtonRoute[]>([
    { label: 'Dashboard', route: 'dashboard', icon: LucideLayoutDashboard },
    { label: 'Modalidades', route: 'modalidades', icon: LucideLayers },
    { label: 'Acolhidos', route: 'acolhidos', icon: LucideUsersRound },
    { label: 'Funcionários', route: 'funcionarios', icon: LucideBriefcase },
    { label: 'Relatórios', route: 'relatorios', icon: LucideChartColumn },
    { label: 'Declarações', route: 'declaracoes', icon: LucideFileText },
    { label: 'Laudos', route: 'laudos', icon: LucideClipboardCheck },
    { label: 'Triagens', route: 'triagens', icon: LucideStethoscope },
  ]);
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
}
