import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';

@Component({
  selector: 'back-button',
  imports: [RouterLink, LucideArrowLeft],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  readonly label = input.required<string>();
  readonly url = input.required<string>();
}
