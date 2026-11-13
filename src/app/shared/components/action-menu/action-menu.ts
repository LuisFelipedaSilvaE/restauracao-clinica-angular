import { Component, input, signal } from '@angular/core';
import { LucideDynamicIcon, LucideEllipsisVertical } from '@lucide/angular';
import { MenuModule } from 'primeng/menu';
import { AcaoMenu } from '../../interfaces/acao-menu';

@Component({
  selector: 'action-menu',
  host: {
    class: 'inline-flex',
  },
  imports: [MenuModule, LucideDynamicIcon, LucideEllipsisVertical],
  templateUrl: './action-menu.html',
  styleUrl: './action-menu.css',
})
export class ActionMenu {
  private static nextId = 0;
  protected readonly menuId = `acoes-${ActionMenu.nextId++}`;
  protected readonly expanded = signal(false);
  readonly actions = input.required<AcaoMenu[]>();
  readonly ariaLabel = input('Abrir menu de ações');
}
