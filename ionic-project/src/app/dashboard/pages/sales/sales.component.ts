import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface Sale {
  date: string;
  reference: string;
  customer: string;
  warehouse: string;
  status: 'Completed' | 'Pending' | 'Ordered';
  grandTotal: number;
  paid: number;
  due: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPaymentStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  isLoading = true;

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  sales: Sale[] = [
    { date: '2024-01-15', reference: 'SL-0001', customer: 'Walk-in Customer', warehouse: 'Warehouse 1', status: 'Completed', grandTotal: 550.00, paid: 550.00, due: 0.00, paymentStatus: 'Paid' },
    { date: '2024-01-15', reference: 'SL-0002', customer: 'John Smith', warehouse: 'Warehouse 1', status: 'Completed', grandTotal: 1250.00, paid: 500.00, due: 750.00, paymentStatus: 'Partial' },
    { date: '2024-01-14', reference: 'SL-0003', customer: 'Jane Doe', warehouse: 'Warehouse 2', status: 'Pending', grandTotal: 890.00, paid: 0.00, due: 890.00, paymentStatus: 'Unpaid' },
    { date: '2024-01-14', reference: 'SL-0004', customer: 'Sarah Lee', warehouse: 'Warehouse 1', status: 'Completed', grandTotal: 2100.00, paid: 2100.00, due: 0.00, paymentStatus: 'Paid' },
    { date: '2024-01-13', reference: 'SL-0005', customer: 'Alex Brown', warehouse: 'Warehouse 3', status: 'Completed', grandTotal: 675.00, paid: 675.00, due: 0.00, paymentStatus: 'Paid' },
    { date: '2024-01-13', reference: 'SL-0006', customer: 'Emily Davis', warehouse: 'Warehouse 2', status: 'Ordered', grandTotal: 1450.00, paid: 0.00, due: 1450.00, paymentStatus: 'Unpaid' },
    { date: '2024-01-12', reference: 'SL-0007', customer: 'Tom Harris', warehouse: 'Warehouse 1', status: 'Completed', grandTotal: 3200.00, paid: 1500.00, due: 1700.00, paymentStatus: 'Partial' },
    { date: '2024-01-12', reference: 'SL-0008', customer: 'Laura Wilson', warehouse: 'Warehouse 2', status: 'Completed', grandTotal: 825.00, paid: 825.00, due: 0.00, paymentStatus: 'Paid' },
    { date: '2024-01-11', reference: 'SL-0009', customer: 'Robert White', warehouse: 'Warehouse 1', status: 'Pending', grandTotal: 1980.00, paid: 1000.00, due: 980.00, paymentStatus: 'Partial' },
    { date: '2024-01-11', reference: 'SL-0010', customer: 'Michael Green', warehouse: 'Warehouse 3', status: 'Completed', grandTotal: 450.00, paid: 450.00, due: 0.00, paymentStatus: 'Paid' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredSales.length / this.rowsPerPage);
  }

  get filteredSales(): Sale[] {
    return this.sales.filter(sale => {
      const matchesSearch = !this.searchTerm || 
        sale.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sale.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        sale.warehouse.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || sale.status === this.selectedStatus;
      const matchesPaymentStatus = !this.selectedPaymentStatus || sale.paymentStatus === this.selectedPaymentStatus;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
  }

  get paginatedSales(): Sale[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredSales.slice(start, end);
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
      { header: 'Status', dataKey: 'status', width: 25 },
      { header: 'Grand Total', dataKey: 'grandTotal', width: 30 },
      { header: 'Paid', dataKey: 'paid', width: 25 },
      { header: 'Due', dataKey: 'due', width: 25 },
      { header: 'Payment Status', dataKey: 'paymentStatus', width: 35 }
    ];
    
    this.exportService.exportToPDF(this.filteredSales, columns, 'Sales_Report', 'Sales Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Grand Total', dataKey: 'grandTotal' },
      { header: 'Paid', dataKey: 'paid' },
      { header: 'Due', dataKey: 'due' },
      { header: 'Payment Status', dataKey: 'paymentStatus' }
    ];
    
    this.exportService.exportToExcel(this.filteredSales, columns, 'Sales');
  }
}
