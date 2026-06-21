import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BrandService, Brand } from '../services/brand.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  brands: Brand[] = [];
  loading = false;
  error: string | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalBrands = 0;
  totalPages = 0;
  pages: number[] = [];
  
  // Make Math available in template
  Math = Math;

  constructor(
    private brandService: BrandService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('BrandsComponent initialized');
    this.loadBrands();
  }

  loadBrands(): void {
    console.log('loadBrands called, loading:', this.loading);
    this.loading = true;
    this.error = null;
    console.log('Making API request to getAllBrands...');

    this.brandService.getAllBrands(this.currentPage, this.pageSize)
      .pipe(
        finalize(() => {
          console.log('finalize called, setting loading to false');
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Brands response received:', response);
          console.log('Brands array:', response.data.brands);
          console.log('Pagination:', response.data.pagination);
          this.brands = response.data.brands;
          this.totalBrands = response.data.pagination.totalItems;
          this.totalPages = response.data.pagination.totalPages;
          this.currentPage = response.data.pagination.currentPage;
          this.generatePageNumbers();
          console.log('Brands loaded:', this.brands.length, 'loading:', this.loading);
        },
        error: (err) => {
          console.error('Error loading brands:', err);
          this.error = 'Failed to load brands. Please try again.';
        }
      });
  }

  generatePageNumbers(): void {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    this.pages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadBrands();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  navigateToBrand(brandId: string): void {
    this.router.navigate(['/shop/brand', brandId]);
  }

  navigateHome(): void {
    this.router.navigate(['/home']);
  }

  getBrandLogo(brand: Brand): string {
    return brand.logo || 'assets/images/brand-placeholder.jpg';
  }
}
