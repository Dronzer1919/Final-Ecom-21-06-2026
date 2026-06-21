import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

interface Purchase {
  date: string;
  reference: string;
  supplier: string;
  warehouse: string;
  purchaseStatus: string;
  grandTotal: number;
  paid: number;
  due: number;
  paymentStatus: string;
}

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './purchases.component.html',
  styleUrls: ['./purchases.component.scss']
})
export class PurchasesComponent {
  Math = Math;
  searchText = '';
  filterWarehouse = '';
  filterStatus = '';
  filterPaymentStatus = '';
  rowsPerPage = 10;
  currentPage = 1;

  constructor(private exportService: ExportService) {}

  purchases: Purchase[] = [
    { date: '2024-03-19', reference: 'PU001', supplier: 'ABC Electronics', warehouse: 'Main Warehouse', purchaseStatus: 'Received', grandTotal: 45000, paid: 45000, due: 0, paymentStatus: 'Paid' },
    { date: '2024-03-18', reference: 'PU002', supplier: 'Tech Supplies Co', warehouse: 'Downtown Store', purchaseStatus: 'Pending', grandTotal: 32000, paid: 0, due: 32000, paymentStatus: 'Unpaid' },
    { date: '2024-03-17', reference: 'PU003', supplier: 'Global Traders', warehouse: 'Main Warehouse', purchaseStatus: 'Ordered', grandTotal: 78000, paid: 40000, due: 38000, paymentStatus: 'Partial' },
    { date: '2024-03-16', reference: 'PU004', supplier: 'Metro Wholesale', warehouse: 'North Branch', purchaseStatus: 'Received', grandTotal: 56000, paid: 56000, due: 0, paymentStatus: 'Paid' },
    { date: '2024-03-15', reference: 'PU005', supplier: 'Prime Distributors', warehouse: 'Main Warehouse', purchaseStatus: 'Received', grandTotal: 92000, paid: 92000, due: 0, paymentStatus: 'Paid' },
    { date: '2024-03-14', reference: 'PU006', supplier: 'Elite Supplies', warehouse: 'Downtown Store', purchaseStatus: 'Pending', grandTotal: 28000, paid: 15000, due: 13000, paymentStatus: 'Partial' },
    { date: '2024-03-13', reference: 'PU007', supplier: 'Standard Trading', warehouse: 'North Branch', purchaseStatus: 'Ordered', grandTotal: 64000, paid: 0, due: 64000, paymentStatus: 'Unpaid' },
    { date: '2024-03-12', reference: 'PU008', supplier: 'Quality Products Ltd', warehouse: 'Main Warehouse', purchaseStatus: 'Received', grandTotal: 38000, paid: 38000, due: 0, paymentStatus: 'Paid' },
    { date: '2024-03-11', reference: 'PU009', supplier: 'Supreme Imports', warehouse: 'Downtown Store', purchaseStatus: 'Received', grandTotal: 71000, paid: 71000, due: 0, paymentStatus: 'Paid' },
    { date: '2024-03-10', reference: 'PU010', supplier: 'Eagle Wholesale', warehouse: 'North Branch', purchaseStatus: 'Pending', grandTotal: 49000, paid: 25000, due: 24000, paymentStatus: 'Partial' }
  ];

  get filteredPurchases() {
    return this.purchases.filter(purchase => {
      const matchesSearch = !this.searchText || 
        purchase.reference.toLowerCase().includes(this.searchText.toLowerCase()) ||
        purchase.supplier.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesWarehouse = !this.filterWarehouse || purchase.warehouse === this.filterWarehouse;
      const matchesStatus = !this.filterStatus || purchase.purchaseStatus === this.filterStatus;
      const matchesPaymentStatus = !this.filterPaymentStatus || purchase.paymentStatus === this.filterPaymentStatus;
      return matchesSearch && matchesWarehouse && matchesStatus && matchesPaymentStatus;
    });
  }

  get paginatedPurchases() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredPurchases.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredPurchases.length / this.rowsPerPage);
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
      { header: 'Status', dataKey: 'purchaseStatus' },
      { header: 'Grand Total (₹)', dataKey: 'grandTotal' },
      { header: 'Paid (₹)', dataKey: 'paid' },
      { header: 'Due (₹)', dataKey: 'due' },
      { header: 'Payment Status', dataKey: 'paymentStatus' }
    ];
    this.exportService.exportToPDF(this.filteredPurchases, columns, 'purchases', 'Purchases List');
  }

  exportExcel() {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Status', dataKey: 'purchaseStatus' },
      { header: 'Grand Total', dataKey: 'grandTotal' },
      { header: 'Paid', dataKey: 'paid' },
      { header: 'Due', dataKey: 'due' },
      { header: 'Payment Status', dataKey: 'paymentStatus' }
    ];
    this.exportService.exportToExcel(this.filteredPurchases, columns, 'purchases');
  }

  viewPurchase(purchase: Purchase) {
    console.log('View purchase:', purchase);
  }

  editPurchase(purchase: Purchase) {
    console.log('Edit purchase:', purchase);
  }

  deletePurchase(purchase: Purchase) {
    if (confirm(`Are you sure you want to delete purchase ${purchase.reference}?`)) {
      this.purchases = this.purchases.filter(p => p.reference !== purchase.reference);
    }
  }
}
