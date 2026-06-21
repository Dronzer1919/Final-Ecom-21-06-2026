import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShimmerBaseComponent } from '../shimmer-base/shimmer-base.component';

@Component({
  selector: 'app-shimmer-category',
  standalone: true,
  imports: [CommonModule, ShimmerBaseComponent],
  templateUrl: './shimmer-category.component.html',
  styleUrls: ['./shimmer-category.component.scss']
})
export class ShimmerCategoryComponent {
  @Input() count: number = 8;
  @Input() layout: 'grid' | 'horizontal' = 'grid';
  
  get items(): number[] {
    return Array(this.count).fill(0);
  }
}
