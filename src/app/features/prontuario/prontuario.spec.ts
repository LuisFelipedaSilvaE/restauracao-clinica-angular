import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth-service';
import { AcolhidosService } from '../acolhidos/services/acolhidos-service';
import { InternacoesService } from '../internacoes/services/internacoes-service';
import { Prontuario } from './prontuario';

@Component({ template: '<p>Conteúdo da seção</p>' })
class TestSection {}

describe('Abas do prontuário', () => {
  afterEach(() => vi.unstubAllGlobals());
  async function setup() {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            {
              path: 'prontuarios/:acolhidoId',
              component: Prontuario,
              children: [
                { path: 'internacoes', component: TestSection },
                { path: 'dados-pessoais', component: TestSection },
                { path: 'pagamentos', component: TestSection },
              ],
            },
          ],
          withComponentInputBinding(),
        ),
        MessageService,
        { provide: AuthService, useValue: { hasRole: () => false } },
        {
          provide: AcolhidosService,
          useValue: {
            loading: signal({ detail: false, mutation: false }),
            getAcolhidoById: () => of(null),
          },
        },
        {
          provide: InternacoesService,
          useValue: {
            loading: signal({ list: false }),
            internacoes: signal([]),
            getAllInternacoes: () => of([]),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create(
      '/prontuarios/1/internacoes?origem=acolhidos',
    );
    await harness.fixture.whenStable();
    return harness;
  }

  it('associa cada aba a um painel, identificando o conteúdo ativo', async () => {
    const harness = await setup();
    const host = harness.routeNativeElement!;
    for (const tab of host.querySelectorAll<HTMLElement>('[role="tab"]')) {
      const panel = host.querySelector<HTMLElement>(`[id="${tab.getAttribute('aria-controls')}"]`);
      expect(panel).not.toBeNull();
      expect(panel!.getAttribute('aria-labelledby')).toBe(tab.id);
      expect(panel!.hidden).toBe(tab.getAttribute('aria-selected') !== 'true');
    }
    expect(host.querySelector('[role="tabpanel"]:not([hidden])')?.textContent).toContain(
      'Conteúdo da seção',
    );
  });

  it.each([
    { key: 'Enter', code: 'Enter' },
    { key: ' ', code: 'Space' },
  ])('abre a rota da aba com $code, preservando o contexto', async ({ key, code }) => {
    const harness = await setup();
    const tabs = harness.routeNativeElement!.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs[2].dispatchEvent(
      new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }),
    );
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/prontuarios/1/pagamentos?origem=acolhidos');
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
  });
});
