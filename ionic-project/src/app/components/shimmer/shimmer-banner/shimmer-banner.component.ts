import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerBaseComponent } from '../shimmer-base/shimmer-base.component';

@Component({
  selector: 'app-shimmer-banner',
  standalone: true,
  imports: [CommonModule, ShimmerBaseComponent],
  templateUrl: './shimmer-banner.component.html',
  styleUrls: ['./shimmer-banner.component.scss']
})
export class ShimmerBannerComponent {}
