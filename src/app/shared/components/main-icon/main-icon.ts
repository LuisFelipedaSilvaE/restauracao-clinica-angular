import { Component, input } from '@angular/core';
import { LucideHeartHandshake } from '@lucide/angular';

@Component({
  selector: 'main-icon',
  imports: [LucideHeartHandshake],
  templateUrl: './main-icon.html',
  styleUrl: './main-icon.css',
})
export class MainIcon {
  iconClass = input<string>('w-20!');
  wrapperClass = input<string>('');
}
