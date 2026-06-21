import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../../components/shimmer/shimmer-table/shimmer-table.component';

interface StockAdjustment {
  date: string;
  reference: string;
  product: string;
  warehouse: string;
  adjustmentType: 'Addition' | 'Subtraction';
  quantity: number;
  reason: string;
  status: 'Completed' | 'Pending' | 'Approved';
  adjustedBy: string;
}

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.scss']
})
export class StockAdjustmentComponent implements OnInit {
  searchTerm: string = '';
  selectedType: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  isLoading: boolean = true;

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    setTimeout(() => { this.isLoading = false; }, 1200);
  }

  adjustments: StockAdjustment[] = [
    { date: '2024-01-15', reference: 'ADJ-0001', product: 'MacBook Pro 14"', warehouse: 'Warehouse 1', adjustmentType: 'Addition', quantity: 10, reason: 'New Stock Received', status: 'Completed', adjustedBy: 'Admin' },
    { date: '2024-01-15', reference: 'ADJ-0002', product: 'iPhone 15 Pro', warehouse: 'Warehouse 1', adjustmentType: 'Subtraction', quantity: 5, reason: 'Damaged Units', status: 'Completed', adjustedBy: 'Manager' },
    { date: '2024-01-14', reference: 'ADJ-0003', product: 'Samsung Galaxy S24', warehouse: 'Warehouse 2', adjustmentType: 'Addition', quantity: 20, reason: 'Stock Replenishment', status: 'Pending', adjustedBy: 'Admin' },
    { date: '2024-01-14', reference: 'ADJ-0004', product: 'Dell XPS 15', warehouse: 'Warehouse 2', adjustmentType: 'Subtraction', quantity: 3, reason: 'Quality Control Rejection', status: 'Approved', adjustedBy: 'Supervisor' },
    { date: '2024-01-13', reference: 'ADJ-0005', product: 'iPad Air', warehouse: 'Warehouse 1', adjustmentType: 'Addition', quantity: 15, reason: 'Supplier Return', status: 'Completed', adjustedBy: 'Admin' },
    { date: '2024-01-13', reference: 'ADJ-0006', product: 'Sony WH-1000XM5', warehouse: 'Warehouse 3', adjustmentType: 'Subtraction', quantity: 2, reason: 'Customer Display', status: 'Pending', adjustedBy: 'Staff' },
    { date: '2024-01-12', reference: 'ADJ-0007', product: 'Logitech MX Master 3', warehouse: 'Warehouse 1', adjustmentType: 'Addition', quantity: 25, reason: 'New Purchase Order', status: 'Completed', adjustedBy: 'Admin' },
    { date: '2024-01-12', reference: 'ADJ-0008', product: 'HP LaserJet Pro', warehouse: 'Warehouse 2', adjustmentType: 'Subtraction', quantity: 1, reason: 'Missing Item', status: 'Approved', adjustedBy: 'Manager' },
    { date: '2024-01-11', reference: 'ADJ-0009', product: 'Canon EOS R6', warehouse: 'Warehouse 3', adjustmentType: 'Addition', quantity: 8, reason: 'Stock Transfer In', status: 'Completed', adjustedBy: 'Admin' },
    { date: '2024-01-11', reference: 'ADJ-0010', product: 'LG UltraWide Monitor', warehouse: 'Warehouse 1', adjustmentType: 'Subtraction', quantity: 4, reason: 'Warranty Replacement', status: 'Pending', adjustedBy: 'Staff' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredAdjustments.length / this.rowsPerPage);
  }

  get filteredAdjustments(): StockAdjustment[] {
    return this.adjustments.filter(adj => {
      const matchesSearch = !this.searchTerm || 
        adj.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        adj.product.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        adj.warehouse.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.selectedType || adj.adjustmentType === this.selectedType;
      const matchesStatus = !this.selectedStatus || adj.status === this.selectedStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }

  get paginatedAdjustments(): StockAdjustment[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredAdjustments.slice(start, end);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportPDF(): void {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date', width: 25 },
      { header: 'Reference', dataKey: 'reference', width: 30 },
      { header: 'Product', dataKey: 'product', width: 45 },
      { header: 'Warehouse', dataKey: 'warehouse', width: 35 },
      { header: 'Type', dataKey: 'adjustmentType', width: 25 },
      { header: 'Quantity', dataKey: 'quantity', width: 20 },
      { header: 'Reason', dataKey: 'reason', width: 45 },
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Adjusted By', dataKey: 'adjustedBy', width: 30 }
    ];
    
    this.exportService.exportToPDF(this.filteredAdjustments, columns, 'Stock_Adjustment_Report', 'Stock Adjustment Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Product', dataKey: 'product' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Adjustment Type', dataKey: 'adjustmentType' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Reason', dataKey: 'reason' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Adjusted By', dataKey: 'adjustedBy' }
    ];
    
    this.exportService.exportToExcel(this.filteredAdjustments, columns, 'Stock_Adjustments');
  }
}
