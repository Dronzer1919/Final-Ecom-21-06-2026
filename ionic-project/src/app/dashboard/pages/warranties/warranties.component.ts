import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

interface Warranty {
  name: string;
  description: string;
  duration: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-warranties',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeButtonComponent],
  templateUrl: './warranties.component.html',
  styleUrls: ['./warranties.component.scss']
})
export class WarrantiesComponent {
  searchTerm: string = '';
  selectedStatus: string = 'Status';
  rowsPerPage: number = 10;
  currentPage: number = 1;

  warranties: Warranty[] = [
    { name: 'Replacement Warranty', description: 'Covers replacement of faulty items', duration: '2 Year', status: 'Active' },
    { name: 'On-Site Warranty', description: 'Product repairs done at the customer\'s location', duration: '1 Year', status: 'Active' },
    { name: 'Accidental Protection Plan', description: 'Coverage for accidental damage', duration: '6 Months', status: 'Active' },
    { name: 'Labor-Only Warranty', description: 'Covers only labor costs, not parts', duration: '6 Months', status: 'Active' },
    { name: 'No-Cost Repairs', description: 'No charge for repairs during warranty period', duration: '3 Months', status: 'Active' },
    { name: 'Accidental Damage', description: 'Coverage for unexpected damage', duration: '6 Months', status: 'Active' },
    { name: 'Wear & Tear Warranty', description: 'Covers specific product aging issues', duration: '1 Year', status: 'Active' },
    { name: 'Money-Back Guarantee', description: 'Refund within a specified period', duration: '3 Months', status: 'Active' },
    { name: 'Water Damage Warranty', description: 'Coverage for water-related issues', duration: '6 Months', status: 'Active' },
    { name: 'Power Surge Protection', description: 'Covers damage from power surges', duration: '6 Months', status: 'Active' }
  ];

  get totalPages(): number {
    return Math.ceil(this.warranties.length / this.rowsPerPage);
  }

  get paginatedWarranties(): Warranty[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.warranties.slice(start, end);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
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

  onRowsPerPageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.rowsPerPage = parseInt(select.value);
    this.currentPage = 1;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  editWarranty(warranty: Warranty): void {
    console.log('Edit warranty:', warranty);
  }

  deleteWarranty(warranty: Warranty): void {
    console.log('Delete warranty:', warranty);
  }

  exportPDF(): void {
    console.log('Export to PDF');
  }

  exportExcel(): void {
    console.log('Export to Excel');
  }

  refresh(): void {
    console.log('Refresh data');
  }

  addBrand(): void {
    console.log('Add new warranty');
  }
}
