import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerBaseComponent } from '../shimmer-base/shimmer-base.component';

@Component({
  selector: 'app-shimmer-product-card',
  standalone: true,
  imports: [CommonModule, ShimmerBaseComponent],
  templateUrl: './shimmer-product-card.component.html',
  styleUrls: ['./shimmer-product-card.component.scss']
})
export class ShimmerProductCardComponent {
  @Input() count: number = 8;
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
