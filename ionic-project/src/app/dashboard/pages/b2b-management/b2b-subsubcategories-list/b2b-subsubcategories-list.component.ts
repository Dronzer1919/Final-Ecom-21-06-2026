import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoryService, Subcategory } from '../../../../services/subcategory.service';
import { CategoryService, Category } from '../../../../services/category.service';
import { ToastService } from '../../../../services/toast.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-b2b-subsubcategories-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './b2b-subsubcategories-list.component.html',
  styleUrls: ['./b2b-subsubcategories-list.component.scss']
})
export class B2BSubSubCategoriesListComponent implements OnInit {
  items: Subcategory[] = [];
  allSubcategories: Subcategory[] = [];   // parent sub-categories for filter dropdown
  allCategories: Category[] = [];

  isLoading = false;
  searchTerm = '';
  selectedParentSubcat = '';
  currentPage = 1;
  totalItems = 0;
  pageSize = 15;
  deleteConfirmId: string | null = null;

  // Multi-select
  selectedIds = new Set<string>();
  bulkDeleteConfirm = false;
  isBulkDeleting = false;

  constructor(
    private subcategoryService: SubcategoryService,
    private categoryService: CategoryService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadItems();
  }

  private loadFilters(): void {
    // Load categories for breadcrumb resolution
    this.categoryService.getAllCategories(1, 100).subscribe({
      next: r => { this.allCategories = r.data.categories; }
    });
    // Load all regular subcategories (no parentSubcategory) as filter options
    this.subcategoryService.getAllSubcategories(1, 100).subscribe({
      next: r => {
        this.allSubcategories = (r.data.subcategories ?? []).filter(
          (s: any) => !s.parentSubcategory
        );
      }
    });
  }

  loadItems(): void {
    this.isLoading = true;
    this.subcategoryService.getAllSubSubCategories(
      this.currentPage,
      this.pageSize,
      this.searchTerm || undefined,
      this.selectedParentSubcat || undefined
    ).subscribe({
      next: (res) => {
        const all: Subcategory[] = res.data.subcategories ?? [];
        this.items = this.selectedParentSubcat ? all : all.filter((s: any) => !!s.parentSubcategory);
        this.totalItems = this.items.length;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load sub-sub categories');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadItems(); }
  onParentFilter(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadItems(); }

  goToPage(page: number): void {
    this.currentPage = page;
    this.selectedIds.clear();
    this.loadItems();
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

  // ── Resolvers ────────────────────────────────────────────────────────────────

  getParentSubcatName(item: Subcategory): string {
    const p = (item as any).parentSubcategory;
    if (!p) return '—';
    if (typeof p === 'object') return p.name ?? '—';
    return this.allSubcategories.find(s => s._id === p)?.name ?? p;
  }

  getCategoryName(item: Subcategory): string {
    const cat = (item as any).category;
    if (!cat) return '—';
    if (typeof cat === 'object') return cat.name ?? '—';
    return this.allCategories.find(c => c._id === cat)?.name ?? cat;
  }

  editItem(id: string): void {
    this.router.navigate(['/dashboard/b2b-management/subsubcategories/edit', id]);
  }

  // ── Single delete ─────────────────────────────────────────────────────────────

  confirmDelete(id: string): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteItem(id: string): void {
    this.subcategoryService.deleteSubcategory(id).subscribe({
      next: () => {
        this.toast.success('Sub-sub category deleted');
        this.deleteConfirmId = null;
        this.selectedIds.delete(id);
        this.loadItems();
      },
      error: () => {
        this.toast.error('Failed to delete');
        this.deleteConfirmId = null;
      }
    });
  }

  // ── Multi-select ──────────────────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllSelected(): boolean {
    return this.items.length > 0 && this.items.every(i => this.selectedIds.has(i._id!));
  }

  get isIndeterminate(): boolean { return this.selectedIds.size > 0 && !this.isAllSelected; }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.items.forEach(i => { if (i._id) this.selectedIds.delete(i._id); });
    } else {
      this.items.forEach(i => { if (i._id) this.selectedIds.add(i._id); });
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
      if (failed === 0) this.toast.success(`${succeeded} sub-sub categor${succeeded === 1 ? 'y' : 'ies'} deleted`);
      else this.toast.error(`${succeeded} deleted, ${failed} failed`);
      this.loadItems();
    };

    ids.forEach(id => {
      this.subcategoryService.deleteSubcategory(id).subscribe({
        next: () => finish(),
        error: () => { failed++; finish(); }
      });
    });
  }
}
