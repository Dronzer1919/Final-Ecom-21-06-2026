import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExportService, ExportColumn } from '../../../services/export.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerComponent } from '../../../components/shimmer';

interface Store {
  name: string;
  userName: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-stores',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent, ShimmerComponent],
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
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

  stores: Store[] = [
    { name: 'Electro Mart', userName: 'johnsmith', email: 'electromart@example.com', phone: '+12408145785', status: 'Active' },
    { name: 'Quantum Gadgets', userName: 'janedoe', email: 'quantum@example.com', phone: '+13179964582', status: 'Active' },
    { name: 'Prime Bazaar', userName: 'sarahlee', email: 'primebazaar@example.com', phone: '+12796181487', status: 'Active' },
    { name: 'Gadget World', userName: 'alexbrown', email: 'gadgetworld@example.com', phone: '+17538547943', status: 'Active' },
    { name: 'Volt Vault', userName: 'jessawhite', email: 'voltvault@example.com', phone: '+13758112475', status: 'Active' },
    { name: 'Elite Retail', userName: 'emilydavis', email: 'eliteretail@example.com', phone: '+17598341894', status: 'Active' },
    { name: 'Prime Mart', userName: 'tomharris', email: 'primemart@example.com', phone: '+12973548678', status: 'Active' },
    { name: 'NexTech Store', userName: 'sarahjonson', email: 'nextech@example.com', phone: '+13147898357', status: 'Active' },
    { name: 'Urban Mart', userName: 'laurawilson', email: 'urbanmart@example.com', phone: '+13975948636', status: 'Active' },
    { name: 'Travel Mart', userName: 'robertwhite', email: 'travelmart@example.com', phone: '+12678543561', status: 'Active' }
  ];

  get totalPages(): number {
    return Math.ceil(this.filteredStores.length / this.rowsPerPage);
  }

  get filteredStores(): Store[] {
    return this.stores.filter(store => {
      const matchesSearch = !this.searchTerm || 
        store.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.userName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        store.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || store.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedStores(): Store[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredStores.slice(start, end);
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

  onView(store: Store): void {
    console.log('View store:', store);
  }

  onEdit(store: Store): void {
    console.log('Edit store:', store);
  }

  onDelete(store: Store): void {
    if (confirm(`Are you sure you want to delete ${store.name}?`)) {
      this.stores = this.stores.filter(s => s !== store);
      console.log('Deleted store:', store);
    }
  }

  exportPDF(): void {
    if (this.filteredStores.length === 0) {
      alert('No stores to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Store Name', dataKey: 'name', width: 50 },
      { header: 'User Name', dataKey: 'userName', width: 35 },
      { header: 'Email', dataKey: 'email', width: 50 },
      { header: 'Phone', dataKey: 'phone', width: 35 },
      { header: 'Status', dataKey: 'status', width: 25 }
    ];

    this.exportService.exportToPDF(
      this.filteredStores,
      columns,
      'stores-list',
      'Stores List'
    );
  }

  exportExcel(): void {
    if (this.filteredStores.length === 0) {
      alert('No stores to export');
      return;
    }

    const columns: ExportColumn[] = [
      { header: 'Store Name', dataKey: 'name' },
      { header: 'User Name', dataKey: 'userName' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Status', dataKey: 'status' }
    ];

    this.exportService.exportToExcel(
      this.filteredStores,
      columns,
      'stores-list',
      'Stores'
    );
  }
}
