import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ShimmerComponent } from '../../../components/shimmer';

interface VariantAttribute {
  id: number;
  variantName: string;
  values: string[];
  createdOn: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-variant-attributes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ShimmerComponent],
  templateUrl: './variant-attributes.component.html',
  styleUrls: ['./variant-attributes.component.scss']
})
export class VariantAttributesComponent implements OnInit {
  searchQuery: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  rowsPerPage: number = 10;
  Math = Math;
  isLoading = true;

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 800);
  }

  variantAttributes: VariantAttribute[] = [
    { id: 1, variantName: 'Size', values: ['Small', 'Medium', 'Large', 'XL', 'XXL'], createdOn: '20 Dec 2023, 09:30 AM', status: 'Active' },
    { id: 2, variantName: 'Color', values: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'], createdOn: '19 Dec 2023, 02:15 PM', status: 'Active' },
    { id: 3, variantName: 'Material', values: ['Cotton', 'Polyester', 'Silk', 'Wool', 'Denim'], createdOn: '18 Dec 2023, 11:45 AM', status: 'Active' },
    { id: 4, variantName: 'Capacity', values: ['128GB', '256GB', '512GB', '1TB'], createdOn: '17 Dec 2023, 04:20 PM', status: 'Active' },
    { id: 5, variantName: 'Storage', values: ['4GB', '8GB', '16GB', '32GB', '64GB'], createdOn: '16 Dec 2023, 10:10 AM', status: 'Active' },
    { id: 6, variantName: 'Style', values: ['Classic', 'Modern', 'Vintage', 'Casual'], createdOn: '15 Dec 2023, 03:25 PM', status: 'Inactive' },
    { id: 7, variantName: 'Flavor', values: ['Vanilla', 'Chocolate', 'Strawberry', 'Mango'], createdOn: '14 Dec 2023, 08:50 AM', status: 'Active' },
    { id: 8, variantName: 'Weight', values: ['500g', '1kg', '2kg', '5kg'], createdOn: '13 Dec 2023, 01:35 PM', status: 'Active' },
    { id: 9, variantName: 'Voltage', values: ['110V', '220V', '240V'], createdOn: '12 Dec 2023, 12:00 PM', status: 'Active' },
    { id: 10, variantName: 'Screen Size', values: ['13"', '15"', '17"', '21"', '27"'], createdOn: '11 Dec 2023, 09:45 AM', status: 'Active' }
  ];

  get filteredVariantAttributes(): VariantAttribute[] {
    return this.variantAttributes.filter(attr => {
      const matchesSearch = !this.searchQuery || 
        attr.variantName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        attr.values.some(value => value.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || attr.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  get paginatedVariantAttributes(): VariantAttribute[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredVariantAttributes.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVariantAttributes.length / this.rowsPerPage);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onRowsPerPageChange(): void {
    this.currentPage = 1;
  }

  getValuesString(values: string[]): string {
    return values.join(', ');
  }

  editVariantAttribute(id: number): void {
    console.log('Edit variant attribute:', id);
  }

  deleteVariantAttribute(id: number): void {
    console.log('Delete variant attribute:', id);
  }

  exportToPDF(): void {
    console.log('Export to PDF');
  }

  exportToExcel(): void {
    console.log('Export to Excel');
  }
}
