import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shimmer-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer-dashboard-home.component.html',
  styleUrls: ['./shimmer-dashboard-home.component.scss'],
})
export class ShimmerDashboardHomeComponent {
  readonly stats = [0, 1, 2, 3];
  readonly chartCards = [0, 1, 2];
  readonly listRows = [0, 1, 2, 3, 4];
}
