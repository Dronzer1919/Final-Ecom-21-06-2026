import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { B2BManagementService, B2BVendor } from '../../../../services/b2b-management.service';
import { ToastService } from '../../../../services/toast.service';

@Component({
  selector: 'app-b2b-vendors-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './b2b-vendors-list.component.html',
  styleUrls: ['./b2b-vendors-list.component.scss']
})
export class B2BVendorsListComponent implements OnInit {
  vendors: B2BVendor[] = [];
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  totalItems = 0;
  pageSize = 15;
  deleteConfirmId: string | null = null;
  expandedId: string | null = null;

  // ── Multi-select ──────────────────────────────────────────────────────────
  selectedIds = new Set<string>();
  bulkDeleteConfirm = false;
  isBulkDeleting = false;

  constructor(
    private b2bService: B2BManagementService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadVendors(); }

  loadVendors(): void {
    this.isLoading = true;
    this.b2bService.getVendors(this.currentPage, this.pageSize, this.searchTerm || undefined).subscribe({
      next: (res) => {
        this.vendors = res.data?.vendors ?? [];
        this.totalItems = res.data?.pagination?.totalItems ?? 0;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load vendors');
        this.isLoading = false;
      }
    });
  }

  onSearch(): void { this.currentPage = 1; this.selectedIds.clear(); this.loadVendors(); }

  goToPage(page: number): void { this.currentPage = page; this.selectedIds.clear(); this.loadVendors(); }

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

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getRatingStars(rating: number = 0): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) stars.push(i <= Math.round(rating) ? 'filled' : 'empty');
    return stars;
  }

  toggleExpand(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  // ── Single delete ─────────────────────────────────────────────────────────

  confirmDelete(id: string): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  deleteVendor(id: string): void {
    this.b2bService.deleteVendor(id).subscribe({
      next: () => {
        this.toast.success('Vendor deleted');
        this.deleteConfirmId = null;
        this.selectedIds.delete(id);
        this.loadVendors();
      },
      error: () => {
        this.toast.error('Failed to delete vendor');
        this.deleteConfirmId = null;
      }
    });
  }

  editVendor(id: string): void { this.router.navigate(['/dashboard/b2b-management/vendors/edit', id]); }
  addVendor(): void { this.router.navigate(['/dashboard/b2b-management/vendors/add']); }

  // ── Multi-select ──────────────────────────────────────────────────────────

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllSelected(): boolean {
    return this.vendors.length > 0 && this.vendors.every(v => this.selectedIds.has(v._id!));
  }

  get isIndeterminate(): boolean { return this.selectedIds.size > 0 && !this.isAllSelected; }

  toggleSelectAll(): void {
    if (this.isAllSelected) {
      this.vendors.forEach(v => { if (v._id) this.selectedIds.delete(v._id); });
    } else {
      this.vendors.forEach(v => { if (v._id) this.selectedIds.add(v._id); });
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
      if (failed === 0) this.toast.success(`${succeeded} vendor${succeeded === 1 ? '' : 's'} deleted`);
      else this.toast.error(`${succeeded} deleted, ${failed} failed`);
      this.loadVendors();
    };

    ids.forEach(id => {
      this.b2bService.deleteVendor(id).subscribe({ next: () => finish(), error: () => { failed++; finish(); } });
    });
  }
}
