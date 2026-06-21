import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

export type ButtonColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'medium';
export type ButtonFill = 'solid' | 'outline' | 'clear';
export type ButtonSize = 'small' | 'default' | 'large';
export type ButtonExpand = 'block' | 'full';

@Component({
  selector: 'app-themed-button',
  templateUrl: './themed-button.component.html',
  styleUrls: ['./themed-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ThemedButtonComponent {
  @Input() color: ButtonColor = 'primary';
  @Input() fill: ButtonFill = 'solid';
  @Input() size: ButtonSize = 'default';
  @Input() expand?: ButtonExpand;
  @Input() disabled: boolean = false;
  @Input() icon?: string;
  @Input() iconSlot: 'start' | 'end' | 'icon-only' = 'start';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() buttonClick = new EventEmitter<Event>();

  onClick(event: Event) {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
