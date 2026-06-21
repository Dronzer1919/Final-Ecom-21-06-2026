import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UnitService, Unit } from '../../../services/unit.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

@Component({
  selector: 'app-units',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {
  searchQuery: string = '';
  statusFilter: string = 'Status';
  currentPage: number = 1;
  rowsPerPage: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  isLoading: boolean = false;
  error: string = '';

  units: Unit[] = [];

  // Edit modal state
  showEditModal = false;
  editingUnit: Unit = { name: '', shortName: '' };
  isEditSubmitting = false;
  editError = '';

  private toastService = inject(ToastService);

  constructor(
    private unitService: UnitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.isLoading = true;
    this.error = '';
    
    const isActiveFilter = this.statusFilter === 'Active' ? true : 
                           this.statusFilter === 'Inactive' ? false : undefined;

    console.log('Loading units...', { page: this.currentPage, limit: this.rowsPerPage, search: this.searchQuery, isActive: isActiveFilter });

    this.unitService.getAllUnits(
      this.currentPage, 
      this.rowsPerPage, 
      this.searchQuery || undefined,
      isActiveFilter
    ).subscribe({
      next: (response) => {
        console.log('Units loaded successfully:', response);
        this.units = response.data.units;
        this.totalPages = response.data.pagination.totalPages;
        this.totalItems = response.data.pagination.totalItems;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastService.error('Error loading units');
        this.error = err.error?.message || 'Failed to load units';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Units request completed');
      }
    });
  }

  get paginatedUnits(): Unit[] {
    return this.units;
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
      this.loadUnits();
    }
  }

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
    this.loadUnits();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
    this.currentPage = 1;
    this.loadUnits();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadUnits();
  }

  editUnit(unit: Unit): void {
    this.editingUnit = { ...unit };
    this.editError = '';
    this.isEditSubmitting = false;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editError = '';
    this.isEditSubmitting = false;
  }

  saveEditUnit(): void {
    if (!this.editingUnit.name?.trim() || !this.editingUnit.shortName?.trim()) {
      this.editError = 'Name and Short Name are required.';
      return;
    }
    this.isEditSubmitting = true;
    this.editError = '';
    const { _id, name, shortName, description, isActive } = this.editingUnit;
    this.unitService.updateUnit(_id!, { name, shortName, description, isActive }).subscribe({
      next: () => {
        this.isEditSubmitting = false;
        this.closeEditModal();
        this.loadUnits();
        this.toastService.success('Unit updated successfully');
      },
      error: (err) => {
        this.isEditSubmitting = false;
        this.editError = err.error?.message || 'Failed to update unit';
      }
    });
  }

  deleteUnit(unit: Unit): void {
    if (confirm(`Are you sure you want to delete "${unit.name}"?`)) {
      this.unitService.deleteUnit(unit._id!).subscribe({
        next: () => {
          this.loadUnits();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to delete unit');
        }
      });
    }
  }

  exportToPDF(): void {
    console.log('Export to PDF');
    // TODO: Implement PDF export
  }

  exportToExcel(): void {
    console.log('Export to Excel');
    // TODO: Implement Excel export
  }

  refresh(): void {
    this.currentPage = 1;
    this.searchQuery = '';
    this.statusFilter = 'Status';
    this.loadUnits();
  }
}
