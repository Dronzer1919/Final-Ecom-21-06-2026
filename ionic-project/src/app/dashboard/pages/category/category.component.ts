import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../../services/category.service';
import { ToastService } from '../../../services/toast.service';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../components/shimmer/shimmer-table/shimmer-table.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = 'Status';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  isLoading: boolean = false;
  error: string = '';

  categories: Category[] = [];

  private toastService = inject(ToastService);

  constructor(
    private categoryService: CategoryService,
    private exportService: ExportService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = '';
    
    const isActiveFilter = this.selectedStatus === 'Active' ? true : 
                           this.selectedStatus === 'Inactive' ? false : undefined;

    console.log('Loading categories...', { page: this.currentPage, limit: this.rowsPerPage, search: this.searchTerm, isActive: isActiveFilter });

    this.categoryService.getAllCategories(
      this.currentPage, 
      this.rowsPerPage, 
      this.searchTerm || undefined,
      isActiveFilter
    ).subscribe({
      next: (response) => {
        console.log('Categories loaded successfully:', response);
        this.categories = response.data.categories;
        this.totalPages = response.data.pagination.totalPages;
        this.totalItems = response.data.pagination.totalItems;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Error loading categories');
        this.error = err.error?.message || 'Failed to load categories';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Categories request completed');
      }
    });
  }

  get paginatedCategories(): Category[] {
    return this.categories;
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
      this.loadCategories();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.loadCategories();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 1;
    this.loadCategories();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  editCategory(category: Category): void {
    this.router.navigate(['/dashboard/category/edit', category._id]);
  }

  addSubCategory(category: Category): void {
    this.router.navigate(['/dashboard/sub-category/add'], { queryParams: { categoryId: category._id } });
  }

  deleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category._id!).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete category');
        }
      });
    }
  }

  exportPDF(): void {
    if (this.categories.length === 0) {
      alert('No categories to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Category', dataKey: 'name', width: 50 },
      { header: 'Code', dataKey: 'code', width: 30 },
      { header: 'Slug', dataKey: 'slug', width: 40 },
      { header: 'Status', dataKey: 'isActive', width: 25 },
      { header: 'Created Date', dataKey: 'createdAt', width: 35 }
    ];

    this.exportService.exportToPDF(
      this.categories,
      columns,
      'categories-list',
      'Categories List'
    );
  }

  exportExcel(): void {
    if (this.categories.length === 0) {
      alert('No categories to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Category', dataKey: 'name' },
      { header: 'Code', dataKey: 'code' },
      { header: 'Slug', dataKey: 'slug' },
      { header: 'Status', dataKey: 'isActive' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Created Date', dataKey: 'createdAt' }
    ];

    this.exportService.exportToExcel(
      this.categories,
      columns,
      'categories-list',
      'Categories'
    );
  }

  refresh(): void {
    this.currentPage = 1;
    this.searchTerm = '';
    this.selectedStatus = 'Status';
    this.loadCategories();
  }

  addCategory(): void {
    this.router.navigate(['/dashboard/category/add']);
  }

  importCategory(): void {
    console.log('Import Category clicked');
    // TODO: Implement import functionality
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

  getCategoryImage(category: Category): string {
    return category.image || 'https://via.placeholder.com/50x50/e0e0e0/666666?text=No+Image';
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/50x50/e0e0e0/666666?text=No+Image';
  }
}
