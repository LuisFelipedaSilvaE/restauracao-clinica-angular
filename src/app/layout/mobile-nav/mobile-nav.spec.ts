import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';
import { MobileNav } from './mobile-nav';

@Component({
  imports: [MobileNav],
  template: `
    <button id="abrir-menu" (click)="open.set(true)">Abrir menu</button>
    <app-mobile-nav [isOpen]="open()" (closeMenu)="open.set(false)" />
    <main id="conteudo-principal">Conteúdo</main>
  `,
})
class TestNavigation {
  readonly open = signal(false);
}

describe('Navegação móvel acessível', () => {
  it('abre com foco no link e fecha com Escape, devolvendo foco ao acionador', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            getUsername: () => 'teste',
            getUserRoleLabel: () => 'Administrador',
            getUserRole: () => 'ADMIN',
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(TestNavigation);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('#abrir-menu') as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement?.tagName).toBe('A');
    expect(fixture.nativeElement.querySelector('main').hasAttribute('inert')).toBe(true);
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(fixture.nativeElement.querySelector('main').hasAttribute('inert')).toBe(false);
    expect(document.body.classList.contains('overflow-hidden')).toBe(false);
  });
});
