import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    effect(() => {
      this.toasts = this.toastService.toasts();
    });
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'M20 6L9 17l-5-5';
      case 'error':
        return 'M18 6L6 18M6 6l12 12';
      case 'warning':
        return 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z';
      default:
        return 'M12 16v-4M12 8h.01';
    }
  }
}