import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';
import { WarehouseService, Warehouse } from '../../../services/warehouse.service';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './warehouses.component.html',
  styleUrls: ['./warehouses.component.scss']
})
export class WarehousesComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  isLoading = true;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private exportService: ExportService,
    private router: Router,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit() {
    this.loadWarehouses();
  }

  loadWarehouses() {
    this.isLoading = true;
    const isActive = this.selectedStatus === 'Active' ? true : this.selectedStatus === 'Inactive' ? false : undefined;
    this.warehouseService.getAllWarehouses(this.currentPage, this.rowsPerPage, this.searchTerm || undefined, isActive)
      .subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouses;
          this.totalItems = res.data.pagination.totalItems;
          this.totalPages = res.data.pagination.totalPages;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  warehouses: Warehouse[] = [];

  get filteredWarehouses(): Warehouse[] {
    return this.warehouses;
  }

  get paginatedWarehouses(): Warehouse[] {
    return this.warehouses;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadWarehouses();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadWarehouses();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadWarehouses();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadWarehouses();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadWarehouses();
    }
  }

  addWarehouse(): void {
    this.router.navigate(['/peoples/warehouses/add']);
  }

  selectedWarehouse: Warehouse | null = null;

  onView(warehouse: Warehouse): void {
    this.selectedWarehouse = warehouse;
  }

  closeDetailCard(): void {
    this.selectedWarehouse = null;
  }

  onEdit(warehouse: Warehouse): void {
    this.router.navigate(['/peoples/warehouses/edit', warehouse._id]);
  }

  onDelete(warehouse: Warehouse): void {
    if (confirm(`Are you sure you want to delete ${warehouse.name}?`)) {
      this.warehouseService.deleteWarehouse(warehouse._id!).subscribe({
        next: () => this.loadWarehouses(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  exportPDF(): void {
    if (this.filteredWarehouses.length === 0) {
      alert('No warehouses to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Warehouse Name', dataKey: 'name', width: 45 },
      { header: 'Code', dataKey: 'code', width: 30 },
      { header: 'Phone', dataKey: 'phone', width: 35 },
      { header: 'Email', dataKey: 'email', width: 40 },
      { header: 'Capacity', dataKey: 'capacity', width: 20 },
      { header: 'Created On', dataKey: 'createdAt', width: 30 },
      { header: 'Status', dataKey: 'isActive', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.filteredWarehouses,
      columns,
      'warehouses-list',
      'Warehouses List'
    );
  }

  exportExcel(): void {
    if (this.filteredWarehouses.length === 0) {
      alert('No warehouses to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Warehouse Name', dataKey: 'name' },
      { header: 'Code', dataKey: 'code' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Capacity', dataKey: 'capacity' },
      { header: 'Created On', dataKey: 'createdAt' },
      { header: 'Status', dataKey: 'isActive' }
    ];

    this.exportService.exportToExcel(
      this.filteredWarehouses,
      columns,
      'warehouses-list',
      'Warehouses'
    );
  }
}
