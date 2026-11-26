import { Component, input } from '@angular/core';

@Component({
  selector: 'main-icon',
  imports: [],
  templateUrl: './main-icon.html',
  styleUrl: './main-icon.css',
})
export class MainIcon {
  iconClass = input<string>('');
  wrapperClass = input<string>('');
}
