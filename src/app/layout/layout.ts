import { Component, ElementRef, inject } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';
import { Header } from './header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  protected skipToContent(event: MouseEvent): void {
    // A fragment-only URL otherwise resolves against <base href="/"> in a SPA.
    event.preventDefault();
    this.element.nativeElement.querySelector<HTMLElement>('#conteudo-principal')?.focus();
  }
}
