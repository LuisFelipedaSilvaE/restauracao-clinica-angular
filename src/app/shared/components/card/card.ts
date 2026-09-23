import { Component } from '@angular/core';

@Component({
  selector: 'card',
  host: {
    class: 'bg-surface-card border border-border-default rounded-xl p-4',
  },
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {}
