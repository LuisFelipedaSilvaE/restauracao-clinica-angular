import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucidePencil } from '@lucide/angular';
import { DialogModule } from 'primeng/dialog';
import { RestoreDialogFocus } from '../../directives/restore-dialog-focus';
import { ActionMenu } from './action-menu';

@Component({
  imports: [ActionMenu, DialogModule, RestoreDialogFocus],
  template: `
    <action-menu [actions]="actions" ariaLabel="Ações do registro de teste" />
    <p-dialog [visible]="open()" [restoreDialogFocus]="open()" header="Detalhes" [modal]="true">
      <button id="fechar-detalhes" (click)="open.set(false)">Fechar</button>
    </p-dialog>
  `,
})
class TestActions {
  readonly open = signal(false);
  readonly command = vi.fn(() => this.open.set(true));
  readonly actions = [
    {
      label: 'Editar registro',
      lucideIcon: LucidePencil,
      iconClass: 'h-4 w-4',
      command: this.command,
    },
  ];
}

describe('Menu de ações acessível', () => {
  it.each([
    { key: 'Enter', code: 'Enter' },
    { key: ' ', code: 'Space' },
  ])(
    'executa a opção com $code e devolve o foco ao acionador após o diálogo',
    async ({ key, code }) => {
      const fixture = TestBed.createComponent(TestActions);
      await fixture.whenStable();
      const trigger = fixture.nativeElement.querySelector(
        'action-menu > button',
      ) as HTMLButtonElement;
      trigger.focus();
      trigger.click();
      await fixture.whenStable();
      const list = document.querySelector('[role="menu"]') as HTMLElement;
      expect(list).not.toBeNull();
      list.focus();
      list.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Home',
          code: 'Home',
          bubbles: true,
          cancelable: true,
        }),
      );
      list.dispatchEvent(
        new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }),
      );
      await fixture.whenStable();
      expect(fixture.componentInstance.command).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.open()).toBe(true);
      const close = fixture.nativeElement.querySelector('#fechar-detalhes') as HTMLButtonElement;
      close.focus();
      close.click();
      await fixture.whenStable();
      expect(document.activeElement).toBe(trigger);
    },
  );
});
