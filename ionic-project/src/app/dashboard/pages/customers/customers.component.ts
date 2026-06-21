import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface Customer {
  code: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  country: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
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

  customers: Customer[] = [
    { code: 'CU001', name: 'Carl Evans', avatar: '👤', email: 'carlevans@example.com', phone: '+12163547758', country: 'Germany', status: 'Active' },
    { code: 'CU002', name: 'Minerva Ramirez', avatar: '👤', email: 'raminz@example.com', phone: '+13876529810', country: 'Japan', status: 'Active' },
    { code: 'CU003', name: 'Robert Lemon', avatar: '👤', email: 'robertl@example.com', phone: '+15382789414', country: 'USA', status: 'Active' },
    { code: 'CU004', name: 'Patricia Lewis', avatar: '👤', email: 'patricia@example.com', phone: '+18913094627', country: 'Austria', status: 'Active' },
    { code: 'CU005', name: 'Mark Joslyn', avatar: '👤', email: 'markjoslyn@example.com', phone: '+14670219025', country: 'Turkey', status: 'Active' },
    { code: 'CU006', name: 'Marsha Betts', avatar: '👤', email: 'marshabetts@example.com', phone: '+10913278319', country: 'Mexico', status: 'Active' },
    { code: 'CU007', name: 'Daniel Jude', avatar: '👤', email: 'dacdude@example.com', phone: '+19132682947', country: 'France', status: 'Active' },
    { code: 'CU008', name: 'Emma Bates', avatar: '👤', email: 'emmabates@example.com', phone: '+18674832909', country: 'Greece', status: 'Active' },
    { code: 'CU009', name: 'Richard Patrick', avatar: '👤', email: 'richard@example.com', phone: '+12976194733', country: 'Italy', status: 'Active' },
    { code: 'CU010', name: 'Michelle Robinson', avatar: '👤', email: 'robinson@example.com', phone: '+19187850925', country: 'China', status: 'Active' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredCustomers.length / this.rowsPerPage);
  }

  get filteredCustomers(): Customer[] {
    return this.customers.filter(customer => {
      const matchesSearch = !this.searchTerm || 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || customer.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredCustomers.slice(start, end);
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

  onView(customer: Customer): void {
    console.log('View customer:', customer);
  }

  onEdit(customer: Customer): void {
    console.log('Edit customer:', customer);
  }

  onDelete(customer: Customer): void {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      this.customers = this.customers.filter(c => c !== customer);
      console.log('Deleted customer:', customer);
    }
  }

  exportPDF(): void {
    if (this.filteredCustomers.length === 0) {
      alert('No customers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code', width: 25 },
      { header: 'Customer Name', dataKey: 'name', width: 45 },
      { header: 'Email', dataKey: 'email', width: 50 },
      { header: 'Phone', dataKey: 'phone', width: 35 },
      { header: 'Country', dataKey: 'country', width: 30 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.filteredCustomers,
      columns,
      'customers-list',
      'Customers List'
    );
  }

  exportExcel(): void {
    if (this.filteredCustomers.length === 0) {
      alert('No customers to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Code', dataKey: 'code' },
      { header: 'Customer Name', dataKey: 'name' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Country', dataKey: 'country' },
      { header: 'Status', dataKey: 'status' }
    ];

    this.exportService.exportToExcel(
      this.filteredCustomers,
      columns,
      'customers-list',
      'Customers'
    );
  }
}
