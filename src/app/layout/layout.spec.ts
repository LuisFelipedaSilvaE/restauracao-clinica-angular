import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { Layout } from './layout';

@Component({ selector: 'app-sidebar', template: '' })
class TestSidebar {}
@Component({ selector: 'app-header', template: '' })
class TestHeader {}

describe('Link de salto ao conteúdo', () => {
  it('move o foco ao main e impede a navegação relativa ao base href', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    TestBed.overrideComponent(Layout, {
      remove: { imports: [Sidebar, Header] },
      add: { imports: [TestSidebar, TestHeader] },
    });
    const fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('main'));
  });
});
