import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../../components/shimmer/shimmer-table/shimmer-table.component';

interface StockTransfer {
  date: string;
  reference: string;
  product: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  shippingCharge: number;
  status: 'Completed' | 'Pending' | 'In Transit' | 'Received';
  transferredBy: string;
}

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './stock-transfer.component.html',
  styleUrls: ['./stock-transfer.component.scss']
})
export class StockTransferComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  isLoading: boolean = true;

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    setTimeout(() => { this.isLoading = false; }, 1200);
  }

  transfers: StockTransfer[] = [
    { date: '2024-01-15', reference: 'TRF-0001', product: 'MacBook Pro 14"', fromWarehouse: 'Warehouse 1', toWarehouse: 'Warehouse 2', quantity: 5, shippingCharge: 500, status: 'Completed', transferredBy: 'Admin' },
    { date: '2024-01-15', reference: 'TRF-0002', product: 'iPhone 15 Pro', fromWarehouse: 'Warehouse 2', toWarehouse: 'Warehouse 1', quantity: 10, shippingCharge: 0, status: 'In Transit', transferredBy: 'Manager' },
    { date: '2024-01-14', reference: 'TRF-0003', product: 'Samsung Galaxy S24', fromWarehouse: 'Warehouse 1', toWarehouse: 'Warehouse 3', quantity: 15, shippingCharge: 300, status: 'Pending', transferredBy: 'Admin' },
    { date: '2024-01-14', reference: 'TRF-0004', product: 'Dell XPS 15', fromWarehouse: 'Warehouse 3', toWarehouse: 'Warehouse 1', quantity: 8, shippingCharge: 400, status: 'Received', transferredBy: 'Supervisor' },
    { date: '2024-01-13', reference: 'TRF-0005', product: 'iPad Air', fromWarehouse: 'Warehouse 2', toWarehouse: 'Warehouse 3', quantity: 12, shippingCharge: 200, status: 'Completed', transferredBy: 'Admin' },
    { date: '2024-01-13', reference: 'TRF-0006', product: 'Sony WH-1000XM5', fromWarehouse: 'Warehouse 1', toWarehouse: 'Warehouse 2', quantity: 20, shippingCharge: 250, status: 'In Transit', transferredBy: 'Staff' },
    { date: '2024-01-12', reference: 'TRF-0007', product: 'Logitech MX Master 3', fromWarehouse: 'Warehouse 3', toWarehouse: 'Warehouse 1', quantity: 30, shippingCharge: 150, status: 'Completed', transferredBy: 'Admin' },
    { date: '2024-01-12', reference: 'TRF-0008', product: 'HP LaserJet Pro', fromWarehouse: 'Warehouse 2', toWarehouse: 'Warehouse 1', quantity: 5, shippingCharge: 600, status: 'Pending', transferredBy: 'Manager' },
    { date: '2024-01-11', reference: 'TRF-0009', product: 'Canon EOS R6', fromWarehouse: 'Warehouse 1', toWarehouse: 'Warehouse 3', quantity: 3, shippingCharge: 800, status: 'Received', transferredBy: 'Admin' },
    { date: '2024-01-11', reference: 'TRF-0010', product: 'LG UltraWide Monitor', fromWarehouse: 'Warehouse 3', toWarehouse: 'Warehouse 2', quantity: 7, shippingCharge: 450, status: 'Completed', transferredBy: 'Staff' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredTransfers.length / this.rowsPerPage);
  }

  get filteredTransfers(): StockTransfer[] {
    return this.transfers.filter(transfer => {
      const matchesSearch = !this.searchTerm || 
        transfer.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transfer.product.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transfer.fromWarehouse.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        transfer.toWarehouse.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || transfer.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedTransfers(): StockTransfer[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredTransfers.slice(start, end);
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
      { header: 'From Warehouse', dataKey: 'fromWarehouse', width: 35 },
      { header: 'To Warehouse', dataKey: 'toWarehouse', width: 35 },
      { header: 'Quantity', dataKey: 'quantity', width: 20 },
      { header: 'Shipping Charge', dataKey: 'shippingCharge', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Transferred By', dataKey: 'transferredBy', width: 30 }
    ];
    
    this.exportService.exportToPDF(this.filteredTransfers, columns, 'Stock_Transfer_Report', 'Stock Transfer Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Product', dataKey: 'product' },
      { header: 'From Warehouse', dataKey: 'fromWarehouse' },
      { header: 'To Warehouse', dataKey: 'toWarehouse' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Shipping Charge', dataKey: 'shippingCharge' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Transferred By', dataKey: 'transferredBy' }
    ];
    
    this.exportService.exportToExcel(this.filteredTransfers, columns, 'Stock_Transfers');
  }
}
