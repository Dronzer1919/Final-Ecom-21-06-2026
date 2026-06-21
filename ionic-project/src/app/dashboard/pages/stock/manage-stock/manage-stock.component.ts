import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../../services/export.service';
import { ThemeButtonComponent } from '../../../../components/buttons/theme-button/theme-button.component';
import { ShimmerTableComponent } from '../../../../components/shimmer/shimmer-table/shimmer-table.component';

interface Stock {
  productCode: string;
  productName: string;
  category: string;
  warehouse: string;
  quantity: number;
  alertQuantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

@Component({
  selector: 'app-manage-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ThemeButtonComponent, ShimmerTableComponent],
  templateUrl: './manage-stock.component.html',
  styleUrls: ['./manage-stock.component.scss']
})
export class ManageStockComponent implements OnInit {
  searchTerm: string = '';
  selectedWarehouse: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  isLoading: boolean = true;

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    setTimeout(() => { this.isLoading = false; }, 1200);
  }

  stocks: Stock[] = [
    { productCode: 'P001', productName: 'MacBook Pro 14"', category: 'Laptops', warehouse: 'Warehouse 1', quantity: 45, alertQuantity: 10, status: 'In Stock', lastUpdated: '2024-01-15' },
    { productCode: 'P002', productName: 'iPhone 15 Pro', category: 'Mobiles', warehouse: 'Warehouse 1', quantity: 8, alertQuantity: 15, status: 'Low Stock', lastUpdated: '2024-01-15' },
    { productCode: 'P003', productName: 'Samsung Galaxy S24', category: 'Mobiles', warehouse: 'Warehouse 2', quantity: 0, alertQuantity: 10, status: 'Out of Stock', lastUpdated: '2024-01-14' },
    { productCode: 'P004', productName: 'Dell XPS 15', category: 'Laptops', warehouse: 'Warehouse 2', quantity: 25, alertQuantity: 8, status: 'In Stock', lastUpdated: '2024-01-14' },
    { productCode: 'P005', productName: 'iPad Air', category: 'Tablets', warehouse: 'Warehouse 1', quantity: 12, alertQuantity: 10, status: 'In Stock', lastUpdated: '2024-01-13' },
    { productCode: 'P006', productName: 'Sony WH-1000XM5', category: 'Audio', warehouse: 'Warehouse 3', quantity: 5, alertQuantity: 15, status: 'Low Stock', lastUpdated: '2024-01-13' },
    { productCode: 'P007', productName: 'Logitech MX Master 3', category: 'Accessories', warehouse: 'Warehouse 1', quantity: 35, alertQuantity: 20, status: 'In Stock', lastUpdated: '2024-01-12' },
    { productCode: 'P008', productName: 'HP LaserJet Pro', category: 'Printers', warehouse: 'Warehouse 2', quantity: 0, alertQuantity: 5, status: 'Out of Stock', lastUpdated: '2024-01-12' },
    { productCode: 'P009', productName: 'Canon EOS R6', category: 'Cameras', warehouse: 'Warehouse 3', quantity: 18, alertQuantity: 8, status: 'In Stock', lastUpdated: '2024-01-11' },
    { productCode: 'P010', productName: 'LG UltraWide Monitor', category: 'Monitors', warehouse: 'Warehouse 1', quantity: 22, alertQuantity: 10, status: 'In Stock', lastUpdated: '2024-01-11' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredStocks.length / this.rowsPerPage);
  }

  get filteredStocks(): Stock[] {
    return this.stocks.filter(stock => {
      const matchesSearch = !this.searchTerm || 
        stock.productCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        stock.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        stock.category.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesWarehouse = !this.selectedWarehouse || stock.warehouse === this.selectedWarehouse;
      const matchesStatus = !this.selectedStatus || stock.status === this.selectedStatus;
      
      return matchesSearch && matchesWarehouse && matchesStatus;
    });
  }

  get paginatedStocks(): Stock[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredStocks.slice(start, end);
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
      { header: 'Product Code', dataKey: 'productCode', width: 30 },
      { header: 'Product Name', dataKey: 'productName', width: 50 },
      { header: 'Category', dataKey: 'category', width: 30 },
      { header: 'Warehouse', dataKey: 'warehouse', width: 35 },
      { header: 'Quantity', dataKey: 'quantity', width: 25 },
      { header: 'Alert Quantity', dataKey: 'alertQuantity', width: 30 },
      { header: 'Status', dataKey: 'status', width: 30 },
      { header: 'Last Updated', dataKey: 'lastUpdated', width: 30 }
    ];
    
    this.exportService.exportToPDF(this.filteredStocks, columns, 'Stock_Management_Report', 'Stock Management Report');
  }

  exportExcel(): void {
    const columns: ExportColumn[] = [
      { header: 'Product Code', dataKey: 'productCode' },
      { header: 'Product Name', dataKey: 'productName' },
      { header: 'Category', dataKey: 'category' },
      { header: 'Warehouse', dataKey: 'warehouse' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Alert Quantity', dataKey: 'alertQuantity' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Last Updated', dataKey: 'lastUpdated' }
    ];
    
    this.exportService.exportToExcel(this.filteredStocks, columns, 'Stock_Management');
  }
}
