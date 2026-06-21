import { Component, OnInit, OnDestroy, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrandService, Brand } from '../../services/brand.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brands.page.html',
  styleUrls: ['./brands.page.scss']
})
export class BrandsPage implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('loadTrigger', { static: false }) loadTrigger?: ElementRef<HTMLDivElement>;
  
  brands: Brand[] = [];
  shimmerBrands: any[] = Array(12).fill(null);
  loading = false;
  loadingMore = false;
  error: string | null = null;
  hasMoreData = true;

  currentPage = 1;
  pageSize = 12;
  totalBrands = 0;
  private observer: IntersectionObserver | null = null;

  private observerAttached = false;

  private destroy$ = new Subject<void>();

  constructor(private brandService: BrandService, private router: Router) {}

  ngOnInit(): void { 
    this.loadBrands();
  }

  ngAfterViewChecked(): void {
    if (this.loadTrigger && !this.observerAttached) {
      this.observerAttached = true;
      this.initInfiniteScrollObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBrands(): void {
    this.loading = true;
    this.error = null;
    this.currentPage = 1;
    this.brands = [];
    this.hasMoreData = true;
    this.observerAttached = false;
    this.observer?.disconnect();
    this.observer = null;

    this.brandService.getAllBrands(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => { this.loading = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.brands = response.data?.brands || response.data || [];
          const pagination = response.data?.pagination;
          this.totalBrands = pagination?.totalItems || this.brands.length;
          this.hasMoreData = (this.currentPage * this.pageSize) < this.totalBrands;
        },
        error: () => { this.error = 'Failed to load brands. Please try again.'; }
      });
  }

  loadMoreBrands(): void {
    if (this.loadingMore || !this.hasMoreData || this.error) return;

    this.loadingMore = true;
    this.currentPage++;

    this.brandService.getAllBrands(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => { this.loadingMore = false; }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          const newBrands = response.data?.brands || response.data || [];
          this.brands = [...this.brands, ...newBrands];
          const pagination = response.data?.pagination;
          this.totalBrands = pagination?.totalItems || this.totalBrands;
          this.hasMoreData = (this.currentPage * this.pageSize) < this.totalBrands;
        },
        error: () => { this.loadingMore = false; }
      });
  }

  private initInfiniteScrollObserver(): void {
    if (!this.loadTrigger) {
      return;
    }

    this.observer?.disconnect();
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.loadMoreBrands();
        }
      },
      { root: null, threshold: 0.1, rootMargin: '0px 0px 220px 0px' }
    );

    this.observer.observe(this.loadTrigger.nativeElement);
  }

  retry(): void {
    if (this.loading) {
      return;
    }

    this.loadBrands();
  }

  getBrandLogo(brand: Brand): string {
    return brand?.logo || 'assets/images/placeholder.png';
  }

  navigateHome(): void { this.router.navigate(['/home']); }
}
