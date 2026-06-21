import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2BManagementService, B2BProduct } from '../../../../services/b2b-management.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-b2b-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-products-list.component.html',
  styleUrls: ['./b2b-products-list.component.scss']
})
export class B2BProductsListComponent implements OnInit {
  products: B2BProduct[] = [];
  categories: Category[] = [];
  isLoading = false;
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  totalItems = 0;
  pageSize = 15;
  deleteConfirmId: string | null = null;
  viewMode: 'table' | 'grid' = 'table';

  // ── Multi-select ──────────────────────────────────────────────────────────
  selectedIds = new Set<string>();
  bulkDeleteConfirm = false;
  isBulkDeleting = false;

  constructor(
    private b2bService: B2BManagementService,
    private categoryService: CategoryService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAllCategories(1, 100, undefined, true).subscribe({
      next: r => { this.categories = r.data.categories; }
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.b2bService.getB2BProducts(
      this.currentPage, this.pageSize,
      this.searchTerm || undefined,
      this.selectedCategory || undefined
    ).subscribe({
      next: (res) => {
        this.products = res.data ?? [];
        this.totalItems = res.pagination?.total ?? res.data?.pagination?.totalItems ?? this.products.length;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load B2B products');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadProducts(); }
  onCategoryFilter(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadProducts(); }

  goToPage(page: number): void { this.currentPage = page; this.selectedIds.clear(); this.loadProducts(); }

  get totalPages(): number { return Math.ceil(this.totalItems / this.pageSize); }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getProductName(p: B2BProduct): string { return (p as any).productName ?? p.name ?? '—'; }

  getCategoryName(p: B2BProduct): string {
    if (typeof p.category === 'object' && p.category !== null) return (p.category as any).name;
    return this.categories.find(c => c._id === p.category)?.name ?? '—';
  }

  getVendorCount(p: B2BProduct): number { return (p as any).vendorCount ?? 0; }

  getUnitName(p: B2BProduct): string {
    if (typeof p.unit === 'object' && p.unit !== null) return (p.unit as any).shortName ?? (p.unit as any).name;
    return '';
  }

  getStockStatus(p: B2BProduct): 'ok' | 'low' | 'out' {
    if (p.quantity <= 0) return 'out';
    if (p.quantityAlert && p.quantity <= p.quantityAlert) return 'low';
    return 'ok';
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  confirmDelete(id: string): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteProduct(id: string): void {
    this.b2bService.deleteProduct(id).subscribe({
      next: () => {
        this.toast.success('Product deleted');
        this.deleteConfirmId = null;
        this.selectedIds.delete(id);
        this.loadProducts();
      },
      error: () => {
        this.toast.error('Failed to delete product');
        this.deleteConfirmId = null;
      }
    });
  }

  editProduct(id: string): void {
    this.router.navigate(['/dashboard/b2b-management/products/edit', id]);
  }

  addProduct(): void {
    this.router.navigate(['/dashboard/b2b-management/products/add']);
  }

  // ── Multi-select ──────────────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllSelected(): boolean {
    return this.products.length > 0 && this.products.every(p => this.selectedIds.has(p._id!));
  }

  get isIndeterminate(): boolean { return this.selectedIds.size > 0 && !this.isAllSelected; }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.products.forEach(p => { if (p._id) this.selectedIds.delete(p._id); });
    } else {
      this.products.forEach(p => { if (p._id) this.selectedIds.add(p._id); });
    }
  }

  toggleSelect(id: string): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
  }

  isSelected(id: string): boolean { return this.selectedIds.has(id); }
  clearSelection(): void { this.selectedIds.clear(); }

  confirmBulkDelete(): void { this.bulkDeleteConfirm = true; }
  cancelBulkDelete(): void { this.bulkDeleteConfirm = false; }

  deleteSelected(): void {
    this.isBulkDeleting = true;
    const ids = Array.from(this.selectedIds);
    let done = 0;
    let failed = 0;
    const total = ids.length;

    const finish = () => {
      done++;
      if (done < total) return;
      this.isBulkDeleting = false;
      this.bulkDeleteConfirm = false;
      this.selectedIds.clear();
      const succeeded = total - failed;
      if (failed === 0) this.toast.success(`${succeeded} product${succeeded === 1 ? '' : 's'} deleted`);
      else this.toast.error(`${succeeded} deleted, ${failed} failed`);
      this.loadProducts();
    };

    ids.forEach(id => {
      this.b2bService.deleteProduct(id).subscribe({ next: () => finish(), error: () => { failed++; finish(); } });
    });
  }
}
