import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PageTitleStrategy } from './page-title-strategy';

@Component({ template: '' })
class TestPage {}

describe('Títulos e anúncio de navegação', () => {
  it('anuncia o título da rota filha e atualiza o título do documento', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'prontuario',
            title: 'Prontuário',
            children: [
              { path: 'pagamentos', title: 'Pagamentos do prontuário', component: TestPage },
            ],
          },
        ]),
        { provide: TitleStrategy, useExisting: PageTitleStrategy },
      ],
    });
    await TestBed.inject(Router).navigateByUrl('/prontuario/pagamentos');
    expect(TestBed.inject(Title).getTitle()).toBe('Pagamentos do prontuário | Clínica Restauração');
    expect(TestBed.inject(PageTitleStrategy).announcement()).toBe(
      'Página: Pagamentos do prontuário',
    );
  });
});
