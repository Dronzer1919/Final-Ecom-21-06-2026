import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shimmer-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer-profile.component.html',
  styleUrls: ['./shimmer-profile.component.scss'],
})
export class ShimmerProfileComponent {
  readonly formFields = [0, 1, 2, 3];
  readonly infoRows = [0, 1, 2, 3];
}
