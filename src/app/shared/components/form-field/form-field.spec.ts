import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { RestoreDialogFocus } from '../../directives/restore-dialog-focus';
import { FormField } from './form-field';
import { AutoFocusError } from '../../directives/auto-focus-error';
import { AccessiblePassword } from '../../directives/accessible-password';

@Component({
  imports: [
    FormField,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    PasswordModule,
    InputNumberModule,
    AutoFocusError,
    AccessiblePassword,
  ],
  template: `
    <form autoFocusError [formGroup]="form" (ngSubmit)="error.set('Campo obrigatório')">
      <form-field
        label="Nome"
        inputId="nome"
        required
        hint="Informe o nome completo"
        [errorMessage]="error()"
      >
        <input id="nome" formControlName="nome" autocomplete="off" aria-describedby="outra-dica" />
      </form-field>
      <span id="outra-dica">Outra instrução</span>
      <form-field label="Cargo" inputId="cargo" required [errorMessage]="error()">
        <p-select inputId="cargo" [options]="['Recepção']" />
      </form-field>
      <form-field label="Data" inputId="data" required [errorMessage]="error()">
        <p-datepicker inputId="data" />
      </form-field>
      <form-field label="Senha" inputId="senha" required [errorMessage]="error()">
        <p-password
          accessiblePassword
          inputId="senha"
          [toggleMask]="true"
          [feedback]="false"
          autocomplete="off"
        />
      </form-field>
      <form-field label="Quantidade" inputId="quantidade" required [errorMessage]="error()">
        <p-inputnumber inputId="quantidade" autocomplete="off" />
      </form-field>
      <button type="submit">Salvar</button>
    </form>
  `,
})
class TestForm {
  readonly error = signal<string | null>(null);
  readonly form = new FormGroup({ nome: new FormControl('', Validators.required) });
}

@Component({
  imports: [DialogModule, RestoreDialogFocus],
  template: `
    <button id="abrir-dialogo" (click)="open.set(true)">Abrir diálogo</button>
    <p-dialog [visible]="open()" [restoreDialogFocus]="open()" header="Confirmação" [modal]="true">
      <button (click)="open.set(false)">Cancelar</button>
    </p-dialog>
  `,
})
class TestDialog {
  readonly open = signal(false);
}

describe('Acessibilidade de formulários', () => {
  it('devolve o foco ao acionador quando um diálogo fecha', async () => {
    const fixture = TestBed.createComponent(TestDialog);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('#abrir-dialogo') as HTMLButtonElement;
    trigger.focus();
    trigger.click();
    await fixture.whenStable();
    const cancel = fixture.nativeElement.querySelector(
      'p-dialog button:not(.p-dialog-close-button)',
    ) as HTMLButtonElement;
    cancel.focus();
    fixture.componentInstance.open.set(false);
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
  });
  async function setup() {
    const fixture = TestBed.createComponent(TestForm);
    await fixture.whenStable();
    return fixture;
  }

  it('associa rótulos e erros ao elemento focável de cada controle PrimeNG', async () => {
    const fixture = await setup();
    fixture.componentInstance.error.set('Campo obrigatório');
    await fixture.whenStable();
    for (const id of ['nome', 'cargo', 'data', 'senha', 'quantidade']) {
      const control = fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
      expect(control.getAttribute('aria-labelledby')).toBe(`${id}-label`);
      expect(control.getAttribute('aria-required')).toBe('true');
      expect(control.getAttribute('aria-invalid')).toBe('true');
      expect(control.getAttribute('aria-describedby')).toContain(`${id}-erro`);
      expect(fixture.nativeElement.querySelector(`#${id}-erro`)).not.toBeNull();
    }
  });

  it('remove o erro resolvido e preserva as dicas existentes', async () => {
    const fixture = await setup();
    fixture.componentInstance.error.set('Campo obrigatório');
    await fixture.whenStable();
    fixture.componentInstance.error.set(null);
    await fixture.whenStable();
    const control = fixture.nativeElement.querySelector('#nome') as HTMLElement;
    expect(control.getAttribute('aria-invalid')).toBe('false');
    expect(control.getAttribute('aria-describedby')).toBe('outra-dica nome-dica');
    expect(fixture.nativeElement.querySelector('#nome-erro')).toBeNull();
  });

  it('foca o primeiro controle inválido após a tentativa de envio', async () => {
    const fixture = await setup();
    const control = fixture.nativeElement.querySelector('#nome') as HTMLInputElement;
    vi.spyOn(control, 'getClientRects').mockReturnValue({ length: 1 } as DOMRectList);
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(control);
  });

  it('permite mostrar e ocultar a senha usando Enter e Espaço', async () => {
    const fixture = await setup();
    let toggle = fixture.nativeElement.querySelector('p-password [role="button"]') as HTMLElement;
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar senha');
    toggle.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#senha').type).toBe('text');
    toggle = fixture.nativeElement.querySelector('p-password [role="button"]');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar senha');
    toggle.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
    );
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#senha').type).toBe('password');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Mostrar senha');
  });
});
