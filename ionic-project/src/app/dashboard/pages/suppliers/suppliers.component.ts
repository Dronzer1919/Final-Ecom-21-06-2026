import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface Supplier {
  code: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  country: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  searchTerm: string = '';
  selectedStatus: string = '';
  rowsPerPage: number = 10;
  currentPage: number = 1;
  isLoading = true;

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  suppliers: Supplier[] = [
    { code: 'SU001', name: 'Apex Computers', avatar: '💻', email: 'apexcomputers@example.com', phone: '+16064712634', country: 'Germany', status: 'Active' },
    { code: 'SU002', name: 'Beats Headphones', avatar: '🎧', email: 'beatsheadphone@example.com', phone: '+16372895190', country: 'Japan', status: 'Active' },
    { code: 'SU003', name: 'Dazzle Shoes', avatar: '👟', email: 'dazzleshoes@example.com', phone: '+17589201739', country: 'USA', status: 'Active' },
    { code: 'SU004', name: 'Best Accessories', avatar: '📦', email: 'bestaccessories@example.com', phone: '+18934092467', country: 'Austria', status: 'Active' },
    { code: 'SU005', name: 'A-Z Store', avatar: '🏪', email: 'a2zstore@example.com', phone: '+12568749035', country: 'Turkey', status: 'Active' },
    { code: 'SU006', name: 'Hallen Hardwares', avatar: '🔨', email: 'hallenhardware@example.com', phone: '+19054674827', country: 'Mexico', status: 'Active' },
    { code: 'SU007', name: 'Aesthetic Bags', avatar: '👜', email: 'aestheticbags@example.com', phone: '+18943679365', country: 'France', status: 'Active' },
    { code: 'SU008', name: 'Alpha Mobiles', avatar: '📱', email: 'alphamobiles@example.com', phone: '+18647309410', country: 'Greece', status: 'Active' },
    { code: 'SU009', name: 'Sigma Chairs', avatar: '🪑', email: 'sigmachair@example.com', phone: '+ 17590174636', country: 'Italy', status: 'Active' },
    { code: 'SU010', name: 'Zenith Bags', avatar: '💼', email: 'zenithbags@example.com', phone: '+12564098473', country: 'China', status: 'Active' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.rowsPerPage);
  }

  get filteredSuppliers(): Supplier[] {
    return this.suppliers.filter(supplier => {
      const matchesSearch = !this.searchTerm || 
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || supplier.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedSuppliers(): Supplier[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredSuppliers.slice(start, end);
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

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  onView(supplier: Supplier): void {
    console.log('View supplier:', supplier);
  }

  onEdit(supplier: Supplier): void {
    console.log('Edit supplier:', supplier);
  }

  onDelete(supplier: Supplier): void {
    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      this.suppliers = this.suppliers.filter(s => s !== supplier);
      console.log('Deleted supplier:', supplier);
    }
  }

  exportPDF(): void {
    if (this.filteredSuppliers.length === 0) {
      alert('No suppliers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code', width: 25 },
      { header: 'Supplier Name', dataKey: 'name', width: 45 },
      { header: 'Email', dataKey: 'email', width: 50 },
      { header: 'Phone', dataKey: 'phone', width: 35 },
      { header: 'Country', dataKey: 'country', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.filteredSuppliers,
      columns,
      'suppliers-list',
      'Suppliers List'
    );
  }

  exportExcel(): void {
    if (this.filteredSuppliers.length === 0) {
      alert('No suppliers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code' },
      { header: 'Supplier Name', dataKey: 'name' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Country', dataKey: 'country' },
      { header: 'Status', dataKey: 'status' }
    ];

    this.exportService.exportToExcel(
      this.filteredSuppliers,
      columns,
      'suppliers-list',
      'Suppliers'
    );
  }
}
