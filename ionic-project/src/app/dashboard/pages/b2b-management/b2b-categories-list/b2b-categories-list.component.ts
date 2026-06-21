import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2BManagementService } from '../../../../services/b2b-management.service';
import { ToastService } from '../../../../services/toast.service';
import { Category } from '../../../../services/category.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-b2b-categories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './b2b-categories-list.component.html',
  styleUrls: ['./b2b-categories-list.component.scss']
})
export class B2BCategoriesListComponent implements OnInit {
  categories: Category[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  totalItems = 0;
  pageSize = 15;
  deleteConfirmId: string | null = null;

  // ── Multi-select ────────────────────────────────────────────────────────────
  selectedIds = new Set<string>();
  bulkDeleteConfirm = false;
  isBulkDeleting = false;

  constructor(
    private b2bService: B2BManagementService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.b2bService.getCategories(this.currentPage, this.pageSize, this.searchTerm || undefined).subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this.totalItems = res.data.pagination.totalItems;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load categories');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.selectedIds.clear();
    this.loadCategories();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.selectedIds.clear();
    this.loadCategories();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = Math.min(this.totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // ── Single delete ───────────────────────────────────────────────────────────

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteCategory(id: string): void {
    this.b2bService.deleteCategory(id).subscribe({
      next: () => {
        this.toast.success('Category deleted');
        this.deleteConfirmId = null;
        this.selectedIds.delete(id);
        this.loadCategories();
      },
      error: () => {
        this.toast.error('Failed to delete category');
        this.deleteConfirmId = null;
      }
    });
  }

  editCategory(id: string): void {
    this.router.navigate(['/dashboard/b2b-management/categories/edit', id]);
  }

  // ── Multi-select ────────────────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllSelected(): boolean {
    return this.categories.length > 0 && this.categories.every(c => this.selectedIds.has(c._id!));
  }

  get isIndeterminate(): boolean {
    return this.selectedIds.size > 0 && !this.isAllSelected;
  }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.categories.forEach(c => { if (c._id) this.selectedIds.delete(c._id); });
    } else {
      this.categories.forEach(c => { if (c._id) this.selectedIds.add(c._id); });
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
      if (failed === 0) this.toast.success(`${succeeded} categor${succeeded === 1 ? 'y' : 'ies'} deleted`);
      else this.toast.error(`${succeeded} deleted, ${failed} failed`);
      this.loadCategories();
    };

    ids.forEach(id => {
      this.b2bService.deleteCategory(id).subscribe({ next: () => finish(), error: () => { failed++; finish(); } });
    });
  }
}
