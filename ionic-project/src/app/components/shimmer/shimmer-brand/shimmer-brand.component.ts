import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerBaseComponent } from '../shimmer-base/shimmer-base.component';

@Component({
  selector: 'app-shimmer-brand',
  standalone: true,
  imports: [CommonModule, ShimmerBaseComponent],
  templateUrl: './shimmer-brand.component.html',
  styleUrls: ['./shimmer-brand.component.scss']
})
export class ShimmerBrandComponent {
  @Input() count: number = 6;
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
