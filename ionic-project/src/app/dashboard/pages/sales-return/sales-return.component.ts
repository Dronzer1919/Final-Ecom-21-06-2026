import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface SalesReturn {
  date: string;
  reference: string;
  customer: string;
  warehouse: string;
  grandTotal: number;
  reason: string;
  status: 'Completed' | 'Pending' | 'Processing';
}

@Component({
  selector: 'app-sales-return',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss']
})
export class SalesReturnComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  isLoading = true;

  constructor(
    private exportService: ExportService,
    private router: Router
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  salesReturns: SalesReturn[] = [
    { date: '2024-01-15', reference: 'SR-0001', customer: 'John Smith', warehouse: 'Warehouse 1', grandTotal: 125.00, reason: 'Defective Product', status: 'Completed' },
    { date: '2024-01-14', reference: 'SR-0002', customer: 'Jane Doe', warehouse: 'Warehouse 2', grandTotal: 89.00, reason: 'Wrong Item Received', status: 'Pending' },
    { date: '2024-01-14', reference: 'SR-0003', customer: 'Sarah Lee', warehouse: 'Warehouse 1', grandTotal: 210.00, reason: 'Customer Changed Mind', status: 'Processing' },
    { date: '2024-01-13', reference: 'SR-0004', customer: 'Alex Brown', warehouse: 'Warehouse 3', grandTotal: 67.50, reason: 'Product Damaged', status: 'Completed' },
    { date: '2024-01-13', reference: 'SR-0005', customer: 'Emily Davis', warehouse: 'Warehouse 2', grandTotal: 145.00, reason: 'Quality Issues', status: 'Pending' },
    { date: '2024-01-12', reference: 'SR-0006', customer: 'Tom Harris', warehouse: 'Warehouse 1', grandTotal: 320.00, reason: 'Wrong Size/Color', status: 'Completed' },
    { date: '2024-01-12', reference: 'SR-0007', customer: 'Laura Wilson', warehouse: 'Warehouse 2', grandTotal: 82.50, reason: 'Better Price Elsewhere', status: 'Processing' },
    { date: '2024-01-11', reference: 'SR-0008', customer: 'Robert White', warehouse: 'Warehouse 1', grandTotal: 198.00, reason: 'Defective Product', status: 'Completed' },
    { date: '2024-01-11', reference: 'SR-0009', customer: 'Michael Green', warehouse: 'Warehouse 3', grandTotal: 45.00, reason: 'Customer Changed Mind', status: 'Pending' },
    { date: '2024-01-10', reference: 'SR-0010', customer: 'Sarah Johnson', warehouse: 'Warehouse 1', grandTotal: 275.00, reason: 'Product Damaged', status: 'Completed' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredSalesReturns.length / this.rowsPerPage);
  }

  get filteredSalesReturns(): SalesReturn[] {
    return this.salesReturns.filter(salesReturn => {
      const matchesSearch = !this.searchTerm || 
        salesReturn.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        salesReturn.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        salesReturn.warehouse.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        salesReturn.reason.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || salesReturn.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedSalesReturns(): SalesReturn[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredSalesReturns.slice(start, end);
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
      { header: 'Customer', dataKey: 'customer', width: 40 },
      { header: 'Warehouse', dataKey: 'warehouse', width: 35 },
      { header: 'Grand Total', dataKey: 'grandTotal', width: 30 },
      { header: 'Reason', dataKey: 'reason', width: 50 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];
    
    this.exportService.exportToPDF(this.filteredSalesReturns, columns, 'Sales_Returns_Report', 'Sales Returns Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Grand Total', dataKey: 'grandTotal' },
      { header: 'Reason', dataKey: 'reason' },
      { header: 'Status', dataKey: 'status' }
    ];
    
    this.exportService.exportToExcel(this.filteredSalesReturns, columns, 'Sales_Returns');
  }

  createSalesReturn(): void {
    this.router.navigate(['/dashboard/sales-return/create']);
  }

  viewSalesReturn(reference: string): void {
    this.router.navigate(['/dashboard/sales-return', reference]);
  }
}
