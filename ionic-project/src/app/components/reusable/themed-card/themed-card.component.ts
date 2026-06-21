import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type CardElevation = 1 | 2 | 3;

@Component({
  selector: 'app-themed-card',
  templateUrl: './themed-card.component.html',
  styleUrls: ['./themed-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ThemedCardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() elevation: CardElevation = 1;
  @Input() headerIcon?: string;
  @Input() headerColor?: string;
  @Input() footerText?: string;
  @Input() clickable: boolean = false;

  get elevationClass(): string {
    return `elevation-${this.elevation}`;
  }
}
