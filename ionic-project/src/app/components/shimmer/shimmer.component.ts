import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ShimmerType = 'banner' | 'brand' | 'product' | 'category' | 'b2b-category' | 'b2b-supplier' | 'b2b-table' | 'cart' | 'footer';

@Component({
  selector: 'app-shimmer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer.component.html',
  styleUrls: ['./shimmer.component.scss'],
})
export class ShimmerComponent {
  @Input() type: ShimmerType = 'product';
  @Input() count = 6;
  @Input() layout: 'grid' | 'horizontal' = 'grid';

  get placeholders(): number[] {
    return Array.from({ length: this.count }, (_, index) => index);
  }
}