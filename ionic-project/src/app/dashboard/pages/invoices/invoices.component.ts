import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ShimmerComponent } from '../../../components/shimmer';

interface Invoice {
  invoiceNo: string;
  date: string;
  reference: string;
  customer: string;
  customerType: 'individual' | 'business';
  companyName?: string;
  taxId?: string;
  warehouse: string;
  amount: number;
  paid: number;
  due: number;
  paymentMethod: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
}

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, FormsModule, ShimmerComponent],
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedCustomerType: '' | 'individual' | 'business' = '';
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

  invoices: Invoice[] = [
    { invoiceNo: 'INV-0001', date: '2024-01-15', reference: 'SL-0001', customer: 'Walk-in Customer', customerType: 'individual', warehouse: 'Warehouse 1', amount: 550.00, paid: 550.00, due: 0.00, paymentMethod: 'Cash', status: 'Paid' },
    { invoiceNo: 'INV-0002', date: '2024-01-15', reference: 'SL-0002', customer: 'John Smith', customerType: 'individual', warehouse: 'Warehouse 1', amount: 1250.00, paid: 500.00, due: 750.00, paymentMethod: 'Card', status: 'Partial' },
    { invoiceNo: 'INV-0003', date: '2024-01-14', reference: 'SL-0003', customer: 'Jane Doe', customerType: 'business', companyName: 'Northstar Traders Pvt Ltd', taxId: 'GSTIN-27AABCU9603R1ZX', warehouse: 'Warehouse 2', amount: 890.00, paid: 0.00, due: 890.00, paymentMethod: 'Bank Transfer', status: 'Unpaid' },
    { invoiceNo: 'INV-0004', date: '2024-01-14', reference: 'SL-0004', customer: 'Sarah Lee', customerType: 'individual', warehouse: 'Warehouse 1', amount: 2100.00, paid: 2100.00, due: 0.00, paymentMethod: 'Cash', status: 'Paid' },
    { invoiceNo: 'INV-0005', date: '2024-01-13', reference: 'SL-0005', customer: 'Alex Brown', customerType: 'individual', warehouse: 'Warehouse 3', amount: 675.00, paid: 675.00, due: 0.00, paymentMethod: 'Card', status: 'Paid' },
    { invoiceNo: 'INV-0006', date: '2024-01-13', reference: 'SL-0006', customer: 'Emily Davis', customerType: 'business', companyName: 'Brightmart Retail LLP', taxId: 'GSTIN-07AAEPM0112P1Z9', warehouse: 'Warehouse 2', amount: 1450.00, paid: 0.00, due: 1450.00, paymentMethod: 'Cheque', status: 'Unpaid' },
    { invoiceNo: 'INV-0007', date: '2024-01-12', reference: 'SL-0007', customer: 'Tom Harris', customerType: 'business', companyName: 'UrbanGrid Supplies', taxId: 'GSTIN-29AAACP3387H1ZJ', warehouse: 'Warehouse 1', amount: 3200.00, paid: 1500.00, due: 1700.00, paymentMethod: 'Bank Transfer', status: 'Partial' },
    { invoiceNo: 'INV-0008', date: '2024-01-12', reference: 'SL-0008', customer: 'Laura Wilson', customerType: 'individual', warehouse: 'Warehouse 2', amount: 825.00, paid: 825.00, due: 0.00, paymentMethod: 'Cash', status: 'Paid' },
    { invoiceNo: 'INV-0009', date: '2024-01-11', reference: 'SL-0009', customer: 'Robert White', customerType: 'business', companyName: 'PrimeLine Distributors', taxId: 'GSTIN-24AAHCP6678G1ZX', warehouse: 'Warehouse 1', amount: 1980.00, paid: 1000.00, due: 980.00, paymentMethod: 'Card', status: 'Partial' },
    { invoiceNo: 'INV-0010', date: '2024-01-11', reference: 'SL-0010', customer: 'Michael Green', customerType: 'individual', warehouse: 'Warehouse 3', amount: 450.00, paid: 450.00, due: 0.00, paymentMethod: 'Cash', status: 'Paid' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredInvoices.length / this.rowsPerPage);
  }

  get filteredInvoices(): Invoice[] {
    return this.invoices.filter(invoice => {
      const matchesSearch = !this.searchTerm || 
        invoice.invoiceNo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.reference.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        invoice.customerType.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (invoice.companyName || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || invoice.status === this.selectedStatus;
      const matchesCustomerType = !this.selectedCustomerType || invoice.customerType === this.selectedCustomerType;
      
      return matchesSearch && matchesStatus && matchesCustomerType;
    });
  }

  get paginatedInvoices(): Invoice[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredInvoices.slice(start, end);
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

  viewInvoiceDetail(invoice: Invoice): void {
    // Pass the selected invoice through route state so detail view can render individual vs business.
    this.router.navigate(['/dashboard/invoices', invoice.invoiceNo], {
      state: { invoice }
    });
  }

  generateInvoicePDF(invoice: Invoice): void {
    // This will generate a detailed invoice PDF for a specific invoice
    const columns: ExportColumn[] = [
      { header: 'Description', dataKey: 'description', width: 80 },
      { header: 'Quantity', dataKey: 'quantity', width: 25 },
      { header: 'Price', dataKey: 'price', width: 30 },
      { header: 'Total', dataKey: 'total', width: 30 }
    ];
    
    // Mock invoice items
    const items = [
      { description: 'Product 1', quantity: 2, price: 150.00, total: 300.00 },
      { description: 'Product 2', quantity: 1, price: 250.00, total: 250.00 }
    ];
    
    this.exportService.exportToPDF(items, columns, `Invoice_${invoice.invoiceNo}`, `Invoice ${invoice.invoiceNo}`);
  }

  exportPDF(): void {
    const columns: ExportColumn[] = [
      { header: 'Invoice No', dataKey: 'invoiceNo', width: 30 },
      { header: 'Date', dataKey: 'date', width: 25 },
      { header: 'Customer', dataKey: 'customer', width: 40 },
      { header: 'Amount', dataKey: 'amount', width: 25 },
      { header: 'Due', dataKey: 'due', width: 25 },
      { header: 'Payment Method', dataKey: 'paymentMethod', width: 35 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];
    
    this.exportService.exportToPDF(this.filteredInvoices, columns, 'Invoices_Report', 'Invoices Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Invoice No', dataKey: 'invoiceNo' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Due', dataKey: 'due' },
      { header: 'Payment Method', dataKey: 'paymentMethod' },
      { header: 'Status', dataKey: 'status' }
    ];
    
    this.exportService.exportToExcel(this.filteredInvoices, columns, 'Invoices');
  }
}
