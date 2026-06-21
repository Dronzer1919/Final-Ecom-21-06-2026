import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2BManagementService } from '../../../../services/b2b-management.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import { Subcategory } from '../../../../services/subcategory.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-b2b-subcategories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './b2b-subcategories-list.component.html',
  styleUrls: ['./b2b-subcategories-list.component.scss']
})
export class B2BSubcategoriesListComponent implements OnInit {
  subcategories: Subcategory[] = [];
  categories: Category[] = [];
  isLoading = false;
  searchTerm = '';
  selectedCategory = '';
  currentPage = 1;
  totalItems = 0;
  pageSize = 15;
  deleteConfirmId: string | null = null;

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
    this.loadSubcategories();
  }

  loadSubcategories(): void {
    this.isLoading = true;
    this.b2bService.getSubcategories(
      this.currentPage, this.pageSize,
      this.searchTerm || undefined,
      this.selectedCategory || undefined
    ).subscribe({
      next: (res) => {
        this.subcategories = res.data.subcategories;
        this.totalItems = res.data.pagination.totalItems;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load subcategories');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadSubcategories(); }
  onCategoryFilter(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadSubcategories(); }

  goToPage(page: number): void {
    this.currentPage = page;
    this.selectedIds.clear();
    this.loadSubcategories();
  }

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

  getCategoryName(sub: Subcategory): string {
    if (typeof sub.category === 'object' && sub.category !== null) return (sub.category as any).name ?? '—';
    return this.categories.find(c => c._id === sub.category)?.name ?? '—';
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  confirmDelete(id: string): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteSubcategory(id: string): void {
    this.b2bService.deleteSubcategory(id).subscribe({
      next: () => {
        this.toast.success('Subcategory deleted');
        this.deleteConfirmId = null;
        this.selectedIds.delete(id);
        this.loadSubcategories();
      },
      error: () => {
        this.toast.error('Failed to delete subcategory');
        this.deleteConfirmId = null;
      }
    });
  }

  editSubcategory(id: string): void {
    this.router.navigate(['/dashboard/b2b-management/subcategories/edit', id]);
  }

  // ── Multi-select ──────────────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllSelected(): boolean {
    return this.subcategories.length > 0 && this.subcategories.every(s => this.selectedIds.has(s._id!));
  }

  get isIndeterminate(): boolean { return this.selectedIds.size > 0 && !this.isAllSelected; }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.subcategories.forEach(s => { if (s._id) this.selectedIds.delete(s._id); });
    } else {
      this.subcategories.forEach(s => { if (s._id) this.selectedIds.add(s._id); });
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
      if (failed === 0) this.toast.success(`${succeeded} subcategor${succeeded === 1 ? 'y' : 'ies'} deleted`);
      else this.toast.error(`${succeeded} deleted, ${failed} failed`);
      this.loadSubcategories();
    };

    ids.forEach(id => {
      this.b2bService.deleteSubcategory(id).subscribe({ next: () => finish(), error: () => { failed++; finish(); } });
    });
  }
}
