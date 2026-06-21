import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

interface PurchaseOrder {
  date: string;
  reference: string;
  supplier: string;
  warehouse: string;
  status: string;
  grandTotal: number;
  deliveryDate: string;
  createdBy: string;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent {
  Math = Math;
  searchText = '';
  filterSupplier = '';
  filterStatus = '';
  rowsPerPage = 10;
  currentPage = 1;

  constructor(private exportService: ExportService) {}

  purchaseOrders: PurchaseOrder[] = [
    { date: '2024-03-19', reference: 'PO001', supplier: 'ABC Electronics', warehouse: 'Main Warehouse', status: 'Pending', grandTotal: 45000, deliveryDate: '2024-03-25', createdBy: 'Admin' },
    { date: '2024-03-18', reference: 'PO002', supplier: 'Tech Supplies Co', warehouse: 'Downtown Store', status: 'Sent', grandTotal: 32000, deliveryDate: '2024-03-24', createdBy: 'John Doe' },
    { date: '2024-03-17', reference: 'PO003', supplier: 'Global Traders', warehouse: 'Main Warehouse', status: 'Ordered', grandTotal: 78000, deliveryDate: '2024-03-27', createdBy: 'Admin' },
    { date: '2024-03-16', reference: 'PO004', supplier: 'Metro Wholesale', warehouse: 'North Branch', status: 'Completed', grandTotal: 56000, deliveryDate: '2024-03-22', createdBy: 'Jane Smith' },
    { date: '2024-03-15', reference: 'PO005', supplier: 'Prime Distributors', warehouse: 'Main Warehouse', status: 'Ordered', grandTotal: 92000, deliveryDate: '2024-03-28', createdBy: 'Admin' },
    { date: '2024-03-14', reference: 'PO006', supplier: 'Elite Supplies', warehouse: 'Downtown Store', status: 'Pending', grandTotal: 28000, deliveryDate: '2024-03-26', createdBy: 'John Doe' },
    { date: '2024-03-13', reference: 'PO007', supplier: 'Standard Trading', warehouse: 'North Branch', status: 'Sent', grandTotal: 64000, deliveryDate: '2024-03-29', createdBy: 'Jane Smith' },
    { date: '2024-03-12', reference: 'PO008', supplier: 'Quality Products Ltd', warehouse: 'Main Warehouse', status: 'Completed', grandTotal: 38000, deliveryDate: '2024-03-20', createdBy: 'Admin' },
    { date: '2024-03-11', reference: 'PO009', supplier: 'Supreme Imports', warehouse: 'Downtown Store', status: 'Ordered', grandTotal: 71000, deliveryDate: '2024-03-30', createdBy: 'John Doe' },
    { date: '2024-03-10', reference: 'PO010', supplier: 'Eagle Wholesale', warehouse: 'North Branch', status: 'Pending', grandTotal: 49000, deliveryDate: '2024-03-23', createdBy: 'Jane Smith' }
  ];

  get filteredOrders() {
    return this.purchaseOrders.filter(order => {
      const matchesSearch = !this.searchText || 
        order.reference.toLowerCase().includes(this.searchText.toLowerCase()) ||
        order.supplier.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesSupplier = !this.filterSupplier || order.supplier === this.filterSupplier;
      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;
      return matchesSearch && matchesSupplier && matchesStatus;
    });
  }

  get paginatedOrders() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredOrders.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filteredOrders.length / this.rowsPerPage);
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
      { header: 'Delivery Date', dataKey: 'deliveryDate' },
      { header: 'Created By', dataKey: 'createdBy' }
    ];
    this.exportService.exportToPDF(this.filteredOrders, columns, 'purchase-orders', 'Purchase Orders');
  }

  exportExcel() {
    const columns: ExportColumn[] = [
      { header: 'Date', dataKey: 'date' },
      { header: 'Reference', dataKey: 'reference' },
      { header: 'Supplier', dataKey: 'supplier' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Grand Total', dataKey: 'grandTotal' },
      { header: 'Delivery Date', dataKey: 'deliveryDate' },
      { header: 'Created By', dataKey: 'createdBy' }
    ];
    this.exportService.exportToExcel(this.filteredOrders, columns, 'purchase-orders');
  }

  viewOrder(order: PurchaseOrder) {
    console.log('View order:', order);
  }

  editOrder(order: PurchaseOrder) {
    console.log('Edit order:', order);
  }

  deleteOrder(order: PurchaseOrder) {
    if (confirm(`Are you sure you want to delete order ${order.reference}?`)) {
      this.purchaseOrders = this.purchaseOrders.filter(o => o.reference !== order.reference);
    }
  }
}
