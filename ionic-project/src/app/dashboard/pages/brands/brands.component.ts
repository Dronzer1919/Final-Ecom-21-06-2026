import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';
import { BrandService, Brand } from '../../../services/brand.service';
import { ToastService } from '../../../services/toast.service';
import { ExportService, ExportColumn } from '../../../services/export.service';

@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = 'Status';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  isLoading: boolean = false;
  error: string = '';

  brands: Brand[] = [];

  // Edit modal state
  showEditModal = false;
  editingBrand: Brand = { name: '', code: '' };
  isEditSubmitting = false;
  editError = '';

  private toastService = inject(ToastService);

  constructor(
    private brandService: BrandService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.isLoading = true;
    this.error = '';
    
    const isActiveFilter = this.selectedStatus === 'Active' ? true : 
                           this.selectedStatus === 'Inactive' ? false : undefined;

    this.brandService.getAllBrands(
      this.currentPage, 
      this.rowsPerPage, 
      this.searchTerm || undefined,
      isActiveFilter
    ).subscribe({
      next: (response) => {
        this.brands = response.data.brands;
        this.totalPages = response.data.pagination.totalPages;
        this.totalItems = response.data.pagination.totalItems;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Error loading brands');
        this.error = err.error?.message || 'Failed to load brands';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get paginatedBrands(): Brand[] {
    return this.brands;
  }

  get totalPagesCount(): number {
    return this.totalPages;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadBrands();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.loadBrands();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadBrands();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadBrands();
  }

  editBrand(brand: Brand): void {
    this.editingBrand = { ...brand };
    this.editError = '';
    this.isEditSubmitting = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = '';
    this.isEditSubmitting = false;
  }

  saveEditBrand(): void {
    if (!this.editingBrand.name?.trim() || !this.editingBrand.code?.trim()) {
      this.editError = 'Name and Code are required.';
      return;
    }
    this.isEditSubmitting = true;
    this.editError = '';
    const { _id, name, code, description, logo, website, isActive } = this.editingBrand;
    this.brandService.updateBrand(_id!, { name, code, description, logo, website, isActive }).subscribe({
      next: () => {
        this.isEditSubmitting = false;
        this.closeEditModal();
        this.loadBrands();
        this.toastService.success('Brand updated successfully');
      },
      error: (err) => {
        this.isEditSubmitting = false;
        this.editError = err.error?.message || 'Failed to update brand';
      }
    });
  }

  deleteBrand(brand: Brand): void {
    if (confirm(`Are you sure you want to delete "${brand.name}"?`)) {
      this.brandService.deleteBrand(brand._id!).subscribe({
        next: () => {
          this.loadBrands();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete brand');
        }
      });
    }
  }

  exportPDF(): void {
    if (this.brands.length === 0) {
      alert('No brands to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Brand Name', dataKey: 'name', width: 50 },
      { header: 'Code', dataKey: 'code', width: 30 },
      { header: 'Slug', dataKey: 'slug', width: 40 },
      { header: 'Status', dataKey: 'isActive', width: 25 },
      { header: 'Created Date', dataKey: 'createdAt', width: 35 }
    ];

    this.exportService.exportToPDF(
      this.brands,
      columns,
      'brands-list',
      'Brands List'
    );
  }

  exportExcel(): void {
    if (this.brands.length === 0) {
      alert('No brands to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Brand Name', dataKey: 'name' },
      { header: 'Code', dataKey: 'code' },
      { header: 'Slug', dataKey: 'slug' },
      { header: 'Status', dataKey: 'isActive' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Created Date', dataKey: 'createdAt' }
    ];

    this.exportService.exportToExcel(
      this.brands,
      columns,
      'brands-list',
      'Brands'
    );
  }

  refresh(): void {
    this.currentPage = 1;
    this.searchTerm = '';
    this.selectedStatus = 'Status';
    this.loadBrands();
  }

  addBrand(): void {
    this.router.navigate(['/dashboard/brands/add']);
  }

  importBrand(): void {
    console.log('Import brands');
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive === false ? 'Inactive' : 'Active';
  }

  truncateText(text: string | undefined, wordLimit: number = 5): string {
    if (!text) return 'N/A';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }
}
