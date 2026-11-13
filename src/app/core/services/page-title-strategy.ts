import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  readonly announcement = signal('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? 'Clínica Restauração';
    this.title.setTitle(`${title} | Clínica Restauração`);
    this.announcement.set(`Página: ${title}`);
  }
}
