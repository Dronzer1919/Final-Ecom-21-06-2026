import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../services/subcategory.service';
import { ToastService } from '../../../services/toast.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';

@Component({
  selector: 'app-sub-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss']
})
export class SubCategoryComponent implements OnInit {
  searchTerm: string = '';
  selectedCategory: string = 'Category';
  selectedStatus: string = 'Status';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  isLoading: boolean = false;
  error: string = '';

  subCategories: Subcategory[] = [];

  private toastService = inject(ToastService);

  constructor(
    private subcategoryService: SubcategoryService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubcategories();
  }

  loadSubcategories(): void {
    this.isLoading = true;
    this.error = '';
    
    const isActiveFilter = this.selectedStatus === 'Active' ? true : 
                           this.selectedStatus === 'Inactive' ? false : undefined;

    this.subcategoryService.getAllSubcategories(
      this.currentPage, 
      this.rowsPerPage, 
      this.searchTerm || undefined,
      undefined,
      isActiveFilter
    ).subscribe({
      next: (response) => {
        this.subCategories = response.data.subcategories;
        this.totalPages = response.data.pagination.totalPages;
        this.totalItems = response.data.pagination.totalItems;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Error loading subcategories');
        this.error = err.error?.message || 'Failed to load subcategories';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get paginatedSubCategories(): Subcategory[] {
    return this.subCategories;
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
      this.loadSubcategories();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.loadSubcategories();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadSubcategories();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadSubcategories();
  }

  editSubCategory(subCategory: Subcategory): void {
    this.router.navigate(['/dashboard/sub-category/edit', subCategory._id]);
  }

  deleteSubCategory(subCategory: Subcategory): void {
    if (confirm(`Are you sure you want to delete "${subCategory.name}"?`)) {
      this.subcategoryService.deleteSubcategory(subCategory._id!).subscribe({
        next: () => {
          this.loadSubcategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete subcategory');
        }
      });
    }
  }

  exportPDF(): void {
    if (this.subCategories.length === 0) {
      alert('No sub-categories to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Sub-Category', dataKey: 'name', width: 50 },
      { header: 'Category', dataKey: 'category.name', width: 40 },
      { header: 'Code', dataKey: 'code', width: 30 },
      { header: 'Slug', dataKey: 'slug', width: 40 },
      { header: 'Status', dataKey: 'isActive', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.subCategories,
      columns,
      'subcategories-list',
      'Sub-Categories List'
    );
  }

  exportExcel(): void {
    if (this.subCategories.length === 0) {
      alert('No sub-categories to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Sub-Category', dataKey: 'name' },
      { header: 'Category', dataKey: 'category.name' },
      { header: 'Code', dataKey: 'code' },
      { header: 'Slug', dataKey: 'slug' },
      { header: 'Status', dataKey: 'isActive' },
      { header: 'Description', dataKey: 'description' }
    ];

    this.exportService.exportToExcel(
      this.subCategories,
      columns,
      'subcategories-list',
      'Sub-Categories'
    );
  }

  refresh(): void {
    this.currentPage = 1;
    this.searchTerm = '';
    this.selectedStatus = 'Status';
    this.selectedCategory = 'Category';
    this.loadSubcategories();
  }

  addSubCategory(): void {
    this.router.navigate(['/dashboard/sub-category/add']);
  }

  importSubCategory(): void {
    console.log('Import sub-categories');
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive === false ? 'Inactive' : 'Active';
  }

  getCategoryName(category: any): string {
    return category?.name || 'N/A';
  }

  truncateText(text: string | undefined, wordLimit: number = 5): string {
    if (!text) return 'N/A';
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }
}
