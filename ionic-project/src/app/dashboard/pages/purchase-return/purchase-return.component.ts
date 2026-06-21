import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

interface PurchaseReturn {
  date: string;
  reference: string;
  supplier: string;
  warehouse: string;
  status: string;
  grandTotal: number;
  reason: string;
  returnedBy: string;
}

@Component({
  selector: 'app-purchase-return',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './purchase-return.component.html',
  styleUrls: ['./purchase-return.component.scss']
})
export class PurchaseReturnComponent {
  Math = Math;
  searchText = '';
  filterWarehouse = '';
  filterStatus = '';
  rowsPerPage = 10;
  currentPage = 1;

  constructor(private exportService: ExportService) {}

  purchaseReturns: PurchaseReturn[] = [
    { date: '2024-03-19', reference: 'PR001', supplier: 'ABC Electronics', warehouse: 'Main Warehouse', status: 'Completed', grandTotal: 12000, reason: 'Damaged Products', returnedBy: 'Admin' },
    { date: '2024-03-18', reference: 'PR002', supplier: 'Tech Supplies Co', warehouse: 'Downtown Store', status: 'Pending', grandTotal: 8500, reason: 'Wrong Items Received', returnedBy: 'John Doe' },
    { date: '2024-03-17', reference: 'PR003', supplier: 'Global Traders', warehouse: 'Main Warehouse', status: 'Processing', grandTotal: 15000, reason: 'Quality Issues', returnedBy: 'Admin' },
    { date: '2024-03-16', reference: 'PR004', supplier: 'Metro Wholesale', warehouse: 'North Branch', status: 'Completed', grandTotal: 9200, reason: 'Defective Products', returnedBy: 'Jane Smith' },
    { date: '2024-03-15', reference: 'PR005', supplier: 'Prime Distributors', warehouse: 'Main Warehouse', status: 'Completed', grandTotal: 18500, reason: 'Expired Products', returnedBy: 'Admin' },
    { date: '2024-03-14', reference: 'PR006', supplier: 'Elite Supplies', warehouse: 'Downtown Store', status: 'Pending', grandTotal: 6700, reason: 'Damaged in Transit', returnedBy: 'John Doe' },
    { date: '2024-03-13', reference: 'PR007', supplier: 'Standard Trading', warehouse: 'North Branch', status: 'Processing', grandTotal: 11300, reason: 'Incorrect Specifications', returnedBy: 'Jane Smith' },
    { date: '2024-03-12', reference: 'PR008', supplier: 'Quality Products Ltd', warehouse: 'Main Warehouse', status: 'Completed', grandTotal: 7400, reason: 'Duplicate Order', returnedBy: 'Admin' },
    { date: '2024-03-11', reference: 'PR009', supplier: 'Supreme Imports', warehouse: 'Downtown Store', status: 'Completed', grandTotal: 13800, reason: 'Product Recall', returnedBy: 'John Doe' },
    { date: '2024-03-10', reference: 'PR010', supplier: 'Eagle Wholesale', warehouse: 'North Branch', status: 'Pending', grandTotal: 10200, reason: 'Packaging Issues', returnedBy: 'Jane Smith' }
  ];

  get filteredReturns() {
    return this.purchaseReturns.filter(returnItem => {
      const matchesSearch = !this.searchText || 
        returnItem.reference.toLowerCase().includes(this.searchText.toLowerCase()) ||
        returnItem.supplier.toLowerCase().includes(this.searchText.toLowerCase()) ||
        returnItem.reason.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesWarehouse = !this.filterWarehouse || returnItem.warehouse === this.filterWarehouse;
      const matchesStatus = !this.filterStatus || returnItem.status === this.filterStatus;
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }

  get paginatedReturns() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredReturns.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredReturns.length / this.rowsPerPage);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  exportPDF() {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Grand Total (₹)', dataKey: 'grandTotal' },
      { header: 'Reason', dataKey: 'reason' },
      { header: 'Returned By', dataKey: 'returnedBy' }
    ];
    this.exportService.exportToPDF(this.filteredReturns, columns, 'purchase-returns', 'Purchase Returns');
  }

  exportExcel() {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Grand Total', dataKey: 'grandTotal' },
      { header: 'Reason', dataKey: 'reason' },
      { header: 'Returned By', dataKey: 'returnedBy' }
    ];
    this.exportService.exportToExcel(this.filteredReturns, columns, 'purchase-returns');
  }

  viewReturn(returnItem: PurchaseReturn) {
    console.log('View return:', returnItem);
  }

  editReturn(returnItem: PurchaseReturn) {
    console.log('Edit return:', returnItem);
  }

  deleteReturn(returnItem: PurchaseReturn) {
    if (confirm(`Are you sure you want to delete return ${returnItem.reference}?`)) {
      this.purchaseReturns = this.purchaseReturns.filter(r => r.reference !== returnItem.reference);
    }
  }
}
