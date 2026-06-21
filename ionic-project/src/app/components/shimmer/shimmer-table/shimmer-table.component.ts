import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TABLE_SHIMMER_CONFIGS,
  TableShimmerColumn,
  detectDevice,
} from '../shimmer.config';

@Component({
  selector: 'app-shimmer-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shimmer-table.component.html',
  styleUrls: ['./shimmer-table.component.scss'],
})
export class ShimmerTableComponent implements OnInit, OnDestroy {
  /** Page key matching TABLE_SHIMMER_CONFIGS keys, e.g. 'brands', 'category' */
  @Input() page: string = 'default';
  /** Override row count (falls back to config default) */
  @Input() rows: number = 0;
  /** Show the page-header shimmer (title + action buttons) */
  @Input() showHeader: boolean = true;
  /** Show the filters bar shimmer */
  @Input() showFilters: boolean = true;
  /** Show the pagination shimmer */
  @Input() showPagination: boolean = true;

  device: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  private resizeListener?: () => void;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.device = detectDevice();
    this.resizeListener = () => {
      const d = detectDevice();
      if (d !== this.device) {
        this.device = d;
        this.cdr.detectChanges();
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy() {
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
  }

  get config() {
    return TABLE_SHIMMER_CONFIGS[this.page] ?? TABLE_SHIMMER_CONFIGS['default'];
  }

  get columns(): TableShimmerColumn[] {
    return this.config.columns;
  }

  /** Visible columns based on device */
  get visibleColumns(): TableShimmerColumn[] {
    if (this.device === 'mobile') {
      return this.config.columns.filter(c => !c.mobileHide);
    }
    return this.config.columns;
  }

  get rowArray(): number[] {
    const count = this.rows > 0 ? this.rows : (this.config.rows ?? 8);
    return Array(count).fill(0);
  }

  get filterArray(): number[] {
    return Array(this.config.filters).fill(0);
  }

  /** Icon buttons in the page header (PDF, Excel, Refresh, Sort) */
  readonly iconButtons: number[] = [0, 1, 2, 3];
  /** Action buttons in the page header (Add, Import) */
  readonly actionButtons: number[] = [0, 1];
  /** Action icons per row (view/edit/delete) */
  readonly rowActions: number[] = [0, 1, 2];
  /** Pagination page buttons */
  readonly pageButtons: number[] = [0, 1, 2, 3, 4];
}
