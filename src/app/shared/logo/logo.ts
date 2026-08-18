import { Component, input } from '@angular/core';
import { MainIcon } from '../main-icon/main-icon';

@Component({
  selector: 'logo',
  imports: [MainIcon],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  wrapperClass = input<string>('');
  textClass = input<string>('');
  hideText = input<boolean>(false);

  iconClass = input<string>('');
  iconWrapperClass = input<string>('');
}
